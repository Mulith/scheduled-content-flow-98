
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useYouTubeAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectYouTube = async () => {
    try {
      setIsConnecting(true);
      
      // Get auth URL from edge function
      const { data, error } = await supabase.functions.invoke('youtube-auth', {
        body: { action: 'getAuthUrl' }
      });

      if (error) throw error;

      // Redirect to YouTube OAuth
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('YouTube connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to YouTube. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('youtube-auth', {
        body: { 
          action: 'exchangeCode',
          code,
          state 
        }
      });

      if (error) throw error;

      toast({
        title: "YouTube Connected!",
        description: `Successfully connected ${data.channel.name}`,
      });

      return data.channel;
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to complete YouTube connection.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchConnectedChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('connected_at', { ascending: false });

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  };

  return {
    isConnecting,
    connectYouTube,
    handleOAuthCallback,
    fetchConnectedChannels,
  };
};
