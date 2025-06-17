
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
      
      // Fallback to 6 curated voices if API fails
      setVoices([
        {
          id: "aria",
          name: "Aria",
          type: "free",
          description: "Warm, friendly female voice perfect for lifestyle content",
          accent: "American",
          gender: "female",
          preview: "Hello! I'm Aria, and I'll be narrating your amazing content today.",
        },
        {
          id: "sarah",
          name: "Sarah",
          type: "free",
          description: "Professional female voice ideal for educational content",
          accent: "American", 
          gender: "female",
          preview: "Welcome to another episode. I'm Sarah, your guide to knowledge.",
        },
        {
          id: "charlotte",
          name: "Charlotte",
          type: "free",
          description: "Energetic female voice great for motivational content",
          accent: "British",
          gender: "female", 
          preview: "Get ready to transform your life! This is Charlotte with your daily motivation.",
        },
        {
          id: "roger",
          name: "Roger",
          type: "free",
          description: "Deep, authoritative male voice perfect for business content",
          accent: "American",
          gender: "male",
          preview: "Good day, I'm Roger. Let's dive into today's business insights.",
        },
        {
          id: "liam",
          name: "Liam",
          type: "free", 
          description: "Friendly male voice ideal for tutorials and how-to content",
          accent: "American",
          gender: "male",
          preview: "Hey there! I'm Liam, and I'll walk you through this step by step.",
        },
        {
          id: "will",
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
