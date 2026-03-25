import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMPLIANCE_RULES = `
CRITICAL COMPLIANCE RULES (SEC/FINRA):
1. NEVER use "guaranteed," "risk-free," or "secure" when referring to returns.
2. Always use "targeted returns," "projected returns," or "potential returns."
3. Present balanced performance data — include risk disclaimers.
4. Disclose risks clearly. Never present an overly optimistic view.
5. All statements must be accurate and truthful. Never make up data.
6. Provide context for any rankings or awards.
7. Always include compliance disclaimer at end of content.
8. Only use truth — do not fabricate statistics or performance claims.

Standard Disclaimer: "All investments involve risk, including potential loss of principal. Past performance does not guarantee future results. This opportunity is open exclusively to accredited investors. Any offer or sale of securities will be made only by means of a Private Placement Memorandum and related documents. You should carefully review all offering materials, perform independent due diligence, and consult your financial and legal advisors before investing."
`;

const SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are an expert capital markets researcher for alternative investments. You have deep knowledge of current market conditions.
${COMPLIANCE_RULES}
Given a fund's details, conduct thorough research and produce comprehensive research structured as JSON with these keys:
- industry_overview: 2-3 paragraphs with real market data, recent news, current statistics
- why_asset_class: compelling data-driven reason for this asset class
- why_market: why this specific market/geography with real local market data
- why_now: urgency and timing argument backed by current market conditions
- why_operator: framework for why an experienced operator matters
- supply_demand: supply/demand dynamics with current data points
- timing_factors: current interest rates, market conditions, regulatory environment
- key_statistics: array of 8-10 objects with {stat, source, context}
- recent_news: array of 3-5 recent relevant headlines/developments
Each value should be detailed, data-informed analysis with real numbers and sources.
Return ONLY valid JSON — no markdown, no code fences.`,

  angles: `You are a world-class direct response copywriter (Dan Kennedy × Jeremy Haynes style) specializing in alternative investment marketing to accredited investors.
${COMPLIANCE_RULES}
IMPORTANT: Use the provided market research extensively — reference specific numbers, trends, and data points.

Generate 8 marketing angles as JSON array. Each angle must follow one of these buying angles:
1. Stability & Security
2. Wealth Growth
3. Diversification
4. Passive Income
5. High-Growth Potential
6. Tax Advantages
7. Demographic Trends
8. Operator Credibility

Each angle object:
- title: short punchy angle name
- hook: one-line attention grabber referencing a real stat
- emotional_driver: core emotion (FOMO, security, freedom, prestige, etc.)
- why_it_works: strategic reasoning tied to research data
- use_case: where to deploy (ads, emails, landing page)
- ad_hooks: array of 3 ad hook variations — each must reference real data
- email_subject: suggested email subject line
- video_hook: opening line for a video script
- key_data_point: the specific research stat powering this angle
Tone: sophisticated, targeting HNW accredited investors. Dan Kennedy direct-response style — bold, benefit-oriented, urgent but factually accurate.
Return ONLY valid JSON — no markdown, no code fences.`,

  emails: `You are an elite email copywriter for capital raising campaigns. Write in Dan Kennedy's direct-response style — bold, persuasive, benefit-driven, never guaranteeing returns.
${COMPLIANCE_RULES}
IMPORTANT: Weave specific statistics and market data from the provided research into emails.

Generate a 10-email nurture sequence as JSON array. Follow this structure:
Email 1: Welcome & Intro — briefly introduce fund's primary benefit, credibility
Email 2: Founder Story / Fund Background — engaging storytelling, track record
Email 3: Address Common Objections — risk management, expertise, market conditions
Email 4: Hypothetical Scenario / Illustration — educational example of potential performance
Email 5: Social Proof / Credibility — testimonials placeholders, trustworthiness
Email 6: Market Insights / Education — valuable market insights, thought leadership
Email 7: How We Select Investments — selection criteria, due diligence, expertise
Email 8: FAQ Highlight — directly address frequently asked questions
Email 9: Time-Sensitive Reminder — genuine urgency, limited availability
Email 10: Last Call / Personal Outreach — no-pressure reminder, reinforce benefits

Each email object:
- subject: compelling subject line (reference data when possible)
- preview_text: preview/preheader text
- body: full email body (use \\n for line breaks, 150-300 words) — include stats and data points. Use personalization like {{contact.firstname}}
- cta_text: button text (e.g. "Schedule Your Strategy Call")
- cta_url_placeholder: "[BOOKING_LINK]"
- angle_used: which marketing angle this ties to
- sequence_step: number in sequence
- purpose: strategic goal of this email
- data_points_used: array of key stats referenced
Primary CTA = book a strategy call. Always include disclaimer at end. Avoid spam triggers.
Return ONLY valid JSON — no markdown, no code fences.`,

  sms: `You are an SMS marketing expert for capital raising. Write business casual, no emojis.
${COMPLIANCE_RULES}
Generate a 9-message SMS nurture sequence as JSON array following this structure:

SMS 1: Opt-in intro — "Hi {{contact.first_name}}, it's [Speaker] from [Fund]. You reached out about our [targeted_returns]% returns opportunity. Open for a quick call?"
SMS 2: (10 seconds after) — "What day works best for you this week?"
SMS 3: Project highlight — specific project/deal with projected metrics
SMS 4: Market update angle — highlight resilience/advantage vs market risks
SMS 5: Specific asset tracking metrics — attractive IRR or financial outcome
SMS 6: Personal outreach from fund contact — operational improvement metrics
SMS 7: Subscription/closing urgency — fund subscription %, key numbers
SMS 8: Market timing advantage — interesting fact about current opportunities
SMS 9: Last touch — no pressure, passive income from real assets

Each message object:
- message: SMS text (under 160 chars). Use {{contact.firstname}} and {{user.firstname}} placeholders
- character_count: number
- sequence_step: number
- purpose: one of "opt_in", "follow_up", "nurture", "scarcity", "book_call", "re_engagement"
- cta: call to action
- timing: when to send (e.g. "0 minutes", "10 seconds", "1 day", "3 days", "7 days", "10 days", "14 days", "21 days")
Keep compliant, professional, short sentences.
Return ONLY valid JSON — no markdown, no code fences.`,

  adcopy: `You are an expert direct-response ad copywriter (Dan Kennedy × Jeremy Haynes style), specializing in SEC/FINRA-compliant ad campaigns for investment funds targeting accredited investors.
${COMPLIANCE_RULES}
IMPORTANT: Use real market research data. Every ad must reference specific data points.

For each marketing angle, generate ad copy with these SPECIFIC buying angles:
1. Direct Response — put capital to work, specific return %, benefits, CTA
2. Tax Advantage — smarter investing, tax benefits, depreciation
3. Recession-Resistant — stability in any climate, essential asset class
4. Lifestyle/Exclusivity — premium investment, exclusive group
5. Proof of Concept — track record, past results, execution
6. Urgency — limited allocation, spots filling fast

Format: Use double-spaced lines. Use ✅ green checkmark bullets for benefits.

Generate as JSON array. Each object:
- angle: which angle this is for
- primary_text: main ad body (60-100 words) — must include ✅ bullet benefits and at least one specific stat. Format: Bold hook → 1-2 expanding sentences → ✅ benefits list → compliant CTA → disclaimer
- headline: ad headline (under 40 chars)
- description: description line
- cta: "Learn More", "Invest Now", "Get Started", or "Schedule a Call"
- platform: "meta" or "linkedin"
- variation: number (generate 3 per angle)
- data_point_used: the specific stat referenced
Write for accredited investors. Compliant, sophisticated tone.
Return ONLY valid JSON — no markdown, no code fences.`,

  scripts: `You are an expert video script writer for capital raising campaigns. Write scripts someone will actually say on camera — no scene directions, no quotes, no titles. Just the spoken script.
${COMPLIANCE_RULES}
IMPORTANT: Weave real research data throughout. Lead with compelling stats.

Generate video scripts as JSON array with these categories:

A) VSL SCRIPT (3 minutes, compliance-safe, Hook-First Proof-Led):
Structure: Cold open compliance overlay (2s) → Call-out hook with stat (5-7s) → Credibility snapshot (10-15s) → Problem→mechanism (20-30s) → Evidence/balanced not promissory (20-30s) → Terms in plain English (15-20s) → Risks (10-15s) → CTA with next steps (10-12s)

B) AD SCRIPTS (5 variations, 30-60 seconds each):
Script 1: "Why We're Reaching Out" — growth outpacing capital capacity
Script 2: "The Opportunity Window" — limited allocation, subscription %
Script 3: "The Cash Flow Play" — passive income, distributions, strategy
Script 4: "Built for This Market" — market positioning, risk mitigation
Script 5: "Why Timing Matters" — current conditions stronger than years

C) OBJECTION VIDEOS (5 scripts, under 40 seconds each):
Objection 1: Risk Concerns — risk mitigation strategy
Objection 2: Track Record — years of experience, successful projects
Objection 3: Why Not Keep It In-House — scale, pipeline exceeds internal capital
Objection 4: Market Volatility — low correlation to public markets
Objection 5: Liquidity — upfront about hold period, balanced with distributions

D) INTRO VIDEO (horizontal, 30-60s): Quick overview of fund benefits
E) THANK YOU PAGE VIDEO (horizontal, 30s): Post-scheduling, next steps

Each script object:
- title: script name
- type: one of "vsl", "ad_script", "objection", "intro", "thank_you"
- hook: opening 3-second hook with compelling stat
- body: main script body — JUST what the speaker says. No scene directions.
- cta: closing call to action
- angle_used: marketing angle
- format: "9:16", "1:1", or "16:9"
- duration_estimate: estimated seconds
- disclaimer: compliance disclaimer text
Generate 12-15 scripts total mixing all types.
Return ONLY valid JSON — no markdown, no code fences.`,

  creatives: `You are a creative director for alternative investment ad campaigns.
${COMPLIANCE_RULES}
Generate creative concepts as JSON with keys:
- static_concepts: array of 5 objects, each with: headline (include a stat), supporting_text, visual_direction, layout_idea, format ("1080x1080", "1080x1920", "1200x628"), data_callout
- video_concepts: array of 3 objects, each with: style, setting, visual_scenes (array), caption_direction, hook_concept, format
Feature data prominently in designs. Premium, institutional aesthetic.
Return ONLY valid JSON — no markdown, no code fences.`,

  report: `You are a financial content strategist creating a special report / lead magnet for accredited investors.
${COMPLIANCE_RULES}
Generate as JSON:
- title: compelling report title
- subtitle: supporting subtitle
- executive_summary: 2-3 paragraphs packed with key statistics
- market_opportunity: detailed section with real data
- why_now: timing and urgency with current conditions
- strategy_overview: investment strategy with supporting data
- operator_advantage: why this team matters
- key_charts: array of 4-6 {chart_title, data_description, insight}
- faqs: array of 5 {question, answer} with data-backed answers
- cta_heading: call to action heading
- cta_body: call to action paragraph
Data-driven, authoritative, institutional quality.
Return ONLY valid JSON — no markdown, no code fences.`,

  funnel: `You are a conversion copywriter for alternative investment funnels. Write in Dan Kennedy's direct-response style.
${COMPLIANCE_RULES}
Generate funnel copy as JSON with TWO complete pages:

PAGE A — FUNNEL SCHEDULER PAGE:
- landing_page:
  - headline: Must call out Accredited Investors, highlight big benefit with stat
  - subheadline: Direct-response subheadline with credibility
  - hero_stat: key number to feature prominently
  - cta_primary: "Schedule a Call" or similar
  - how_it_works: array of 3-4 steps explaining: where money goes, how returns generated, distribution timeline, compliance mention
  - body_sections: array of {heading, copy} with data points
  - benefits: array of ✅ bullet benefits
  - accredited_notice: "This opportunity is available exclusively to accredited investors."
  - social_proof_placeholder: placeholder for testimonials
  - cta_secondary: secondary CTA text
  - final_cta_headline: catchy headline encouraging action
  - disclaimer: full disclaimer text

PAGE B — THANK YOU PAGE:
- thank_you_page:
  - headline: "Your Call Is Confirmed—Next Steps to Prepare"
  - steps: array of {step_number, title, description}
  - body: short reassuring copy
  - next_steps: array of action items
  - cta: final CTA
  - reminder: compliance reminder text

Also include:
- booking_page: { headline, subheadline, bullet_points with stats, urgency_note }
- investor_portal_intro: { welcome_headline, welcome_body, sections array }
- faqs: array of 4 {question, answer} with data-backed answers

Conversion-focused, premium tone, accredited investor audience.
Return ONLY valid JSON — no markdown, no code fences.`,
};

function buildUserPrompt(client_data: any, asset_type: string, existing_research: any, existing_angles: any): string {
  let userPrompt = `FUND INFORMATION:\n`;
  userPrompt += `- Fund/Company Name: ${client_data.company_name}\n`;
  userPrompt += `- Fund Name: ${client_data.fund_name || client_data.company_name}\n`;
  userPrompt += `- Speaker/Founder: ${client_data.speaker_name || client_data.contact_name || "TBD"}\n`;
  userPrompt += `- Industry Focus: ${client_data.industry_focus || client_data.fund_type || "Alternative Investment"}\n`;
  userPrompt += `- Fund Type: ${client_data.fund_type || "Alternative Investment"}\n`;
  userPrompt += `- Raise Amount: $${client_data.raise_amount || "TBD"}\n`;
  userPrompt += `- Minimum Investment: $${client_data.min_investment || "TBD"}\n`;
  userPrompt += `- Targeted Returns: ${client_data.targeted_returns || "TBD"}\n`;
  userPrompt += `- Capital Hold Period: ${client_data.hold_period || "TBD"}\n`;
  userPrompt += `- Distribution Schedule: ${client_data.distribution_schedule || "TBD"}\n`;
  userPrompt += `- Investment Range: ${client_data.investment_range || "$25K - $1,000,000"}\n`;
  userPrompt += `- Tax Advantages: ${client_data.tax_advantages || "TBD"}\n`;
  userPrompt += `- Credibility/Track Record: ${client_data.credibility || "TBD"}\n`;
  userPrompt += `- Timeline: ${client_data.timeline || "TBD"}\n`;
  userPrompt += `- Target Investor: ${client_data.target_investor || "Accredited investors"}\n`;
  userPrompt += `- Website: ${client_data.website || "N/A"}\n`;
  if (client_data.fund_history) userPrompt += `- Fund History/Backstory: ${client_data.fund_history}\n`;
  if (client_data.brand_notes) userPrompt += `- Brand Notes: ${client_data.brand_notes}\n`;
  if (client_data.additional_notes) userPrompt += `- Additional Notes: ${client_data.additional_notes}\n`;

  if (existing_research && asset_type !== "research") {
    userPrompt += `\n=== MARKET RESEARCH (use this data extensively — reference specific stats) ===\n${JSON.stringify(existing_research, null, 2)}\n`;
  }
  if (existing_angles && ["emails", "sms", "adcopy", "scripts", "creatives", "funnel"].includes(asset_type)) {
    userPrompt += `\n=== MARKETING ANGLES (build on these) ===\n${JSON.stringify(existing_angles, null, 2)}\n`;
  }

  if (asset_type === "research") {
    userPrompt += `\nProvide REAL, CURRENT data about this asset class, market, industry trends, and news. Include specific statistics, market sizes, growth rates, and recent developments. Return ONLY valid JSON.`;
  } else {
    userPrompt += `\nGenerate the ${asset_type} content now. USE the research data and statistics throughout. Return ONLY valid JSON.`;
  }

  return userPrompt;
}

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_id, asset_type, client_data, existing_research, existing_angles } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS[asset_type];
    if (!systemPrompt) throw new Error(`Unknown asset type: ${asset_type}`);

    const userPrompt = buildUserPrompt(client_data, asset_type, existing_research, existing_angles);

    let parsed: any;

    const rawContent = await callLovableAI(systemPrompt, userPrompt);

    // Parse JSON from response
    let content = rawContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = { raw: content }; }
      } else {
        parsed = { raw: content };
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
    const msg = e instanceof Error ? e.message : "Unknown error";

    if (msg === "RATE_LIMITED") {
      return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (msg === "PAYMENT_REQUIRED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted — please add funds in Settings > Workspace > Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.error("generate-asset error:", e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
