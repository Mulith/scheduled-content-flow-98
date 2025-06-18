
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useVoices } from '@/hooks/useVoices';
import { ContentChannel } from './types';
import { availableVideoStyles } from './channelConstants';

export const useChannelData = () => {
  const [channels, setChannels] = useState<ContentChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { voices } = useVoices();

  const loadExistingChannels = async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      console.log('Loading channels for user:', user.user.id);

      // Load channels from database
      const { data: dbChannels, error } = await supabase
        .from('content_channels')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading channels:', error);
        toast({
          title: "Error",
          description: "Failed to load your channels",
          variant: "destructive",
        });
        return;
      }

      console.log('Loaded channels from database:', dbChannels);

      // Transform database channels to UI format
      const transformedChannels: ContentChannel[] = (dbChannels || []).map(dbChannel => {
        // Find the voice from the voices data
        const voiceData = voices.find(v => v.id === dbChannel.selected_voice);
        
        return {
          id: dbChannel.id,
          name: dbChannel.name,
          socialAccount: {
            platform: dbChannel.platform as "youtube" | "tiktok",
            accountName: dbChannel.account_name,
            connected: true,
          },
          theme: {
            id: dbChannel.selected_video_types[0] || 'story',
            name: availableVideoStyles.find(v => v.id === dbChannel.selected_video_types[0])?.name || 'Story Format',
            color: availableVideoStyles.find(v => v.id === dbChannel.selected_video_types[0])?.color || 'from-blue-500 to-cyan-500',
          },
          voice: {
            id: dbChannel.selected_voice,
            name: voiceData?.name || 'Loading...',
            type: voiceData?.type || 'free',
          },
          topic: dbChannel.topic_mode === 'ai-decide' ? 'AI-Generated Topics' : `Custom: ${dbChannel.selected_topics.join(', ')}`,
          schedule: dbChannel.schedule,
          status: dbChannel.subscription_status as "active" | "paused" | "setup",
          lastGenerated: "Not yet generated",
          totalVideos: 0,
          isActive: dbChannel.is_active || false,
        };
      });
      
      setChannels(transformedChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
      toast({
        title: "Error",
        description: "Failed to load your channels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reload channels when voices data is available
  useEffect(() => {
    if (voices.length > 0 && channels.length > 0) {
      // Update channels with correct voice names
      const updatedChannels = channels.map(channel => {
        const voiceData = voices.find(v => v.id === channel.voice.id);
        if (voiceData && channel.voice.name === 'Loading...') {
          return {
            ...channel,
            voice: {
              ...channel.voice,
              name: voiceData.name,
              type: voiceData.type,
            }
          };
        }
        return channel;
      });
      
      if (updatedChannels.some(channel => channel.voice.name !== channels.find(c => c.id === channel.id)?.voice.name)) {
        setChannels(updatedChannels);
      }
    }
  }, [voices, channels.length]);

  useEffect(() => {
    loadExistingChannels();
  }, []);

  const handleDeleteChannel = (channelId: string) => {
    const updatedChannels = channels.filter(c => c.id !== channelId);
    setChannels(updatedChannels);
    toast({
      title: "Channel Deleted",
      description: "Content channel has been removed",
    });
  };

  const handleToggleStatus = (channelId: string) => {
    const updatedChannels = channels.map(channel => {
      if (channel.id === channelId) {
        const newStatus: "active" | "paused" = channel.status === "active" ? "paused" : "active";
        return { ...channel, status: newStatus };
      }
      return channel;
    });
    setChannels(updatedChannels);
  };

  return {
    channels,
    isLoading,
    setChannels,
    handleDeleteChannel,
    handleToggleStatus,
  };
};
