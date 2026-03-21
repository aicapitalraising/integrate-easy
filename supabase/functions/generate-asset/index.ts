import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are an expert capital markets researcher for alternative investments. Given a fund's details, produce comprehensive research structured as JSON with these keys:
- industry_overview: 2-3 paragraphs on the industry/asset class
- asset_class_trends: current trends and growth data
- market_opportunity: size, growth rate, key drivers
- supply_demand: supply/demand dynamics and imbalances
- demographic_tailwinds: demographic and economic factors
- competitive_landscape: how this fund compares
- timing_factors: why now is the right time
- why_asset_class: compelling reason for this asset class
- why_market: why this specific market/geography
- why_now: urgency and timing argument
- why_operator: why this team/operator
Each value should be 2-4 sentences of insightful, data-informed analysis. Be specific, cite realistic market stats.`,

  angles: `You are a world-class direct response copywriter specializing in alternative investment marketing to accredited investors. Given research and fund details, generate 8 marketing angles as JSON array. Each angle object:
- title: short punchy angle name
- hook: one-line attention grabber
- emotional_driver: core emotion this taps into
- why_it_works: strategic reasoning
- use_case: where to deploy (ads, emails, landing page)
- ad_hooks: array of 3 short ad hook variations
- email_subject: suggested email subject line
- video_hook: opening line for a video script
Be sophisticated — these target HNW accredited investors, not retail.`,

  emails: `You are an elite email copywriter for capital raising campaigns targeting accredited investors. Generate a 7-email nurture sequence as JSON array. Each email object:
- subject: compelling subject line
- preview_text: preview/preheader text
- body: full email body (use \\n for line breaks)
- cta_text: button text
- cta_url_placeholder: "[BOOKING_LINK]" or "[INVESTOR_PORTAL]"
- angle_used: which marketing angle this ties to
- sequence_step: number in sequence
- purpose: strategic goal of this email
Primary CTA = book a strategy call. Tone: professional, authoritative, exclusive.`,

  sms: `You are an SMS marketing expert for capital raising. Generate a 6-message SMS sequence as JSON array. Each message object:
- message: SMS text (under 160 chars)
- character_count: number
- sequence_step: number
- purpose: one of "follow_up", "reminder", "nurture", "scarcity", "book_call", "re_engagement"
- cta: call to action
- timing: when to send relative to opt-in
Keep messages compliant, professional, and action-oriented.`,

  adcopy: `You are a paid media copywriter specializing in Meta/LinkedIn ads for alternative investments. For each marketing angle provided, generate ad copy variations as JSON array. Each object:
- angle: which angle this is for
- primary_text: main ad body (2-3 sentences)
- headline: ad headline (under 40 chars)
- description: description line
- cta: suggested CTA button
- platform: "meta" or "linkedin"
- variation: number (generate 3 per angle)
Write for accredited investors. Compliant, no guarantees, sophisticated tone.`,

  scripts: `You are a video script writer for capital raising campaigns. Generate video scripts as JSON array. Each object:
- title: script name
- type: one of "avatar", "broll", "ugc", "vsl_short"
- hook: opening 3-second hook
- body: main script body
- cta: closing call to action
- angle_used: marketing angle
- format: "9:16", "1:1", or "16:9"
- duration_estimate: estimated seconds
Generate 4-6 scripts mixing types. Tone: authoritative, trustworthy, urgent.`,

  creatives: `You are a creative director for alternative investment ad campaigns. Generate creative concepts as JSON with keys:
- static_concepts: array of 5 objects, each with: headline, supporting_text, visual_direction, layout_idea, format ("1080x1080", "1080x1920", "1200x628")
- video_concepts: array of 3 objects, each with: style, setting, visual_scenes (array of scene descriptions), caption_direction, hook_concept, format
Be specific about visual direction — colors, imagery, composition.`,

  report: `You are a financial content strategist. Generate a special report / lead magnet outline as JSON:
- title: compelling report title
- subtitle: supporting subtitle
- executive_summary: 2-3 paragraph executive summary
- market_opportunity: section on market size and growth
- why_now: timing and urgency section
- strategy_overview: the investment strategy explained
- operator_advantage: why this team
- faqs: array of 5 {question, answer} objects
- cta_heading: call to action heading
- cta_body: call to action paragraph
Write for sophisticated accredited investors. Data-driven, authoritative.`,

  funnel: `You are a conversion copywriter for alternative investment funnels. Generate funnel copy as JSON:
- landing_page: { headline, subheadline, body_sections (array of {heading, copy}), social_proof_placeholder, cta_primary, cta_secondary }
- thank_you_page: { headline, body, next_steps (array), cta }
- booking_page: { headline, subheadline, bullet_points (array), urgency_note }
- investor_portal_intro: { welcome_headline, welcome_body, sections (array of {title, description}) }
- faqs: array of {question, answer}
Conversion-focused, premium tone, accredited investor audience.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_id, asset_type, client_data, existing_research, existing_angles } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = SYSTEM_PROMPTS[asset_type];
    if (!systemPrompt) throw new Error(`Unknown asset type: ${asset_type}`);

    // Build context prompt
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

    if (existing_research && ["angles", "emails", "sms", "adcopy", "scripts", "creatives", "report", "funnel"].includes(asset_type)) {
      userPrompt += `\nResearch Context:\n${JSON.stringify(existing_research, null, 2)}\n`;
    }
    if (existing_angles && ["emails", "sms", "adcopy", "scripts", "creatives"].includes(asset_type)) {
      userPrompt += `\nMarketing Angles:\n${JSON.stringify(existing_angles, null, 2)}\n`;
    }

    userPrompt += `\nGenerate the ${asset_type} content now. Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
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
