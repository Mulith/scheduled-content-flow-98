
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
    
    // Your curated list of 6 voices (3 male, 3 female) with real ElevenLabs IDs
    const curatedVoices = [
      // Female voices
      {
        id: "EXAVITQu4vr4xnSDxMaL", // Sarah
        name: "Sarah",
        type: "free",
        description: "Professional female voice ideal for educational content",
        accent: "American",
        gender: "female",
        preview: "Welcome to another episode. I'm Sarah, your guide to knowledge.",
      },
      {
        id: "FGY2WhTYpPnrIDTdsKH5", // Laura
        name: "Laura",
        type: "free",
        description: "Warm, friendly female voice perfect for lifestyle content",
        accent: "American",
        gender: "female",
        preview: "Hello! I'm Laura, and I'll be narrating your amazing content today.",
      },
      {
        id: "XrExE9yKIg1WjnnlVkGX", // Matilda
        name: "Matilda",
        type: "free",
        description: "Energetic female voice great for motivational content",
        accent: "British",
        gender: "female",
        preview: "Get ready to transform your life! This is Matilda with your daily motivation.",
      },
      // Male voices
      {
        id: "TX3LPaxmHKxFdv7VOQHJ", // Liam
        name: "Liam",
        type: "free",
        description: "Friendly male voice ideal for tutorials and how-to content",
        accent: "American",
        gender: "male",
        preview: "Hey there! I'm Liam, and I'll walk you through this step by step.",
      },
      {
        id: "JBFqnCBsd6RMkjVDRZzb", // George
        name: "George",
        type: "free",
        description: "Deep, authoritative male voice perfect for business content",
        accent: "American",
        gender: "male",
        preview: "Good day, I'm George. Let's dive into today's business insights.",
      },
      {
        id: "bIHbv24MWmeRgasZH58o", // Will
        name: "Will",
        type: "free",
        description: "Engaging male voice great for storytelling and narratives",
        accent: "British",
        gender: "male",
        preview: "Welcome, I'm Will. Let me tell you an incredible story.",
      },
    ];

    if (apiKey) {
      // If API key is available, we could fetch additional metadata from ElevenLabs
      // For now, we'll use our curated list with real voice IDs
      return new Response(JSON.stringify({ voices: curatedVoices }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Return curated voices even without API key
      return new Response(JSON.stringify({ voices: curatedVoices }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching voices:", error);
    
    // Fallback voices with the same real ElevenLabs IDs
    const fallbackVoices = [
      {
        id: "EXAVITQu4vr4xnSDxMaL",
        name: "Sarah",
        type: "free",
        description: "Professional female voice",
        accent: "American",
        gender: "female",
        preview: "Welcome! I'm Sarah, your guide to success.",
      },
      {
        id: "FGY2WhTYpPnrIDTdsKH5",
        name: "Laura",
        type: "free",
        description: "Warm, friendly female voice",
        accent: "American",
        gender: "female",
        preview: "Hello! I'm Laura, ready to help you today.",
      },
      {
        id: "XrExE9yKIg1WjnnlVkGX",
        name: "Matilda",
        type: "free",
        description: "Energetic female voice",
        accent: "British",
        gender: "female",
        preview: "Get ready! This is Matilda with your motivation.",
      },
      {
        id: "TX3LPaxmHKxFdv7VOQHJ",
        name: "Liam",
        type: "free",
        description: "Friendly male voice",
        accent: "American",
        gender: "male",
        preview: "Hey there! I'm Liam, ready to guide you.",
      },
      {
        id: "JBFqnCBsd6RMkjVDRZzb",
        name: "George",
        type: "free",
        description: "Deep, authoritative male voice",
        accent: "American",
        gender: "male",
        preview: "Good day, I'm George. Let's explore today's insights.",
      },
      {
        id: "bIHbv24MWmeRgasZH58o",
        name: "Will",
        type: "free",
        description: "Engaging male voice",
        accent: "British",
        gender: "male",
        preview: "Welcome, I'm Will. Let me share a story.",
      },
    ];
    
    return new Response(JSON.stringify({ voices: fallbackVoices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
