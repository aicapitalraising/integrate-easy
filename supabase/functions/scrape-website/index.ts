const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    // Try fetching the website with multiple user agents
    let htmlContent = ''
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    ]

    for (const ua of userAgents) {
      try {
        const res = await fetch(normalizedUrl, {
          headers: {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          redirect: 'follow',
        })
        const text = await res.text()
        if (text.length > htmlContent.length) {
          htmlContent = text
        }
        if (htmlContent.length > 1000) break
      } catch (e) {
        console.error('Fetch attempt failed:', e)
      }
    }

    console.log('Fetched HTML length:', htmlContent.length)

    // Strip script/style tags to get cleaner text content
    let cleanContent = htmlContent
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // If cleaned content is too short, the site is probably JS-rendered
    // Use Gemini with Google Search grounding to look up the website
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!lovableKey && !geminiKey) {
      return new Response(JSON.stringify({ error: 'AI key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const useGrounding = cleanContent.length < 500

    console.log('Clean content length:', cleanContent.length, '| Using grounding:', useGrounding)

    // Trim content
    const trimmedContent = cleanContent.substring(0, 12000)

    const prompt = useGrounding
      ? `Look up the website ${normalizedUrl} and extract all available information about this investment fund or company. Return a JSON object with these fields (use null for anything not found):

{
  "company_name": "company or fund name",
  "speaker_name": "founder/CEO/speaker name",
  "industry_focus": "e.g. multifamily real estate, oil & gas, etc.",
  "targeted_returns": "e.g. 10%, 15-20%",
  "hold_period": "e.g. 3-5 years, 6-36 months",
  "distribution_schedule": "e.g. Monthly, Quarterly, Post Project Completion",
  "investment_range": "e.g. $25k - $500k",
  "min_investment": "e.g. 50000 (number only)",
  "tax_advantages": "any tax benefits mentioned",
  "credibility": "track record, years in business, AUM, past returns, total payouts",
  "fund_history": "background/history of the fund or company",
  "fund_type": "e.g. Real Estate Fund, Private Equity, Private Credit",
  "raise_amount": "target raise amount if mentioned",
  "contact_email": "contact email if found",
  "contact_phone": "phone number if found"
}

Only return valid JSON, no other text.`
      : `Analyze this investment fund website content and extract ALL available information. Return a JSON object with these fields (use null for anything not found):

{
  "company_name": "company or fund name",
  "speaker_name": "founder/CEO/speaker name",
  "industry_focus": "e.g. multifamily real estate, oil & gas, etc.",
  "targeted_returns": "e.g. 10%, 15-20%",
  "hold_period": "e.g. 3-5 years, 6-36 months",
  "distribution_schedule": "e.g. Monthly, Quarterly, Post Project Completion",
  "investment_range": "e.g. $25k - $500k",
  "min_investment": "e.g. 50000 (number only)",
  "tax_advantages": "any tax benefits mentioned",
  "credibility": "track record, years in business, AUM, past returns, total payouts",
  "fund_history": "background/history of the fund or company",
  "fund_type": "e.g. Real Estate Fund, Private Equity, Private Credit",
  "raise_amount": "target raise amount if mentioned",
  "contact_email": "contact email if found",
  "contact_phone": "phone number if found"
}

Only return valid JSON, no other text.

Website URL: ${normalizedUrl}
Website content:
${trimmedContent}`

    const requestBody: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }

    // Add Google Search grounding for JS-rendered sites
    if (useGrounding) {
      requestBody.tools = [{ google_search: {} }]
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    const geminiData = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini API error:', JSON.stringify(geminiData))
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Gemini raw response:', rawText.substring(0, 500))

    // Extract JSON from the response
    let jsonStr = rawText
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    } else {
      // Try to find raw JSON object
      const braceMatch = rawText.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        jsonStr = braceMatch[0]
      }
    }

    let extracted: Record<string, unknown> = {}
    try {
      extracted = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse Gemini response:', rawText.substring(0, 500))
      return new Response(JSON.stringify({ error: 'Failed to parse website data' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Remove null values
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(extracted)) {
      if (value !== null && value !== undefined && value !== '' && value !== 'null') {
        cleaned[key] = value
      }
    }

    console.log('Extracted data:', JSON.stringify(cleaned))

    return new Response(JSON.stringify({ success: true, data: cleaned }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Scrape error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
