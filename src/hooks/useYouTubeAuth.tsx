
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useYouTubeAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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

  const updateChannelEnabled = async (channelId: string, enabled: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-auth', {
        body: { 
          action: 'updateChannelEnabled',
          channelId,
          enabled 
        }
      });

      if (error) throw error;

      return true;
      
    } catch (error) {
      console.error('Channel update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update channel settings.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disconnectYouTube = async () => {
    try {
      setIsDisconnecting(true);
      
      const { data, error } = await supabase.functions.invoke('youtube-auth', {
        body: { action: 'disconnect' }
      });

      if (error) throw error;

      toast({
        title: "Disconnected! 👋",
        description: "YouTube account has been disconnected successfully.",
      });

      return true;
      
    } catch (error) {
      console.error('YouTube disconnection error:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect YouTube account.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDisconnecting(false);
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
        title: "Skadoosh! 🥋",
        description: data.message || `Successfully connected ${data.channels?.length || 1} YouTube channel(s)`,
      });

      return data.channels || [];
      
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
    isDisconnecting,
    connectYouTube,
    disconnectYouTube,
    handleOAuthCallback,
    fetchConnectedChannels,
    updateChannelEnabled,
  };
};
