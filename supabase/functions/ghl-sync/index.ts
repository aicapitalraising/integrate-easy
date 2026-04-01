import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[GHL-SYNC] ${step}${d}`);
};

async function ghlFetch(path: string, method: string, body?: unknown) {
  const apiKey = Deno.env.get("GHL_API_KEY");
  if (!apiKey) throw new Error("GHL_API_KEY not configured");

  const res = await fetch(`${GHL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Version: "2021-07-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Log full response for debugging on errors
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    logStep("GHL API error", { status: res.status, path, data });
    throw new Error(`GHL API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}


// ── Action: Create or update a GHL contact ──────────────────────────
async function syncContact(payload: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}) {
  const locationId = Deno.env.get("GHL_LOCATION_ID");
  if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

  const nameParts = (payload.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Search for existing contact by email first
  let contactId: string | null = null;
  if (payload.email) {
    try {
      const search = await ghlFetch(
        `/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(payload.email)}`,
        "GET"
      );
      if (search?.contact?.id) {
        contactId = search.contact.id;
        logStep("Found existing GHL contact", { contactId });
      }
    } catch {
      logStep("No existing contact found, will create new");
    }
  }

  if (contactId) {
    // Update existing — do NOT include locationId in PUT body
    const updateBody: Record<string, unknown> = {
      firstName,
      lastName,
      email: payload.email || undefined,
      phone: payload.phone || undefined,
      companyName: payload.company || undefined,
      source: payload.source || "AI Capital Raising",
      tags: payload.tags || [],
    };
    const updated = await ghlFetch(`/contacts/${contactId}`, "PUT", updateBody);
    logStep("Updated GHL contact", { contactId });
    return updated.contact || { id: contactId };
  } else {
    // Create new — locationId required for creation
    const createBody: Record<string, unknown> = {
      locationId,
      firstName,
      lastName,
      email: payload.email || undefined,
      phone: payload.phone || undefined,
      source: payload.source || "AI Capital Raising",
      tags: payload.tags || [],
    };
    const created = await ghlFetch("/contacts/", "POST", createBody);
    logStep("Created GHL contact", { contactId: created?.contact?.id });
    return created.contact;
  }
}

// ── Action: Add a note to a contact ─────────────────────────────────
async function addContactNote(contactId: string, note: string) {
  const result = await ghlFetch(`/contacts/${contactId}/notes`, "POST", {
    body: note,
  });
  logStep("Added note to contact", { contactId });
  return result;
}

// ── Action: Create a pipeline opportunity ───────────────────────────
async function createOpportunity(payload: {
  contactId: string;
  pipelineId: string;
  stageId: string;
  name: string;
  monetaryValue?: number;
  status?: string;
}) {
  const locationId = Deno.env.get("GHL_LOCATION_ID");
  if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

  const result = await ghlFetch("/opportunities/", "POST", {
    locationId,
    pipelineId: payload.pipelineId,
    pipelineStageId: payload.stageId,
    contactId: payload.contactId,
    name: payload.name,
    monetaryValue: payload.monetaryValue || 0,
    status: payload.status || "open",
  });
  logStep("Created GHL opportunity", { id: result?.opportunity?.id });
  return result.opportunity;
}

// ── Action: Create a calendar appointment ───────────────────────────
async function createAppointment(payload: {
  calendarId: string;
  contactId: string;
  startTime: string;
  endTime: string;
  title?: string;
  guests?: string[];
}) {
  const locationId = Deno.env.get("GHL_LOCATION_ID");
  if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

  const body: Record<string, unknown> = {
    calendarId: payload.calendarId,
    locationId,
    contactId: payload.contactId,
    startTime: payload.startTime,
    endTime: payload.endTime,
    title: payload.title || "Strategy Call",
    appointmentStatus: "confirmed",
  };

  // Add guests if provided
  if (payload.guests && payload.guests.length > 0) {
    body.guests = payload.guests.map((email: string) => ({ email }));
  }

  logStep("Creating appointment", body);

  const result = await ghlFetch("/calendars/events/appointments", "POST", body);
  logStep("Created GHL appointment", { id: result?.id });
  return result;
}

// ── Main handler ────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    logStep("Action received", { action });

    let result: unknown;

    switch (action) {
      // ── Sync a new lead as a contact ──
      case "sync-lead": {
        const contact = await syncContact({
          name: params.name,
          email: params.email,
          phone: params.phone,
          source: params.source,
          tags: params.tags || ["AI Capital Raising", "New Lead"],
        });

        // If qualification data exists, add as note
        if (params.qualificationTier || params.investmentRange) {
          const noteLines = [
            `Qualification: ${params.qualificationTier || "pending"}`,
            params.investmentRange ? `Investment Range: ${params.investmentRange}` : "",
            params.accredited ? "Accredited: Yes" : "Accredited: No",
            `Source: ${params.source || "Direct"}`,
          ].filter(Boolean);
          await addContactNote(contact.id, noteLines.join("\n"));
        }

        // Create opportunity if pipeline info provided
        if (params.pipelineId && params.stageId) {
          await createOpportunity({
            contactId: contact.id,
            pipelineId: params.pipelineId,
            stageId: params.stageId,
            name: `${params.name} - Capital Raise`,
            monetaryValue: params.monetaryValue || 0,
          });
        }

        result = { contactId: contact.id };
        break;
      }

      // ── Sync a payment event ──
      case "sync-payment": {
        const contact = await syncContact({
          name: params.name,
          email: params.email,
          phone: params.phone,
          tags: ["AI Capital Raising", "Paid Client"],
        });

        const noteContent = [
          `💰 Payment Received`,
          `Amount: $${((params.amount || 0) / 100).toLocaleString()}`,
          `Method: ${params.paymentMethod || "card"}`,
          params.company ? `Company: ${params.company}` : "",
          `Date: ${new Date().toISOString()}`,
        ]
          .filter(Boolean)
          .join("\n");

        await addContactNote(contact.id, noteContent);

        // Update opportunity stage if pipeline info provided
        if (params.pipelineId && params.stageId) {
          await createOpportunity({
            contactId: contact.id,
            pipelineId: params.pipelineId,
            stageId: params.stageId,
            name: `${params.name} - Setup Fee Paid`,
            monetaryValue: params.amount ? params.amount / 100 : 0,
            status: "won",
          });
        }

        result = { contactId: contact.id };
        break;
      }

      // ── Sync a calendar booking ──
      case "sync-booking": {
        const contact = await syncContact({
          name: params.name,
          email: params.email,
          phone: params.phone,
          tags: ["AI Capital Raising", "Booked Call"],
        });

        if (params.calendarId && params.startTime) {
          const start = new Date(params.startTime);
          const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min default

          await createAppointment({
            calendarId: params.calendarId,
            contactId: contact.id,
            startTime: start.toISOString(),
            endTime: params.endTime || end.toISOString(),
            title: params.title || "Strategy Call - AI Capital Raising",
            guests: params.guests || [],
          });
        }

        result = { contactId: contact.id };
        break;
      }

      // ── Get pipelines (for config) ──
      case "get-pipelines": {
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        const data = await ghlFetch(
          `/opportunities/pipelines?locationId=${locationId}`,
          "GET"
        );
        result = data.pipelines || [];
        break;
      }

      // ── Get calendars (for config) ──
      case "get-calendars": {
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        const data = await ghlFetch(
          `/calendars/?locationId=${locationId}`,
          "GET"
        );
        result = data.calendars || [];
        break;
      }

      // ── Test connection ──
      case "test-connection": {
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        if (!locationId) throw new Error("GHL_LOCATION_ID not configured");
        // Simple search to verify credentials work
        const data = await ghlFetch(
          `/contacts/?locationId=${locationId}&limit=1`,
          "GET"
        );
        logStep("Connection test OK", { contactCount: data?.contacts?.length });
        result = { connected: true };
        break;
      }

      // ── Get recent contacts from GHL (last N days) ──
      case "get-contacts": {
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

        const days = params.days || 10;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startAfter = Math.floor(startDate.getTime() / 1000);

        // GHL contacts endpoint with date filter
        const limit = params.limit || 100;
        const data = await ghlFetch(
          `/contacts/?locationId=${locationId}&limit=${limit}&startAfter=${startAfter}&sortBy=date_added&order=desc`,
          "GET"
        );

        const contacts = (data?.contacts || []).map((c: Record<string, unknown>) => ({
          id: c.id,
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          email: c.email || '',
          phone: c.phone || '',
          tags: c.tags || [],
          source: c.source || '',
          dateAdded: c.dateAdded || c.createdAt || '',
          lastActivity: c.lastActivity || '',
          type: c.type || '',
          assignedTo: c.assignedTo || '',
        }));

        logStep("Fetched GHL contacts", { count: contacts.length, days });
        result = { contacts, total: data?.total || contacts.length };
        break;
      }

      // ── Get conversations for a contact ──
      case "get-conversations": {
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

        const contactId = params.contactId;
        if (!contactId) throw new Error("contactId is required");

        const data = await ghlFetch(
          `/conversations/search?locationId=${locationId}&contactId=${contactId}`,
          "GET"
        );

        const conversations = (data?.conversations || []).map((conv: Record<string, unknown>) => ({
          id: conv.id,
          contactId: conv.contactId,
          lastMessageBody: conv.lastMessageBody || '',
          lastMessageDate: conv.lastMessageDate || '',
          lastMessageType: conv.lastMessageType || '',
          lastMessageDirection: conv.lastMessageDirection || '',
          unreadCount: conv.unreadCount || 0,
        }));

        logStep("Fetched conversations", { contactId, count: conversations.length });
        result = { conversations };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
