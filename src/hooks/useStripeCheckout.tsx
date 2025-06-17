
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
      
      console.log('Creating checkout session with:', { schedule, channelName, channelData });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          schedule, 
          channelName,
          channelData 
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data) {
        throw new Error('No response data received from checkout function');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        console.log('Opening checkout URL:', data.url);
        // Open Stripe checkout in a new tab
        const newWindow = window.open(data.url, '_blank');
        
        if (!newWindow) {
          // Fallback if popup blocked
          window.location.href = data.url;
        }
        
        toast({
          title: "Redirecting to Checkout",
          description: "Opening Stripe checkout...",
        });
        
        return true;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckoutSession, isLoading };
};
