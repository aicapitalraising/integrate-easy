import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RETARGETIQ_BASE = 'https://app.retargetiq.com/api'

async function callRetargetIQ(endpoint: string, params: Record<string, string>, apiKey: string) {
  const url = new URL(`${RETARGETIQ_BASE}/${endpoint}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  
  const res = await fetch(url.toString(), {
    headers: { 'x-api-key': apiKey },
  })
  
  if (!res.ok) {
    console.error(`RetargetIQ ${endpoint} failed: ${res.status}`)
    return null
  }
  
  return await res.json()
}

function compareNames(leadName: string, enrichedFirst: string, enrichedLast: string): 'verified' | 'spouse' | 'no-match' {
  const parts = leadName.toLowerCase().trim().split(/\s+/)
  const leadFirst = parts[0] || ''
  const leadLast = parts[parts.length - 1] || ''
  const eFirst = (enrichedFirst || '').toLowerCase()
  const eLast = (enrichedLast || '').toLowerCase()

  if (leadFirst === eFirst && leadLast === eLast) return 'verified'
  if (leadLast === eLast) return 'spouse'
  return 'no-match'
}

function extractEnrichmentFields(raw: Record<string, unknown>) {
  const identity = raw.identity || raw.Identity || null
  const address = raw.address || raw.Address || null
  const financial = raw.financial || raw.Financial || null
  const investments = raw.investments || raw.Investments || null
  const home = raw.home || raw.Home || null
  const household = raw.household || raw.Household || null
  const education = raw.education || raw.Education || null
  const interests = raw.interests || raw.Interests || []
  const vehicles = raw.vehicles || raw.Vehicles || []
  const companies = raw.companies || raw.Companies || []
  const phones = raw.phones || raw.Phones || []
  const emails = raw.emails || raw.Emails || []
  const donations = raw.donations || raw.Donations || []
  const reading = raw.reading || raw.Reading || []

  return { identity, address, financial, investments, home, household, education, interests, vehicles, companies, phones, emails, donations, reading }
}

function calculateQualification(financial: Record<string, unknown> | null, investments: Record<string, unknown> | null): { tier: string; score: number; routing: string } {
  let score = 0
  
  if (financial) {
    const income = String(financial.householdIncome || '')
    const netWorth = String(financial.householdNetWorth || '')
    const credit = String(financial.creditRange || '')
    
    if (income.includes('300,000') || income.includes('250,000')) score += 25
    else if (income.includes('200,000') || income.includes('175,000') || income.includes('150,000')) score += 15
    else score += 5
    
    if (netWorth.includes('$2.5M') || netWorth.includes('$5M') || netWorth.includes('$10M')) score += 30
    else if (netWorth.includes('$1M')) score += 20
    else if (netWorth.includes('$750K') || netWorth.includes('$500K')) score += 10
    
    if (credit.includes('800') || credit.includes('750')) score += 15
    else if (credit.includes('700')) score += 8
    
    score += Math.min((financial.financialPower as number || 0) * 2, 15)
  }
  
  if (investments) {
    if (investments.investor) score += 10
    if (investments.ownsStocksAndBonds) score += 5
  }
  
  score = Math.min(score, 100)
  
  let tier: string
  if (score >= 65) { tier = 'qualified' }
  else if (score >= 35) { tier = 'borderline' }
  else { tier = 'unqualified' }
  const routing = 'closer'
  
  return { tier, score, routing }
}

/** Waterfall: try phone → email → phone2 → email2, stop on first+last name match */
async function waterfallEnrich(
  name: string,
  phone: string,
  email: string,
  phone2: string,
  email2: string,
  apiKey: string
) {
  const attempts: { type: 'phone' | 'email'; value: string }[] = []
  if (phone) attempts.push({ type: 'phone', value: phone.replace(/\D/g, '') })
  if (email) attempts.push({ type: 'email', value: email })
  if (phone2) attempts.push({ type: 'phone', value: phone2.replace(/\D/g, '') })
  if (email2) attempts.push({ type: 'email', value: email2 })

  for (const attempt of attempts) {
    const endpoint = attempt.type === 'phone' ? 'GetDataByPhone' : 'GetDataByEmail'
    const paramKey = attempt.type === 'phone' ? 'phone' : 'email'
    const rawData = await callRetargetIQ(endpoint, { [paramKey]: attempt.value, slug: 'high-performance-ads' }, apiKey)
    
    if (!rawData) continue

    const fields = extractEnrichmentFields(rawData)
    const identityData = fields.identity as Record<string, string> | null

    if (!identityData) continue

    const matchType = name
      ? compareNames(name, identityData.firstName, identityData.lastName)
      : 'verified'

    if (matchType === 'verified' || matchType === 'spouse') {
      const qual = calculateQualification(
        fields.financial as Record<string, unknown> | null,
        fields.investments as Record<string, unknown> | null
      )
      return {
        matched: true,
        status: matchType,
        method: attempt.type,
        score: qual.score,
        tier: qual.tier,
        fields,
      }
    }
  }

  return { matched: false }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RETARGETIQ_API_KEY = Deno.env.get('RETARGETIQ_API_KEY')
    if (!RETARGETIQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'RETARGETIQ_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { leadId, name, email, phone, phone2, email2, mode } = await req.json()

    // Inline mode: enrich without DB
    if (mode === 'inline') {
      const result = await waterfallEnrich(name || '', phone || '', email || '', phone2 || '', email2 || '', RETARGETIQ_API_KEY)

      if (!result.matched) {
        return new Response(JSON.stringify({ status: 'no-match' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        status: result.status,
        score: result.score,
        tier: result.tier,
        financial: result.fields!.financial,
        identity: result.fields!.identity,
        address: result.fields!.address,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'leadId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch lead
    const { data: lead, error: fetchErr } = await supabase.from('leads').select('*').eq('id', leadId).single()
    if (fetchErr || !lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = await waterfallEnrich(
      lead.lead_name || '',
      lead.lead_phone || '',
      lead.lead_email || '',
      '', '', // no secondary fields on DB leads
      RETARGETIQ_API_KEY
    )

    if (!result.matched) {
      await supabase.from('leads').update({
        enrichment_status: 'no-match',
        enrichment_method: 'phone',
      }).eq('id', leadId)

      return new Response(JSON.stringify({ status: 'no-match' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { fields } = result

    await supabase.from('leads').update({
      enrichment_status: result.status,
      enrichment_method: result.method,
      identity: fields!.identity,
      address: fields!.address,
      financial: fields!.financial,
      investments: fields!.investments,
      home: fields!.home,
      household: fields!.household,
      education: fields!.education,
      interests: Array.isArray(fields!.interests) ? fields!.interests : [],
      vehicles: fields!.vehicles,
      companies: fields!.companies,
      phones: fields!.phones,
      emails: fields!.emails,
      donations: Array.isArray(fields!.donations) ? fields!.donations : [],
      reading: Array.isArray(fields!.reading) ? fields!.reading : [],
      qualification_tier: result.tier,
      qualification_score: result.score,
      routing_destination: 'closer',
    }).eq('id', leadId)

    return new Response(JSON.stringify({ status: result.status, score: result.score, tier: result.tier }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Enrichment error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
