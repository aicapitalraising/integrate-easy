import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are an expert capital markets researcher for alternative investments. You have access to Google Search to find REAL, CURRENT market data. 

Given a fund's details, conduct thorough research using web search and produce comprehensive research structured as JSON with these keys:
- industry_overview: 2-3 paragraphs on the industry/asset class with real market data, recent news, and current statistics
- asset_class_trends: current trends and growth data with specific numbers, sources, and recent developments
- market_opportunity: market size, growth rate, key drivers — cite real statistics from industry reports
- supply_demand: supply/demand dynamics and imbalances with current data points
- demographic_tailwinds: demographic and economic factors driving demand — use real census, economic data
- competitive_landscape: how this type of fund compares to alternatives, current competitor landscape
- timing_factors: why now is the right time — reference current interest rates, market conditions, regulatory environment
- why_asset_class: compelling data-driven reason for this asset class
- why_market: why this specific market/geography with real local market data
- why_now: urgency and timing argument backed by current market conditions
- why_operator: framework for why an experienced operator matters in this space
- key_statistics: array of 8-10 objects with {stat, source, context} — real industry statistics
- recent_news: array of 3-5 recent relevant headlines/developments
Each value should be detailed, data-informed analysis. Be specific with numbers, percentages, and market data. Reference real sources where possible.`,

  angles: `You are a world-class direct response copywriter specializing in alternative investment marketing to accredited investors. 

IMPORTANT: You have been given real market research with actual statistics and data. USE THIS RESEARCH extensively in your angles — reference specific numbers, trends, and data points to make angles credible and compelling.

Generate 8 marketing angles as JSON array. Each angle object:
- title: short punchy angle name
- hook: one-line attention grabber that references a real stat or trend from the research
- emotional_driver: core emotion this taps into
- why_it_works: strategic reasoning tied to the research data
- use_case: where to deploy (ads, emails, landing page)
- ad_hooks: array of 3 short ad hook variations — each should reference real data
- email_subject: suggested email subject line
- video_hook: opening line for a video script
- key_data_point: the specific research stat/fact that powers this angle
Be sophisticated — these target HNW accredited investors, not retail.`,

  emails: `You are an elite email copywriter for capital raising campaigns targeting accredited investors. 

IMPORTANT: You have been given real market research AND marketing angles. Weave specific statistics, market data, and research findings into the emails to build credibility and urgency. Each email should feel data-driven and authoritative.

Generate a 7-email nurture sequence as JSON array. Each email object:
- subject: compelling subject line (reference data when possible)
- preview_text: preview/preheader text
- body: full email body (use \\n for line breaks) — include specific stats and data points from research
- cta_text: button text
- cta_url_placeholder: "[BOOKING_LINK]" or "[INVESTOR_PORTAL]"
- angle_used: which marketing angle this ties to
- sequence_step: number in sequence
- purpose: strategic goal of this email
- data_points_used: array of key stats referenced in this email
Primary CTA = book a strategy call. Tone: professional, authoritative, exclusive.`,

  sms: `You are an SMS marketing expert for capital raising. You have research data and angles — use compelling stats in messages where possible.

Generate a 6-message SMS sequence as JSON array. Each message object:
- message: SMS text (under 160 chars)
- character_count: number
- sequence_step: number
- purpose: one of "follow_up", "reminder", "nurture", "scarcity", "book_call", "re_engagement"
- cta: call to action
- timing: when to send relative to opt-in
Keep messages compliant, professional, and action-oriented.`,

  adcopy: `You are a paid media copywriter specializing in Meta/LinkedIn ads for alternative investments. 

IMPORTANT: You have real market research AND marketing angles. Every ad should reference specific data points, statistics, or market trends from the research to build credibility. Data-driven ads outperform generic ones.

For each marketing angle provided, generate ad copy variations as JSON array. Each object:
- angle: which angle this is for
- primary_text: main ad body (2-3 sentences) — must include at least one specific stat or data point
- headline: ad headline (under 40 chars)
- description: description line
- cta: suggested CTA button
- platform: "meta" or "linkedin"
- variation: number (generate 3 per angle)
- data_point_used: the specific stat referenced
Write for accredited investors. Compliant, no guarantees, sophisticated tone.`,

  scripts: `You are a video script writer for capital raising campaigns. You have real research data and angles — weave specific statistics and market insights throughout scripts to build authority.

Generate video scripts as JSON array. Each object:
- title: script name
- type: one of "avatar", "broll", "ugc", "vsl_short"
- hook: opening 3-second hook — lead with a compelling stat or fact
- body: main script body — reference specific research data throughout
- cta: closing call to action
- angle_used: marketing angle
- format: "9:16", "1:1", or "16:9"
- duration_estimate: estimated seconds
Generate 4-6 scripts mixing types. Tone: authoritative, trustworthy, urgent.`,

  creatives: `You are a creative director for alternative investment ad campaigns. You have research data and angles — use specific stats and data points in headlines and copy.

Generate creative concepts as JSON with keys:
- static_concepts: array of 5 objects, each with: headline (include a stat), supporting_text, visual_direction, layout_idea, format ("1080x1080", "1080x1920", "1200x628"), data_callout (a key stat to feature prominently)
- video_concepts: array of 3 objects, each with: style, setting, visual_scenes (array of scene descriptions), caption_direction, hook_concept (lead with data), format
Be specific about visual direction — colors, imagery, composition. Feature data prominently in designs.`,

  report: `You are a financial content strategist. You have real market research data — use it extensively to create a data-rich, authoritative special report.

Generate a special report / lead magnet as JSON:
- title: compelling report title
- subtitle: supporting subtitle
- executive_summary: 2-3 paragraph executive summary packed with key statistics
- market_opportunity: detailed section on market size and growth with real data
- why_now: timing and urgency section with current market conditions
- strategy_overview: the investment strategy explained with supporting data
- operator_advantage: why this team — framework with industry context
- key_charts: array of 4-6 {chart_title, data_description, insight} — describe charts that should be created
- faqs: array of 5 {question, answer} objects with data-backed answers
- cta_heading: call to action heading
- cta_body: call to action paragraph
Write for sophisticated accredited investors. Data-driven, authoritative.`,

  funnel: `You are a conversion copywriter for alternative investment funnels. You have research data and angles — use specific stats and urgency from real market data throughout.

Generate funnel copy as JSON:
- landing_page: { headline (include a compelling stat), subheadline, hero_stat (key number to feature prominently), body_sections (array of {heading, copy} — each with data points), social_proof_placeholder, cta_primary, cta_secondary }
- thank_you_page: { headline, body, next_steps (array), cta }
- booking_page: { headline, subheadline, bullet_points (array — include stats), urgency_note (reference real market timing) }
- investor_portal_intro: { welcome_headline, welcome_body, sections (array of {title, description}) }
- faqs: array of {question, answer} with data-backed answers
Conversion-focused, premium tone, accredited investor audience.`,
};

function buildUserPrompt(client_data: any, asset_type: string, existing_research: any, existing_angles: any): string {
  let userPrompt = `Fund Details:\n`;
  userPrompt += `- Company: ${client_data.company_name}\n`;
  userPrompt += `- Fund: ${client_data.fund_name || client_data.company_name}\n`;
  userPrompt += `- Fund Type: ${client_data.fund_type || "Alternative Investment"}\n`;
  userPrompt += `- Raise Amount: $${client_data.raise_amount || "TBD"}\n`;
  userPrompt += `- Minimum Investment: $${client_data.min_investment || "TBD"}\n`;
  userPrompt += `- Timeline: ${client_data.timeline || "TBD"}\n`;
  userPrompt += `- Target Investor: ${client_data.target_investor || "Accredited investors"}\n`;
  userPrompt += `- Website: ${client_data.website || "N/A"}\n`;
  if (client_data.brand_notes) userPrompt += `- Brand Notes: ${client_data.brand_notes}\n`;
  if (client_data.additional_notes) userPrompt += `- Additional Notes: ${client_data.additional_notes}\n`;

  if (existing_research && asset_type !== "research") {
    userPrompt += `\n=== MARKET RESEARCH (use this data extensively) ===\n${JSON.stringify(existing_research, null, 2)}\n`;
  }
  if (existing_angles && ["emails", "sms", "adcopy", "scripts", "creatives", "funnel"].includes(asset_type)) {
    userPrompt += `\n=== MARKETING ANGLES (build on these) ===\n${JSON.stringify(existing_angles, null, 2)}\n`;
  }

  if (asset_type === "research") {
    userPrompt += `\nSearch the web for REAL, CURRENT data about this asset class, market, industry trends, and news. Include specific statistics, market sizes, growth rates, and recent developments. Return ONLY valid JSON.`;
  } else {
    userPrompt += `\nGenerate the ${asset_type} content now. USE the research data and statistics throughout — every piece of content should feel data-driven and credible. Return ONLY valid JSON.`;
  }

  return userPrompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_id, asset_type, client_data, existing_research, existing_angles } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = SYSTEM_PROMPTS[asset_type];
    if (!systemPrompt) throw new Error(`Unknown asset type: ${asset_type}`);

    const userPrompt = buildUserPrompt(client_data, asset_type, existing_research, existing_angles);

    const isResearch = asset_type === "research";
    let parsed: any;
    let groundingSources: any[] = [];

    if (isResearch) {
      // Step 1: Search with grounding (no JSON mode — not compatible with Search tool)
      const searchBody = {
        system_instruction: { parts: [{ text: "You are an expert capital markets researcher. Search the web for real, current data about this fund's industry, asset class, market, and recent news. Provide comprehensive findings with specific statistics, market sizes, growth rates, and recent developments." }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { temperature: 0.3 },
      };

      const searchResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(searchBody) }
      );

      if (!searchResponse.ok) {
        const t = await searchResponse.text();
        console.error("Gemini search error:", searchResponse.status, t);
        throw new Error(`Gemini search error: ${searchResponse.status}`);
      }

      const searchResult = await searchResponse.json();
      let rawResearch = "";
      for (const part of searchResult.candidates?.[0]?.content?.parts || []) {
        if (part.text) rawResearch += part.text;
      }

      const gm = searchResult.candidates?.[0]?.groundingMetadata;
      if (gm?.groundingChunks) {
        groundingSources = gm.groundingChunks.map((c: any) => ({ title: c.web?.title, uri: c.web?.uri }));
      }

      // Step 2: Structure the research as JSON (no search tool, JSON mode OK)
      const structureBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: `Here is raw research data gathered from web search:\n\n${rawResearch}\n\nNow structure this into the required JSON format. Include all statistics and data points found. Return ONLY valid JSON.` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      };

      const structureResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(structureBody) }
      );

      if (!structureResponse.ok) {
        const t = await structureResponse.text();
        console.error("Gemini structure error:", structureResponse.status, t);
        throw new Error(`Gemini structure error: ${structureResponse.status}`);
      }

      const structureResult = await structureResponse.json();
      let content = structureResult.candidates?.[0]?.content?.parts?.[0]?.text || "";
      content = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

      try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }
      if (groundingSources.length > 0) parsed._grounding_sources = groundingSources;

    } else {
      // Non-research: single call with JSON mode
      const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("Gemini API error:", response.status, t);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      let content = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      content = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

      try { parsed = JSON.parse(content); } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) { try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = { raw: content }; } }
        else { parsed = { raw: content }; }
      }
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: asset, error: dbError } = await supabase
      .from("client_assets")
      .insert({
        client_id,
        asset_type,
        title: `${asset_type.charAt(0).toUpperCase() + asset_type.slice(1)} - Generated`,
        content: parsed,
        status: "draft",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to save asset");
    }

    return new Response(JSON.stringify({ asset, content: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-asset error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
