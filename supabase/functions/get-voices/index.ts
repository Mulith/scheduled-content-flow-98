
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
    
    // Your curated list of voices with real ElevenLabs IDs and accurate previews
    const curatedVoices = [
      // Female voices
      {
        id: "FGY2WhTYpPnrIDTdsKH5", // Laura
        name: "Laura",
        type: "free",
        description: "Warm, friendly female voice perfect for lifestyle content",
        accent: "American",
        gender: "female",
        preview: "Hi there! I'm Laura, and I'm excited to help you create amazing content today. This is how I sound with my warm American accent.",
      },
      {
        id: "EXAVITQu4vr4xnSDxMaL", // Sarah
        name: "Sarah",
        type: "free",
        description: "Professional female voice ideal for educational content",
        accent: "American",
        gender: "female",
        preview: "Welcome to this educational session. I'm Sarah, your professional guide with a clear American accent, ready to share knowledge.",
      },
      {
        id: "XrExE9yKIg1WjnnlVkGX", // Matilda
        name: "Matilda",
        type: "free",
        description: "Energetic female voice great for motivational content",
        accent: "British",
        gender: "female",
        preview: "Right then! I'm Matilda, and I'm absolutely thrilled to motivate you today with my energetic British accent. Let's get started!",
      },
      {
        id: "aRlmTYIQo6Tlg5SlulGC", // Emma
        name: "Emma",
        type: "free",
        description: "Clear, articulate female voice perfect for storytelling",
        accent: "American",
        gender: "female",
        preview: "Hello everyone! I'm Emma, and I love telling stories with my clear, articulate American voice. Let me share something wonderful with you.",
      },
      {
        id: "ZF6FPAbjXT4488VcRRnw", // Grace
        name: "Grace",
        type: "free",
        description: "Elegant female voice ideal for premium content",
        accent: "British",
        gender: "female",
        preview: "Good afternoon! I'm Grace, speaking with an elegant British accent. I'm delighted to elevate your listening experience today.",
      },
      {
        id: "WzsP0bfiCpSDfNgLrUuN", // Sophia
        name: "Sophia",
        type: "free",
        description: "Sophisticated female voice great for business content",
        accent: "American",
        gender: "female",
        preview: "Hello there! I'm Sophia, your sophisticated narrator with a professional American accent. Let's dive into today's business insights.",
      },
      // Male voices
      {
        id: "IKne3meq5aSn9XLyUdCD", // Charlie
        name: "Charlie",
        type: "free",
        description: "Versatile male voice perfect for various content types",
        accent: "American",
        gender: "male",
        preview: "Hey everyone! I'm Charlie, bringing you content with my versatile American voice. I'm ready to adapt to whatever style you need.",
      },
      {
        id: "JBFqnCBsd6RMkjVDRZzb", // George
        name: "George",
        type: "free",
        description: "Deep, authoritative male voice perfect for business content",
        accent: "American",
        gender: "male",
        preview: "Good day, I'm George. With my deep, authoritative American voice, I'm here to guide you through today's business insights with confidence.",
      },
      {
        id: "bIHbv24MWmeRgasZH58o", // Will
        name: "Will",
        type: "free",
        description: "Engaging male voice great for storytelling and narratives",
        accent: "British",
        gender: "male",
        preview: "Greetings! I'm Will, and I'm delighted to share stories with you using my engaging British accent. Shall we begin this tale?",
      },
      {
        id: "TX3LPaxmHKxFdv7VOQHJ", // Liam
        name: "Liam",
        type: "free",
        description: "Friendly male voice ideal for tutorials and how-to content",
        accent: "American",
        gender: "male",
        preview: "Hey there! I'm Liam, and I'll walk you through everything step by step with my friendly American accent. Let's learn together!",
      },
      {
        id: "nPczCjzI2devNBz1zQrb", // Brian
        name: "Brian",
        type: "free",
        description: "Professional male voice excellent for educational content",
        accent: "American",
        gender: "male",
        preview: "Hello! I'm Brian, your educational guide with a professional American accent. I'm excited to help you learn something new today.",
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
    
    // Fallback voices with the same real ElevenLabs IDs and accurate previews
    const fallbackVoices = [
      {
        id: "FGY2WhTYpPnrIDTdsKH5",
        name: "Laura",
        type: "free",
        description: "Warm, friendly female voice",
        accent: "American",
        gender: "female",
        preview: "Hi there! I'm Laura with my warm American accent.",
      },
      {
        id: "EXAVITQu4vr4xnSDxMaL",
        name: "Sarah",
        type: "free",
        description: "Professional female voice",
        accent: "American",
        gender: "female",
        preview: "Welcome! I'm Sarah with my professional American voice.",
      },
      {
        id: "XrExE9yKIg1WjnnlVkGX",
        name: "Matilda",
        type: "free",
        description: "Energetic female voice",
        accent: "British",
        gender: "female",
        preview: "Right then! I'm Matilda with my energetic British accent.",
      },
      {
        id: "aRlmTYIQo6Tlg5SlulGC",
        name: "Emma",
        type: "free",
        description: "Clear, articulate female voice",
        accent: "American",
        gender: "female",
        preview: "Hello! I'm Emma with my clear American voice.",
      },
      {
        id: "ZF6FPAbjXT4488VcRRnw",
        name: "Grace",
        type: "free",
        description: "Elegant female voice",
        accent: "British",
        gender: "female",
        preview: "Good afternoon! I'm Grace with my elegant British accent.",
      },
      {
        id: "WzsP0bfiCpSDfNgLrUuN",
        name: "Sophia",
        type: "free",
        description: "Sophisticated female voice",
        accent: "American",
        gender: "female",
        preview: "Hello! I'm Sophia with my sophisticated American accent.",
      },
      {
        id: "IKne3meq5aSn9XLyUdCD",
        name: "Charlie",
        type: "free",
        description: "Versatile male voice",
        accent: "American",
        gender: "male",
        preview: "Hey everyone! I'm Charlie with my versatile American voice.",
      },
      {
        id: "JBFqnCBsd6RMkjVDRZzb",
        name: "George",
        type: "free",
        description: "Deep, authoritative male voice",
        accent: "American",
        gender: "male",
        preview: "Good day, I'm George with my deep American voice.",
      },
      {
        id: "bIHbv24MWmeRgasZH58o",
        name: "Will",
        type: "free",
        description: "Engaging male voice",
        accent: "British",
        gender: "male",
        preview: "Greetings! I'm Will with my engaging British accent.",
      },
      {
        id: "TX3LPaxmHKxFdv7VOQHJ",
        name: "Liam",
        type: "free",
        description: "Friendly male voice",
        accent: "American",
        gender: "male",
        preview: "Hey there! I'm Liam with my friendly American accent.",
      },
      {
        id: "nPczCjzI2devNBz1zQrb",
        name: "Brian",
        type: "free",
        description: "Professional male voice",
        accent: "American",
        gender: "male",
        preview: "Hello! I'm Brian with my professional American accent.",
      },
    ];
    
    return new Response(JSON.stringify({ voices: fallbackVoices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
