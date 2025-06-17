
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    logStep("=== FUNCTION START ===");
    
    const { sessionId } = await req.json();
    logStep("Session ID received", { sessionId });

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Validate environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    logStep("Retrieving Stripe session...");
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });
    
    logStep("Session retrieved", { 
      status: session.payment_status,
      customerId: session.customer,
      subscriptionId: session.subscription
    });

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Extract channel data from session metadata
    const metadata = session.metadata || {};
    const channelData = metadata.channel_data ? JSON.parse(metadata.channel_data) : {};
    
    logStep("Channel data extracted", { metadata, channelData });

    // Check if channel already exists for this session
    const { data: existingChannel } = await supabaseClient
      .from('content_channels')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingChannel) {
      logStep("Channel already exists for this session", { channelId: existingChannel.id });
      return new Response(JSON.stringify({ 
        success: true, 
        channel: existingChannel,
        message: "Channel already created"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the channel record
    const channelRecord = {
      user_id: user.id,
      name: metadata.channel_name || 'New Channel',
      platform: channelData.platform || 'youtube',
      account_name: channelData.accountName || 'Unknown Account',
      stripe_session_id: sessionId,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      subscription_status: 'active',
      schedule: metadata.schedule || 'daily',
      selected_video_types: channelData.selectedVideoTypes || [],
      selected_voice: channelData.selectedVoice || 'aria',
      topic_mode: channelData.topicMode || 'ai-decide',
      selected_topics: channelData.selectedTopics || [],
    };

    logStep("Creating channel record", channelRecord);

    const { data: newChannel, error: insertError } = await supabaseClient
      .from('content_channels')
      .insert(channelRecord)
      .select()
      .single();

    if (insertError) {
      logStep("Error creating channel", { error: insertError });
      throw new Error(`Failed to create channel: ${insertError.message}`);
    }

    logStep("Channel created successfully", { channelId: newChannel.id });

    return new Response(JSON.stringify({ 
      success: true, 
      channel: newChannel,
      message: "Channel created successfully"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("=== FUNCTION ERROR ===", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
