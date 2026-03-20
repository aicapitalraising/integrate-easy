import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()

    // Accept flexible field names (camelCase or snake_case)
    const leadName = body.leadName || body.lead_name || body.name || body.full_name || 'Unknown'
    const leadEmail = body.leadEmail || body.lead_email || body.email || null
    const leadPhone = body.leadPhone || body.lead_phone || body.phone || null
    const source = body.source || body.utm_source || 'Direct'
    const investmentRange = body.investmentRange || body.investment_range || null
    const accredited = body.accredited ?? false
    const status = body.status || 'new'

    // Check for existing lead by email to avoid duplicates
    let data: Record<string, unknown> | null = null
    let error: { message: string } | null = null

    if (leadEmail) {
      const { data: existing } = await supabase
        .from('leads')
        .select('*')
        .eq('lead_email', leadEmail)
        .order('created_at', { ascending: false })
        .limit(1)

      if (existing && existing.length > 0) {
        // Update existing lead
        const result = await supabase
          .from('leads')
          .update({
            lead_name: leadName,
            lead_phone: leadPhone || existing[0].lead_phone,
            source: source || existing[0].source,
            investment_range: investmentRange || existing[0].investment_range,
            accredited: accredited || existing[0].accredited,
            status: status === 'new' ? existing[0].status : status,
          })
          .eq('id', existing[0].id)
          .select()
          .single()

        data = result.data
        error = result.error
      }
    }

    if (!data) {
      // Create new lead
      const result = await supabase.from('leads').insert({
        lead_name: leadName,
        lead_email: leadEmail,
        lead_phone: leadPhone,
        source,
        investment_range: investmentRange,
        accredited,
        status,
        enrichment_status: 'pending',
      }).select().single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Insert error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Trigger enrichment asynchronously
    try {
      const enrichUrl = `${supabaseUrl}/functions/v1/retargetiq-enrich`
      fetch(enrichUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ leadId: data.id }),
      }).catch(e => console.error('Enrichment trigger failed:', e))
    } catch (e) {
      console.error('Enrichment trigger error:', e)
    }

    // Sync to GHL asynchronously
    try {
      const ghlUrl = `${supabaseUrl}/functions/v1/ghl-sync`
      fetch(ghlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'sync-lead',
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          source,
          investmentRange,
          accredited,
          tags: ['AI Capital Raising', 'New Lead', source],
        }),
      }).catch(e => console.error('GHL sync trigger failed:', e))
    } catch (e) {
      console.error('GHL sync trigger error:', e)
    }

    return new Response(JSON.stringify({ success: true, leadId: data.id }), {
      status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Lead intake error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
