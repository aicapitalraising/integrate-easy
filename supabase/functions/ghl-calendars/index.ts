import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
    if (!GHL_API_KEY) throw new Error("GHL_API_KEY is not configured");

    const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID");
    if (!GHL_LOCATION_ID) throw new Error("GHL_LOCATION_ID is not configured");

    const body = req.method === "POST" ? await req.json() : {};
    const action = body.action || "list";

    // Action: list calendars
    if (action === "list") {
      const res = await fetch(
        `https://services.leadconnectorhq.com/calendars/?locationId=${GHL_LOCATION_ID}`,
        {
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            Version: "2021-04-15",
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GHL API error [${res.status}]: ${text}`);
      }

      const data = await res.json();
      const calendars = (data.calendars || []).map((cal: any) => ({
        id: cal.id,
        name: cal.name,
        description: cal.description || "",
        slug: cal.slug || "",
      }));

      return new Response(JSON.stringify({ calendars }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: free-slots
    if (action === "free-slots") {
      const { calendarId, startDate, endDate, timezone } = body;
      if (!calendarId || !startDate || !endDate) {
        throw new Error("calendarId, startDate, and endDate are required");
      }

      const tz = timezone || "America/New_York";
      const url = `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&timezone=${encodeURIComponent(tz)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: "2021-04-15",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GHL free-slots error [${res.status}]: ${text}`);
      }

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    console.error("Error in ghl-calendars:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
