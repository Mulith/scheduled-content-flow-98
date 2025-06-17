
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Voice {
  id: string;
  name: string;
  type: "free" | "premium";
  description: string;
  accent: string;
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
      
      // Fallback to original mock data if API fails
      setVoices([
        {
          id: "aria",
          name: "Aria",
          type: "free",
          description: "Warm, friendly female voice perfect for lifestyle content",
          accent: "American",
          preview: "Hello! I'm Aria, and I'll be narrating your amazing content today.",
        },
        {
          id: "marcus",
          name: "Marcus",
          type: "free",
          description: "Professional male voice ideal for business and productivity",
          accent: "American",
          preview: "Welcome to another episode. I'm Marcus, your guide to success.",
        },
        {
          id: "sofia",
          name: "Sofia",
          type: "free",
          description: "Energetic female voice great for motivational content",
          accent: "American",
          preview: "Get ready to transform your life! This is Sofia with your daily motivation.",
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
