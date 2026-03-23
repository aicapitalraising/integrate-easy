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
    const { url } = await req.json()

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    console.log('Scraping website:', normalizedUrl)

    // Fetch the website HTML
    let htmlContent = ''
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      })
      htmlContent = await res.text()
    } catch (fetchErr) {
      console.error('Fetch failed:', fetchErr)
      return new Response(JSON.stringify({ error: 'Could not fetch website' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Trim to first 15k chars to stay within token limits
    const trimmedHtml = htmlContent.substring(0, 15000)

    // Use Gemini to extract structured info
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'AI key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const prompt = `Analyze this investment fund website HTML and extract ALL available information. Return a JSON object with these fields (use null for anything not found):

{
  "company_name": "company or fund name",
  "speaker_name": "founder/CEO/speaker name",
  "industry_focus": "e.g. multifamily real estate, oil & gas, etc.",
  "targeted_returns": "e.g. 10%, 15-20%",
  "hold_period": "e.g. 3-5 years",
  "distribution_schedule": "e.g. Monthly, Quarterly",
  "investment_range": "e.g. $25k - $500k",
  "min_investment": "e.g. 50000",
  "tax_advantages": "any tax benefits mentioned",
  "credibility": "track record, years in business, AUM, past returns",
  "fund_history": "background/history of the fund or company",
  "fund_type": "e.g. Real Estate Fund, Private Equity",
  "raise_amount": "target raise amount if mentioned",
  "contact_email": "contact email if found",
  "contact_phone": "phone number if found"
}

Only return valid JSON, no other text.

Website HTML:
${trimmedHtml}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    // Extract JSON from the response (may be wrapped in markdown code block)
    let jsonStr = rawText
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    let extracted: Record<string, unknown> = {}
    try {
      extracted = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse Gemini response:', rawText)
      return new Response(JSON.stringify({ error: 'Failed to parse website data' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Extracted data:', JSON.stringify(extracted))

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Scrape error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
