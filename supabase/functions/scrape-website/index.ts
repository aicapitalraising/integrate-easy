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

    // Try fetching the website to get raw content
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
    const cleanContent = htmlContent
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const lovableKey = Deno.env.get('LOVABLE_API_KEY')

    if (!lovableKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Clean content length:', cleanContent.length)

    const trimmedContent = cleanContent.substring(0, 12000)

    // Also extract CSS color values from the raw HTML for brand colors
    const colorMatches = htmlContent.match(/(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\))/g) || []
    // Deduplicate and filter out common non-brand colors (pure white, black, greys)
    const uniqueColors = [...new Set(colorMatches)]
      .filter(c => !['#fff', '#ffffff', '#000', '#000000', '#333', '#333333', '#666', '#666666', '#999', '#ccc', '#eee', '#f5f5f5', '#fafafa'].includes(c.toLowerCase()))
      .slice(0, 20)

    // Build prompt - always include the URL so the model can search for it
    const prompt = `You are an expert at extracting investment fund information and brand identity from websites.

Research the website ${normalizedUrl} and combine with the following scraped content to extract ALL available information about this investment fund or company.

Scraped website content (may be partial):
${trimmedContent || '(No content could be scraped from this website. Only extract data that can be found at the URL. Return null for any fields you cannot verify from the actual website content. Do NOT guess or fabricate any information.)'}

${uniqueColors.length > 0 ? `CSS colors found on this website: ${uniqueColors.join(', ')}` : ''}

Return a JSON object with these fields (use null for anything not found):

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
  "contact_phone": "phone number if found",
  "brand_colors": ["#hex1", "#hex2", "#hex3"] (pick 3-5 primary brand colors from the CSS colors and page design - the dominant accent, secondary, background, and text colors that define the brand. Convert rgb/hsl to hex. Exclude pure white/black/grey.),
  "primary_offer": "the main investment offer or value proposition in one sentence (e.g. 'Earn 12% targeted returns through Class-A multifamily real estate')",
  "secondary_offers": ["offer2", "offer3"] (additional selling points, benefits, or offers mentioned - max 3)
}

Only return valid JSON, no other text.`

    let rawText = ''

    // Use Lovable AI Gateway (correct URL)
    try {
      const lovableRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 2048,
        }),
      })
      const lovableResText = await lovableRes.text()
      console.log('Lovable AI status:', lovableRes.status, 'response length:', lovableResText.length)
      if (lovableRes.ok) {
        const lovableData = JSON.parse(lovableResText)
        if (lovableData?.choices?.[0]?.message?.content) {
          rawText = lovableData.choices[0].message.content
          console.log('Used Lovable AI gateway successfully')
        }
      } else {
        console.error('Lovable AI error:', lovableResText.substring(0, 300))
        if (lovableRes.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limited, please try again shortly' }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        if (lovableRes.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    } catch (e) {
      console.error('Lovable AI gateway failed:', e)
    }

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'AI analysis returned no results' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('AI raw response:', rawText.substring(0, 500))

    // Extract JSON from the response
    let jsonStr = rawText
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    } else {
      const braceMatch = rawText.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        jsonStr = braceMatch[0]
      }
    }

    let extracted: Record<string, unknown> = {}
    try {
      extracted = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse AI response:', rawText.substring(0, 500))
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
