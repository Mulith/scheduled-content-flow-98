
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
      
      console.log('=== CHECKOUT SESSION START ===');
      console.log('Creating checkout session with:', { schedule, channelName, channelData });
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('User authentication check:', { user: user?.email, error: authError });
      
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in first.');
      }

      console.log('Calling Supabase function create-checkout...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          schedule, 
          channelName,
          channelData 
        }
      });

      console.log('=== SUPABASE FUNCTION RESPONSE ===');
      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Supabase function error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data) {
        console.error('No response data received from checkout function');
        throw new Error('No response data received from checkout function');
      }

      console.log('Function returned data:', JSON.stringify(data, null, 2));

      if (data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (data.url) {
        console.log('=== STRIPE CHECKOUT URL RECEIVED ===');
        console.log('Checkout URL:', data.url);
        
        // Validate URL format
        try {
          new URL(data.url);
          console.log('URL validation passed');
        } catch (urlError) {
          console.error('Invalid URL received:', data.url);
          throw new Error('Invalid checkout URL received');
        }
        
        console.log('Attempting to open checkout URL...');
        
        // Try to open in new window first
        const newWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
        
        if (newWindow && !newWindow.closed) {
          console.log('Successfully opened checkout in new window');
          
          toast({
            title: "Redirecting to Checkout",
            description: "Opening Stripe checkout in a new tab...",
          });
          
          return true;
        } else {
          console.log('Popup blocked or failed, trying direct redirect...');
          
          // Fallback: direct redirect
          window.location.href = data.url;
          
          toast({
            title: "Redirecting to Checkout",
            description: "Redirecting to Stripe checkout...",
          });
          
          return true;
        }
      } else {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      console.log('=== CHECKOUT SESSION END ===');
    }
  };

  return { createCheckoutSession, isLoading };
};
