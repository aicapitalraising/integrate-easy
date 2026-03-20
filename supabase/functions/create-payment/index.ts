import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { amount, baseAmount, paymentMethod, name, email, phone, companyName } = await req.json();

    const selectedMethod = paymentMethod === "ach" ? "ach" : "card";
    const normalizedBaseAmount = Number(baseAmount ?? amount);

    if (!Number.isFinite(normalizedBaseAmount) || normalizedBaseAmount < 100) {
      throw new Error("Amount must be at least $1.00 (100 cents)");
    }

    const feeAmount = selectedMethod === "card" ? Math.round(normalizedBaseAmount * 0.03) : 0;
    const totalAmount = normalizedBaseAmount + feeAmount;

    // Check for existing Stripe customer by email
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create a new customer with all their details for future recurring billing
        const customer = await stripe.customers.create({
          email,
          name: name || undefined,
          phone: phone || undefined,
          metadata: {
            company: companyName || "",
            source: "invest-page",
          },
        });
        customerId = customer.id;
      }
    }

    const origin = req.headers.get("origin") || "https://aicapitalraising.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: "prod_U8s3wuMUsTj0Mr",
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/onboarding?payment=success`,
      cancel_url: `${origin}/invest?canceled=true`,
      payment_method_types: selectedMethod === "ach" ? ["us_bank_account"] : ["card"],
      payment_method_options:
        selectedMethod === "ach"
          ? {
              us_bank_account: {
                verification_method: "automatic",
              },
            }
          : undefined,
      payment_intent_data: {
        metadata: {
          customer_name: name || "",
          customer_email: email || "",
          customer_phone: phone || "",
          company: companyName || "",
          payment_method: selectedMethod,
          base_amount: String(normalizedBaseAmount),
          processing_fee: String(feeAmount),
          total_amount: String(totalAmount),
        },
      },
      metadata: {
        customer_name: name || "",
        company: companyName || "",
        payment_method: selectedMethod,
        base_amount: String(normalizedBaseAmount),
        processing_fee: String(feeAmount),
        total_amount: String(totalAmount),
      },
    });

    // Sync payment to GHL asynchronously
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        fetch(`${supabaseUrl}/functions/v1/ghl-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            action: "sync-payment",
            name: name || "",
            email: email || "",
            phone: phone || "",
            company: companyName || "",
            amount: totalAmount,
            paymentMethod: selectedMethod,
          }),
        }).catch((e) => console.error("[CREATE-PAYMENT] GHL sync failed:", e));
      }
    } catch (e) {
      console.error("[CREATE-PAYMENT] GHL sync error:", e);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-PAYMENT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
