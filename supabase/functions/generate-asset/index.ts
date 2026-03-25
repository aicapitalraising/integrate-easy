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
  research: `You are an expert capital markets researcher for alternative investments. You have access to Google Search to find REAL, CURRENT market data.
${COMPLIANCE_RULES}
Given a fund's details, conduct thorough research using web search and produce comprehensive research structured as JSON with these keys:
- industry_overview: 2-3 paragraphs with real market data, recent news, current statistics
- why_asset_class: compelling data-driven reason for this asset class
- why_market: why this specific market/geography with real local market data
- why_now: urgency and timing argument backed by current market conditions
- why_operator: framework for why an experienced operator matters
- supply_demand: supply/demand dynamics with current data points
- timing_factors: current interest rates, market conditions, regulatory environment
- key_statistics: array of 8-10 objects with {stat, source, context}
- recent_news: array of 3-5 recent relevant headlines/developments
Each value should be detailed, data-informed analysis with real numbers and sources.`,

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
Tone: sophisticated, targeting HNW accredited investors. Dan Kennedy direct-response style — bold, benefit-oriented, urgent but factually accurate.`,

  emails: `You are an elite email copywriter for capital raising campaigns. Write in Dan Kennedy's direct-response style — bold, persuasive, benefit-driven, never guaranteeing returns.
${COMPLIANCE_RULES}
IMPORTANT: Weave specific statistics and market data from the provided research into emails.

Guidelines for all emails:
- Write in a conversational, direct-response style.
- Keep emails concise (150-300 words each).
- Personalize emails using {{contact.firstname}}.
- Avoid spam trigger phrases such as "guaranteed returns," "risk-free," or "secure returns."
- Reference "targeted returns" or "potential returns" if discussing performance.
- End each email with a clear CTA and a brief compliance disclaimer.
- FINRA and SEC compliant.
- Always include disclaimer at the end of email when writing it.

Generate a 10-email nurture sequence as JSON array:

Email #1: Welcome & Intro — Friendly greeting, personalization. Briefly introduce fund's primary benefit (targeted returns). Short introduction of who we are and our credibility. CTA: "Simply reply 'Schedule' to set up your call"
Email #2: Founder Story / Fund Background — Engaging storytelling about founder or fund origin. Highlight track record or unique insights. CTA: "Reply with questions or schedule your call"
Email #3: Address Common Objections — Directly tackle typical investor concerns (risk management, expertise, market conditions). Briefly explain risk mitigation and fund expertise. CTA: "Request our documents or book a discovery call"
Email #4: Hypothetical Scenario / Illustration — Provide an educational example illustrating potential fund performance. Emphasize risk awareness, clarify no guaranteed outcomes. CTA: "Schedule your call or reply to review the PPM"
Email #5: Social Proof / Credibility — Highlight brief testimonials or anonymized investor stories if permitted. Showcase trustworthiness and fund reliability. CTA: "Book your call to learn more"
Email #6: Market Insights / Education — Offer valuable insights about the market or investment class. Demonstrate expertise and thought leadership. CTA: "Reply to discuss your goals further"
Email #7: How We Select Investments — Explain fund's meticulous selection criteria. Demonstrate due diligence and expertise. CTA: "Request our detailed investment criteria or schedule a call"
Email #8: FAQ Highlight — Directly address frequently asked questions from investors. Provide concise and reassuring answers. CTA: "Still have questions? Schedule your call"
Email #9: Time-Sensitive Reminder — Gently introduce genuine urgency or limited availability if applicable. Reiterate primary benefits succinctly. CTA: "Book your call now before the opportunity closes"
Email #10: Last Call / Personal Outreach — Friendly, no-pressure conversational reminder. Reinforce primary fund benefits and opportunity. CTA: "This is our final check-in—reply now to schedule your call"

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
Primary CTA = book a strategy call. Always include disclaimer at end. Avoid spam triggers.`,

  sms: `You are an SMS marketing expert for capital raising. Write business casual, no emojis.
${COMPLIANCE_RULES}
Generate a 9-message SMS nurture sequence as JSON array following this EXACT structure:

SMS #1: Opt-in intro — "Hi {{contact.first_name}}, it's [Speaker] from [Fund]. You reached out to us about our investment fund offering [targeted_returns]% returns. Are you open for a quick call to review any questions?"
SMS #2: (10 seconds after SMS #1) — "What day works best for you this week?"
SMS #3: Project highlight — "[Name], [Team Member] from [Fund]. Our newest project in [Location or Asset Type] is projecting [Specific IRR]. We [briefly explain strategy]. Got 10 minutes tomorrow afternoon or Thursday morning to discuss?"
SMS #4: Market update angle — "Quick market update. [Highlight resilience or unique advantage vs market risks]. [Briefly explain fund strategy for recession-resistant income]. When's good for a brief call? Today after 3 or tomorrow before noon?"
SMS #5: Specific asset tracking — "Morning [Name]! [Fund] here. One of our [specific asset type/location] is tracking [specific attractive IRR]. Investors enjoy [highlight benefit]. Do you have time this week to explore if it fits your portfolio?"
SMS #6: Personal outreach — "[Name]—[Fund Contact] asked me to reach out. We're seeing [impressive metric] at one project just from [simple improvement]. Quick question: are you more interested in [cash flow, tax benefits, or appreciation]? When can we chat?"
SMS #7: Subscription/closing urgency — "[Name], hope your week's going well. Our [Fund Type] fund just hit [Subscription % or milestone]—closing soon. Key numbers: [Preferred return %], [target IRR %]. Would Thursday work for a quick call, or is Friday morning better?"
SMS #8: Market timing — "[Name]—[Fund] checking in. Did you know [interesting market fact]? We're strategically positioned before [market shift]. When's convenient for you to discuss—this afternoon or tomorrow?"
SMS #9: Last touch — "Hi [Name], last try—no pressure. If passive income from real assets (not paper assets) sounds good, let's talk. Our investors typically allocate [amount] and appreciate the [consistent benefit]. Just tell me when works for a 15-min intro call."

Each message object:
- message: SMS text (under 160 chars). Use {{contact.firstname}} and {{user.firstname}} placeholders
- character_count: number
- sequence_step: number
- purpose: one of "opt_in", "follow_up", "nurture", "scarcity", "book_call", "re_engagement"
- cta: call to action
- timing: when to send (e.g. "0 minutes", "10 seconds", "1 day", "3 days", "7 days", "10 days", "14 days", "21 days")
Keep compliant, professional, short sentences.`,

  adcopy: `You are an expert direct-response ad copywriter (Dan Kennedy × Jeremy Haynes style), specializing in SEC/FINRA-compliant ad campaigns for investment funds targeting accredited investors.
${COMPLIANCE_RULES}
IMPORTANT: Use real market research data. Every ad must reference specific data points.

Write ad copy variants for these 6 SPECIFIC buying angles. For each angle, generate 3 variations (18 ads total).

ANGLE 1: Direct Response — "Accredited investors: Are you ready to put your capital to work? Our fund is targeting [specific return percentage] with [specific benefits]. With a proven track record, this is your chance to invest in a high-performing asset class. Minimum investment starts at [$X]."

ANGLE 2: Tax Advantage — "Looking for a smarter way to invest? Our fund not only targets [specific return percentage], but it's also designed to help accredited investors take advantage of significant tax benefits. From depreciation to [specific tax incentives], your investment can work harder for you."

ANGLE 3: Recession-Resistant — "Worried about market volatility? Our fund is built to thrive in any economic climate. By investing in [specific asset class], we're targeting [specific return percentage] while protecting your capital with a recession-resistant strategy."

ANGLE 4: Lifestyle/Exclusivity — "Accredited investors: This isn't just an investment—it's a lifestyle. Our fund is focused on [specific asset class] that caters to high-net-worth individuals. With a minimum investment of [$X], you can join an exclusive group of investors targeting [specific return percentage]."

ANGLE 5: Proof of Concept — "This isn't theory—it's proof. Over the last [X years], we've [raised equity], completed [X projects], and delivered consistent returns. Our latest fund is targeting [specific return percentage] with [specific benefits]."

ANGLE 6: Urgency — "Opportunities like this don't last. We're raising [$X million] in equity for [specific asset class], and spots are filling fast. With a minimum investment of [$X], accredited investors can target [specific return percentage]."

Format rules:
- Use double-spaced lines throughout for maximum readability
- Use ✅ green checkmark bullets for benefits (each benefit on its own line)
- Each ad (60-100 words) must have: A bold hook → 1-2 expanding sentences → ✅ benefit list → compliant CTA → disclaimer

Generate as JSON array. Each object:
- angle: which angle this is for
- primary_text: main ad body (60-100 words) with ✅ bullet benefits and at least one specific stat
- headline: ad headline (under 40 chars)
- description: description line
- cta: "Learn More", "Invest Now", "Get Started", or "Schedule a Call"
- platform: "meta" or "linkedin"
- variation: number (1-3 per angle)
- data_point_used: the specific stat referenced
Write for accredited investors. Compliant, sophisticated tone.`,

  scripts: `You are an expert video script writer for capital raising campaigns. Write scripts someone will actually say on camera — no scene directions, no quotes, no titles. Just the spoken script.
${COMPLIANCE_RULES}
IMPORTANT: Weave real research data throughout. Lead with compelling stats.

Generate video scripts as JSON array with these categories:

A) VSL SCRIPT (3 minutes, compliance-safe, Hook-First Proof-Led):
Structure:
1) Cold open overlay (2s) — "For accredited investors only. Not an offer. Read the PPM. Past performance ≠ future results."
2) Call-out hook (5-7s) — "Accredited investors: evaluating alternatives beyond stocks and bonds? Here's how [Fund Name] targets [X%] in [asset class] using [simple mechanism], with [monthly/quarterly distributions]."
3) Credibility snapshot (10-15s) — "I'm [Name], [Role] at [Company]. We've [years/team experience], [AUM/transactions], and use [3rd-party admin/audited financials/custody]."
4) Problem→mechanism (20-30s) — Problem: "Traditional portfolios are volatile and tax-inefficient." Mechanism: "We source [asset class] off-market via [deal flow], underwrite with [conservative LTV/covenants], and diversify across [geos/operators]."
5) Evidence (20-30s) — balanced, not promissory. "Selected snapshots: [Deal/Segment] produced [X% net to LPs] since [year]."
6) Terms in plain English (15-20s) — "Min: [$$]. Fees: [mgmt]% / [carry]%. Hold: [N] years. Distributions: [monthly/quarterly]. Accredited investors only."
7) Risks (10-15s) — "All investments involve risk including loss of principal, illiquidity, and regulatory changes."
8) CTA (10-12s) — "Tap 'Book Call' now. On the call: we verify accreditation, walk you through the PPM, and answer diligence."

B) AD SCRIPTS (5 variations, 30-60 seconds each):
Script 1: "Why We're Reaching Out" — growth outpacing capital capacity, investor count, pipeline expanding, new accredited investors brought on
Script 2: "The Opportunity Window" — limited allocation, subscription %, once full allocation that's it
Script 3: "The Cash Flow Play" — passive income, distributions, strategy of acquiring assets, enhancing operations
Script 4: "Built for This Market" — market positioning, risk mitigation, focus on specific asset class/region
Script 5: "Why Timing Matters" — current conditions stronger than in years, strategically positioned

C) OBJECTION VIDEOS (5 scripts, under 40 seconds each):
Objection 1: Risk Concerns — risk mitigation via strategy, distributions for ongoing cash flow
Objection 2: Track Record — years of experience, successful projects, disciplined process
Objection 3: Why Not Keep It In-House — scale, pipeline bigger than internal capital
Objection 4: Market Volatility — low correlation to public markets, stable demand
Objection 5: Liquidity — upfront about hold period, balanced with distributions

D) INTRO VIDEO (horizontal, 30-60s): Quick overview of fund benefits
E) THANK YOU PAGE VIDEO (horizontal, 30s): Post-scheduling, invite to review pitch deck

Rules: Do not add scenes or quotes or titles, just provide the video script for someone to say.

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
Generate 12-15 scripts total mixing all types.`,

  creatives: `You are a creative director for alternative investment ad campaigns.
${COMPLIANCE_RULES}
Generate creative concepts as JSON with keys:
- static_concepts: array of 5 objects, each with: headline (include a stat), supporting_text, visual_direction, layout_idea, format ("1080x1080", "1080x1920", "1200x628"), data_callout
- video_concepts: array of 3 objects, each with: style, setting, visual_scenes (array), caption_direction, hook_concept, format
Feature data prominently in designs. Premium, institutional aesthetic.`,

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
Data-driven, authoritative, institutional quality.`,

  funnel: `You are a conversion copywriter for alternative investment funnels. Write in Dan Kennedy's direct-response style.
${COMPLIANCE_RULES}
Generate funnel copy as JSON with TWO complete pages:

PAGE A — FUNNEL SCHEDULER PAGE (Landing Page):
Audience: Accredited Investors
Required Sections:
1. Catchy Headline — Must call out Accredited Investors, highlight the big benefit (e.g., "Projected Returns of X% Through [Unique Strategy] without [something negative]!") while staying compliant.
2. Direct-Response Subheadline with credibility
3. CTA Button (Under a Video) — "Schedule a Call" or similar
4. "How Our Fund Works" Headline & Steps — 3-4 steps: where money goes, how returns generated, distribution timeline, compliance mention
5. CTA Headline Prompting a Call — "Have Questions? Let's Talk—Schedule Your Call Now."
6. Accredited Investors Only notice under the scheduler
7. 4 FAQ Questions & Answers
8. Key Benefits Section with ✅ bullets — "Targeted Returns of X%", "Quarterly Cash Distributions", "Tax Advantages", "Expert Management Team"
9. Catchy Final Headline to Encourage Starting & CTA Button
10. Short Disclaimer at the bottom

PAGE B — THANK YOU PAGE (Post-Scheduling):
1. Headline: "Your Call Is Confirmed—Next Steps to Prepare" or "Your Call Is NOT Fully Confirmed Until You Complete These Steps."
2. Step 1: "Watch the Short Video Below to Confirm Your Call"
3. Step 2: "Download the Pitch Deck"
4. Step 3: "Review Testimonials"
End with reminder: "We look forward to speaking with you. This offer is exclusively for accredited investors. Review the PPM for full details."

JSON structure:
- landing_page: { headline, subheadline, hero_stat, cta_primary, how_it_works (array of steps), body_sections (array), benefits (array with ✅), accredited_notice, social_proof_placeholder, cta_secondary, final_cta_headline, disclaimer }
- thank_you_page: { headline, steps (array of {step_number, title, description}), body, next_steps (array), cta, reminder }
- booking_page: { headline, subheadline, bullet_points with stats, urgency_note }
- investor_portal_intro: { welcome_headline, welcome_body, sections array }
- faqs: array of 4 {question, answer} with data-backed answers

Conversion-focused, premium tone, accredited investor audience.`,

  setter: `You are an AI assistant designer specializing in creating AI setter/virtual receptionist prompts for investment fund lead conversion.
${COMPLIANCE_RULES}

Generate a complete AI Setter configuration as JSON with these keys:

- intro_message: The opening message template using {{contact.name}}, {{user.firstname}}, {{contact.company_name}} placeholders. Example: "Hi {{contact.name}}, this is {{user.firstname}} from {{contact.company_name}}. I noticed your interest in our investment opportunity, offering [targeted_returns]% potential returns with a [hold_period] capital hold. Are you open to a quick call?"

- positive_response: What to say when they respond positively, including scheduler link placeholder [LINK_TO_SCHEDULER]

- goal_description: Brief description of the setter's role as a virtual receptionist

- key_offer_details: Template highlighting targeted returns, hold period, and benefits

- understanding_goals_prompt: Question to understand investor's main goals

- rules: Array of 11 rules (short sentences, no emojis, under 500 chars, business casual, etc.)

- faq: Array of 5 FAQ objects with {question, answer} covering: services offered, how investment works, expected returns, how to start, company location

- follow_up_sequence: Array of follow-up steps:
  - Step 1: After 60 minutes — bump messages array: ["Get my note?", "Ping?", "[Name]?", "Knock, knock?", "Still there?"]
  - Step 2: Same day no response — wait until next day, "Morning!"
  - Step 3-7: Follow-ups at 24 hours, 3 days, 7 days, 14 days, 21 days with message templates

- fund_details_summary: A summary paragraph of all fund details to inject into AI follow-ups

Fill all templates with the client's actual fund data (returns, hold period, benefits, company name, etc.).`,
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
  if (existing_angles && ["emails", "sms", "adcopy", "scripts", "creatives", "funnel", "setter"].includes(asset_type)) {
    userPrompt += `\n=== MARKETING ANGLES (build on these) ===\n${JSON.stringify(existing_angles, null, 2)}\n`;
  }

  if (asset_type === "research") {
    userPrompt += `\nSearch the web for REAL, CURRENT data about this asset class, market, industry trends, and news. Include specific statistics, market sizes, growth rates, and recent developments. Return ONLY valid JSON.`;
  } else {
    userPrompt += `\nGenerate the ${asset_type} content now. USE the research data and statistics throughout. Return ONLY valid JSON.`;
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
      // Step 1: Search with grounding (no JSON mode)
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

      // Step 2: Structure as JSON
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
