
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
    
    // Your curated list of voices with real ElevenLabs IDs
    const curatedVoices = [
      // Female voices
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
        id: "EXAVITQu4vr4xnSDxMaL", // Sarah
        name: "Sarah",
        type: "free",
        description: "Professional female voice ideal for educational content",
        accent: "American",
        gender: "female",
        preview: "Welcome to another episode. I'm Sarah, your guide to knowledge.",
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
      {
        id: "aRlmTYIQo6Tlg5SlulGC", // Emma
        name: "Emma",
        type: "free",
        description: "Clear, articulate female voice perfect for storytelling",
        accent: "American",
        gender: "female",
        preview: "Welcome everyone! I'm Emma, ready to share incredible stories with you.",
      },
      {
        id: "ZF6FPAbjXT4488VcRRnw", // Grace
        name: "Grace",
        type: "free",
        description: "Elegant female voice ideal for premium content",
        accent: "British",
        gender: "female",
        preview: "Good day! I'm Grace, here to elevate your listening experience.",
      },
      {
        id: "WzsP0bfiCpSDfNgLrUuN", // Sophia
        name: "Sophia",
        type: "free",
        description: "Sophisticated female voice great for business content",
        accent: "American",
        gender: "female",
        preview: "Hello there! I'm Sophia, your professional content narrator.",
      },
      // Male voices
      {
        id: "IKne3meq5aSn9XLyUdCD", // Charlie
        name: "Charlie",
        type: "free",
        description: "Versatile male voice perfect for various content types",
        accent: "American",
        gender: "male",
        preview: "Hi everyone! I'm Charlie, ready to bring your content to life.",
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
        id: "nPczCjzI2devNBz1zQrb", // Brian
        name: "Brian",
        type: "free",
        description: "Professional male voice excellent for educational content",
        accent: "American",
        gender: "male",
        preview: "Hello! I'm Brian, your guide to learning something new today.",
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
        id: "FGY2WhTYpPnrIDTdsKH5",
        name: "Laura",
        type: "free",
        description: "Warm, friendly female voice",
        accent: "American",
        gender: "female",
        preview: "Hello! I'm Laura, ready to help you today.",
      },
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
        id: "XrExE9yKIg1WjnnlVkGX",
        name: "Matilda",
        type: "free",
        description: "Energetic female voice",
        accent: "British",
        gender: "female",
        preview: "Get ready! This is Matilda with your motivation.",
      },
      {
        id: "aRlmTYIQo6Tlg5SlulGC",
        name: "Emma",
        type: "free",
        description: "Clear, articulate female voice",
        accent: "American",
        gender: "female",
        preview: "Welcome! I'm Emma, ready to share stories.",
      },
      {
        id: "ZF6FPAbjXT4488VcRRnw",
        name: "Grace",
        type: "free",
        description: "Elegant female voice",
        accent: "British",
        gender: "female",
        preview: "Good day! I'm Grace, here to help.",
      },
      {
        id: "WzsP0bfiCpSDfNgLrUuN",
        name: "Sophia",
        type: "free",
        description: "Sophisticated female voice",
        accent: "American",
        gender: "female",
        preview: "Hello! I'm Sophia, your narrator.",
      },
      {
        id: "IKne3meq5aSn9XLyUdCD",
        name: "Charlie",
        type: "free",
        description: "Versatile male voice",
        accent: "American",
        gender: "male",
        preview: "Hi! I'm Charlie, ready to help.",
      },
      {
        id: "JBFqnCBsd6RMkjVDRZzb",
        name: "George",
        type: "free",
        description: "Deep, authoritative male voice",
        accent: "American",
        gender: "male",
        preview: "Good day, I'm George. Let's explore insights.",
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
        id: "nPczCjzI2devNBz1zQrb",
        name: "Brian",
        type: "free",
        description: "Professional male voice",
        accent: "American",
        gender: "male",
        preview: "Hello! I'm Brian, your guide to learning.",
      },
    ];
    
    return new Response(JSON.stringify({ voices: fallbackVoices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
