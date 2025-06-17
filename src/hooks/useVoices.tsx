
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
      
      // Fallback to 6 curated voices with real ElevenLabs IDs if API fails
      setVoices([
        {
          id: "EXAVITQu4vr4xnSDxMaL",
          name: "Sarah",
          type: "free",
          description: "Professional female voice ideal for educational content",
          accent: "American",
          gender: "female",
          preview: "Welcome to another episode. I'm Sarah, your guide to knowledge.",
        },
        {
          id: "FGY2WhTYpPnrIDTdsKH5",
          name: "Laura",
          type: "free",
          description: "Warm, friendly female voice perfect for lifestyle content",
          accent: "American", 
          gender: "female",
          preview: "Hello! I'm Laura, and I'll be narrating your amazing content today.",
        },
        {
          id: "XrExE9yKIg1WjnnlVkGX",
          name: "Matilda",
          type: "free",
          description: "Energetic female voice great for motivational content",
          accent: "British",
          gender: "female", 
          preview: "Get ready to transform your life! This is Matilda with your daily motivation.",
        },
        {
          id: "TX3LPaxmHKxFdv7VOQHJ",
          name: "Liam",
          type: "free", 
          description: "Friendly male voice ideal for tutorials and how-to content",
          accent: "American",
          gender: "male",
          preview: "Hey there! I'm Liam, and I'll walk you through this step by step.",
        },
        {
          id: "JBFqnCBsd6RMkjVDRZzb",
          name: "George",
          type: "free",
          description: "Deep, authoritative male voice perfect for business content",
          accent: "American",
          gender: "male",
          preview: "Good day, I'm George. Let's dive into today's business insights.",
        },
        {
          id: "bIHbv24MWmeRgasZH58o",
          name: "Will",
          type: "free",
          description: "Engaging male voice great for storytelling and narratives", 
          accent: "British",
          gender: "male",
          preview: "Welcome, I'm Will. Let me tell you an incredible story.",
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
