
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
  sampleUrl: string; // Add sampleUrl to interface
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
      
      // This fallback should match exactly what's in the supabase function
      // Remove any duplicate or inconsistent voice definitions
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
