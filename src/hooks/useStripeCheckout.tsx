
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async (
    schedule: string, 
    channelName: string,
    channelData?: {
      selectedVideoTypes: string[];
      selectedVoice: string;
      topicMode: string;
      selectedTopics: string[];
      platform: string;
      accountName: string;
    }
  ) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          schedule, 
          channelName,
          channelData 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        return true;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckoutSession, isLoading };
};
