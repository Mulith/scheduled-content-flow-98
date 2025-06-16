
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface YouTubeChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_handle: string | null;
  thumbnail_url: string | null;
  subscriber_count: number;
  video_count: number;
  connected_at: string;
}

export const useYouTubeChannels = () => {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const fetchChannels = async () => {
    if (!user || !session) {
      setChannels([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('youtube_channels')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching YouTube channels:', fetchError);
        setError('Failed to fetch YouTube channels');
        return;
      }

      setChannels(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchChannels:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const connectYouTube = async () => {
    if (!session?.access_token) {
      setError('Not authenticated');
      return;
    }

    try {
      const response = await supabase.functions.invoke('youtube-auth', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        console.error('YouTube auth error:', response.error);
        setError('Failed to initiate YouTube connection');
        return;
      }

      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (err) {
      console.error('Error connecting YouTube:', err);
      setError('Failed to connect YouTube');
    }
  };

  const disconnectChannel = async (channelId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', channelId);

      if (deleteError) {
        console.error('Error disconnecting channel:', deleteError);
        setError('Failed to disconnect channel');
        return;
      }

      await fetchChannels();
    } catch (err) {
      console.error('Error in disconnectChannel:', err);
      setError('Failed to disconnect channel');
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [user, session]);

  return {
    channels,
    loading,
    error,
    connectYouTube,
    disconnectChannel,
    refetch: fetchChannels
  };
};
