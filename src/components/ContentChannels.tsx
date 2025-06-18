
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useYouTubeAuth } from "@/hooks/useYouTubeAuth";
import { ChannelCreation } from "./ChannelCreation";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { ChannelGrid } from "./channel/ChannelGrid";
import { useChannelData } from "./channel/useChannelData";
import { ContentChannel } from "./channel/types";

interface ContentChannelsProps {
  onChannelsUpdate?: (channels: ContentChannel[]) => void;
  onChannelSelect?: (channelId: string | null) => void;
}

export const ContentChannels = ({ onChannelsUpdate, onChannelSelect }: ContentChannelsProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [connectedYouTubeChannels, setConnectedYouTubeChannels] = useState<any[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  const { fetchConnectedChannels } = useYouTubeAuth();
  const { createCheckoutSession } = useStripeCheckout();
  const { 
    channels, 
    isLoading, 
    setChannels, 
    handleDeleteChannel, 
    handleToggleStatus 
  } = useChannelData();

  useEffect(() => {
    loadConnectedChannels();
  }, []);

  useEffect(() => {
    onChannelsUpdate?.(channels);
  }, [channels, onChannelsUpdate]);

  const loadConnectedChannels = async () => {
    const youtubeChannels = await fetchConnectedChannels();
    setConnectedYouTubeChannels(youtubeChannels);
  };

  const handleChannelFormSubmit = async (data: {
    formData: any;
    selectedVideoStyles: string[];
    selectedThemes: string[];
  }) => {
    console.log("ContentChannels - handleChannelFormSubmit called with:", data);
    
    try {
      setIsCreatingChannel(true);
      
      const { formData, selectedVideoStyles, selectedThemes } = data;
      const channelName = `${formData.accountName} Channel`;
      
      const channelData = {
        selectedVideoTypes: selectedVideoStyles,
        selectedVoice: formData.voice,
        selectedThemes: selectedThemes,
        topicMode: formData.topic,
        selectedTopics: [],
        platform: formData.platform,
        accountName: formData.accountName
      };

      console.log("ContentChannels - Creating checkout with:", {
        schedule: formData.schedule,
        channelName,
        channelData
      });

      const success = await createCheckoutSession(formData.schedule, channelName, channelData);
      
      if (success) {
        setIsCreateDialogOpen(false);
        toast({
          title: "Redirecting to Checkout",
          description: "Opening Stripe checkout...",
        });
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleChannelClick = (channelId: string) => {
    onChannelSelect?.(channelId);
  };

  const handleChannelDelete = (channelId: string) => {
    handleDeleteChannel(channelId);
    const updatedChannels = channels.filter(c => c.id !== channelId);
    onChannelsUpdate?.(updatedChannels);
  };

  const handleChannelToggle = (channelId: string) => {
    handleToggleStatus(channelId);
    const updatedChannels = channels.map(channel => {
      if (channel.id === channelId) {
        const newStatus: "active" | "paused" = channel.status === "active" ? "paused" : "active";
        return { ...channel, status: newStatus };
      }
      return channel;
    });
    onChannelsUpdate?.(updatedChannels);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Content Channels</h2>
            <p className="text-gray-400">Loading your channels...</p>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Content Channels</h2>
          <p className="text-gray-400">Create and manage your content channels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content Channel</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new channel with its own video styles, voice, and topic configuration
              </DialogDescription>
            </DialogHeader>
            
            <ChannelCreation
              isDialog={true}
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleChannelFormSubmit}
              isCreating={isCreatingChannel}
              playingVoice={playingVoice}
              onVoicePreview={setPlayingVoice}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ChannelGrid
        channels={channels}
        onChannelClick={handleChannelClick}
        onToggleStatus={handleChannelToggle}
        onDeleteChannel={handleChannelDelete}
        onCreateChannel={() => setIsCreateDialogOpen(true)}
      />
    </div>
  );
};
