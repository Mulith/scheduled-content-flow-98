
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      throw new Error("ElevenLabs API key not found");
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform ElevenLabs voices to our format
    const transformedVoices = data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      type: voice.category === "premade" ? "free" : "premium",
      description: voice.description || `${voice.name} voice`,
      accent: voice.labels?.accent || "Various",
      preview: `Hello! I'm ${voice.name}, and I'll be narrating your amazing content today.`,
    }));

    return new Response(JSON.stringify({ voices: transformedVoices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching voices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
