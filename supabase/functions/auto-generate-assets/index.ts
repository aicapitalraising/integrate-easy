import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ASSET_ORDER = ["research", "angles", "emails", "sms", "adcopy", "scripts", "creatives", "report", "funnel", "setter"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_id } = await req.json();
    if (!client_id) throw new Error("client_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch client data
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .eq("id", client_id)
      .single();

    if (clientErr || !client) throw new Error("Client not found");

    const client_data = {
      company_name: client.company_name,
      fund_name: client.fund_name,
      fund_type: client.fund_type,
      raise_amount: client.raise_amount,
      min_investment: client.min_investment,
      timeline: client.timeline,
      target_investor: client.target_investor,
      website: client.website,
      brand_notes: client.brand_notes,
      additional_notes: client.additional_notes,
      contact_name: client.contact_name,
      speaker_name: client.speaker_name,
      industry_focus: client.industry_focus,
      targeted_returns: client.targeted_returns,
      hold_period: client.hold_period,
      distribution_schedule: client.distribution_schedule,
      investment_range: client.investment_range,
      tax_advantages: client.tax_advantages,
      credibility: client.credibility,
      fund_history: client.fund_history,
    };

    // Update client status
    await supabase.from("clients").update({ status: "researching" }).eq("id", client_id);

    const results: Record<string, string> = {};
    let existing_research: any = null;
    let existing_angles: any = null;

    for (const asset_type of ASSET_ORDER) {
      try {
        console.log(`Generating ${asset_type} for client ${client_id}...`);

        const generateUrl = `${supabaseUrl}/functions/v1/generate-asset`;
        const response = await fetch(generateUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            client_id,
            asset_type,
            client_data,
            existing_research,
            existing_angles,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`Failed to generate ${asset_type}:`, errText);
          results[asset_type] = "failed";
          continue;
        }

        const data = await response.json();
        results[asset_type] = "done";

        // Capture research and angles for downstream use
        if (asset_type === "research" && data.content) {
          existing_research = data.content;
        }
        if (asset_type === "angles" && data.content) {
          existing_angles = data.content;
        }

        // Small delay to avoid rate limiting
        if (asset_type !== ASSET_ORDER[ASSET_ORDER.length - 1]) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (e) {
        console.error(`Error generating ${asset_type}:`, e);
        results[asset_type] = "failed";
      }
    }

    // Update client status to drafting
    await supabase.from("clients").update({ status: "drafting" }).eq("id", client_id);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
