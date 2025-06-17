
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest, createJsonResponse } from "./cors-utils.ts";
import { curatedVoices, fallbackVoices } from "./voices-data.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (apiKey) {
      // If API key is available, we could fetch additional metadata from ElevenLabs
      // For now, we'll use our curated list with real voice IDs
      return createJsonResponse({ voices: curatedVoices });
    } else {
      // Return curated voices even without API key
      return createJsonResponse({ voices: curatedVoices });
    }
  } catch (error) {
    console.error("Error fetching voices:", error);
    
    return createJsonResponse({ voices: fallbackVoices });
  }
});
