
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("=== FUNCTION START ===");
    logStep("Request method", req.method);
    logStep("Request headers", Object.fromEntries(req.headers.entries()));

    // Validate environment variables first
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    logStep("Environment check", {
      hasStripeKey: !!stripeSecretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseAnonKey,
      stripeKeyLength: stripeSecretKey?.length || 0
    });

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are not set");
    }

    // Parse request body
    const requestBody = await req.json();
    const { schedule, channelName, channelData } = requestBody;
    
    logStep("Request data received", { 
      schedule, 
      channelName, 
      hasChannelData: !!channelData,
      channelDataKeys: channelData ? Object.keys(channelData) : []
    });
    
    // Validate required fields
    if (!schedule || !channelName) {
      throw new Error("Missing required fields: schedule and channelName are required");
    }
    
    // Get authenticated user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    logStep("Auth header found", { authHeaderLength: authHeader.length });

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("Authentication error", { error: authError });
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    logStep("Initializing Stripe...");
    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: "2023-10-16" 
    });

    // Define schedule pricing (these will be created dynamically)
    const schedulePricing = {
      "monthly": { amount: 1500, name: "Monthly Plan" },     // $15/month
      "weekly": { amount: 2000, name: "Weekly Plan" },       // $20/month  
      "daily": { amount: 3000, name: "Daily Plan" },         // $30/month
      "twice-daily": { amount: 4500, name: "Twice Daily Plan" } // $45/month
    };

    const selectedPricing = schedulePricing[schedule as keyof typeof schedulePricing];
    if (!selectedPricing) {
      throw new Error(`Invalid schedule selected: ${schedule}`);
    }

    logStep("Schedule pricing selected", { schedule, pricing: selectedPricing });

    // Check if customer exists
    logStep("Checking for existing Stripe customer...");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create new one");
    }

    // Determine origin for redirect URLs
    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://loving-macaroon-0e4f47.netlify.app";
    logStep("Origin determined", { origin });

    // Create checkout session with dynamic pricing
    logStep("Creating Stripe checkout session...");
    const sessionData = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedPricing.name,
              description: `${channelName} - ${selectedPricing.name}`,
            },
            unit_amount: selectedPricing.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        channel_name: channelName,
        schedule: schedule,
        user_id: user.id,
        channel_data: channelData ? JSON.stringify(channelData) : "",
      },
    };

    logStep("Session data prepared", {
      hasCustomer: !!sessionData.customer,
      customerEmail: sessionData.customer_email,
      lineItemsCount: sessionData.line_items.length,
      mode: sessionData.mode,
      amount: selectedPricing.amount,
      successUrl: sessionData.success_url,
      cancelUrl: sessionData.cancel_url
    });

    const session = await stripe.checkout.sessions.create(sessionData);

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      urlLength: session.url?.length || 0
    });

    if (!session.url) {
      throw new Error("Stripe failed to generate checkout session URL");
    }

    // Validate the URL
    try {
      new URL(session.url);
      logStep("URL validation passed");
    } catch (urlError) {
      logStep("URL validation failed", { url: session.url, error: urlError.message });
      throw new Error("Invalid checkout URL generated by Stripe");
    }

    logStep("=== FUNCTION SUCCESS ===");
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("=== FUNCTION ERROR ===", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
