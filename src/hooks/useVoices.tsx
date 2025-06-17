
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Voice {
  id: string;
  name: string;
  type: "free" | "premium";
  description: string;
  accent: string;
  gender?: string;
  preview: string;
}

export const useVoices = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-voices');
      
      if (error) {
        throw error;
      }
      
      if (data?.voices) {
        setVoices(data.voices);
      } else {
        throw new Error('No voices data received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voices';
      setError(errorMessage);
      console.error('Error fetching voices:', err);
      
      // Fallback to all curated voices with real ElevenLabs IDs and correct accents
      setVoices([
        // Female voices
        {
          id: "FGY2WhTYpPnrIDTdsKH5",
          name: "Laura",
          type: "free",
          description: "Warm, friendly female voice perfect for lifestyle content",
          accent: "American",
          gender: "female",
          preview: "Hi there! I'm Laura, and I'm excited to help you create amazing content today. This is how I sound with my warm American accent.",
        },
        {
          id: "EXAVITQu4vr4xnSDxMaL",
          name: "Sarah",
          type: "free",
          description: "Professional female voice ideal for educational content",
          accent: "American",
          gender: "female",
          preview: "Welcome to this educational session. I'm Sarah, your professional guide with a clear American accent, ready to share knowledge.",
        },
        {
          id: "XrExE9yKIg1WjnnlVkGX",
          name: "Matilda",
          type: "free",
          description: "Energetic female voice great for motivational content",
          accent: "Australian",
          gender: "female",
          preview: "G'day! I'm Matilda, and I'm absolutely stoked to motivate you today with my energetic Australian accent. Let's get cracking!",
        },
        {
          id: "aRlmTYIQo6Tlg5SlulGC",
          name: "Emma",
          type: "free",
          description: "Clear, articulate female voice perfect for storytelling",
          accent: "British",
          gender: "female",
          preview: "Hello there! I'm Emma, and I do love telling stories with my clear, articulate British voice. Let me share something rather wonderful with you.",
        },
        {
          id: "ZF6FPAbjXT4488VcRRnw",
          name: "Grace",
          type: "free",
          description: "Elegant female voice ideal for premium content",
          accent: "British",
          gender: "female",
          preview: "Good afternoon! I'm Grace, speaking with an elegant British accent. I'm frightfully delighted to elevate your listening experience today.",
        },
        {
          id: "WzsP0bfiCpSDfNgLrUuN",
          name: "Sophia",
          type: "free",
          description: "Sophisticated female voice great for business content",
          accent: "American",
          gender: "female",
          preview: "Hello there! I'm Sophia, your sophisticated narrator with a professional American accent. Let's dive into today's business insights.",
        },
        // Male voices
        {
          id: "IKne3meq5aSn9XLyUdCD",
          name: "Charlie",
          type: "free",
          description: "Versatile male voice perfect for various content types",
          accent: "Australian",
          gender: "male",
          preview: "G'day mate! I'm Charlie, bringing you content with my versatile Australian voice. I'm ready to adapt to whatever style you need, no worries!",
        },
        {
          id: "JBFqnCBsd6RMkjVDRZzb",
          name: "George",
          type: "free",
          description: "Deep, authoritative male voice perfect for business content",
          accent: "British",
          gender: "male",
          preview: "Good day, I'm George. With my deep, authoritative British voice, I'm here to guide you through today's business insights with utmost confidence.",
        },
        {
          id: "bIHbv24MWmeRgasZH58o",
          name: "Will",
          type: "free",
          description: "Engaging male voice great for storytelling and narratives",
          accent: "British",
          gender: "male",
          preview: "Greetings! I'm Will, and I'm absolutely delighted to share stories with you using my engaging British accent. Shall we begin this tale?",
        },
        {
          id: "TX3LPaxmHKxFdv7VOQHJ",
          name: "Liam",
          type: "free",
          description: "Friendly male voice ideal for tutorials and how-to content",
          accent: "American",
          gender: "male",
          preview: "Hey there! I'm Liam, and I'll walk you through everything step by step with my friendly American accent. Let's learn together!",
        },
        {
          id: "nPczCjzI2devNBz1zQrb",
          name: "Brian",
          type: "free",
          description: "Professional male voice excellent for educational content",
          accent: "American",
          gender: "male",
          preview: "Hello! I'm Brian, your educational guide with a professional American accent. I'm excited to help you learn something new today.",
        },
      ]);
      
      toast({
        title: "Voice Loading Issue",
        description: "Using fallback voices. Please check your connection.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  return { voices, isLoading, error, refetch: fetchVoices };
};
