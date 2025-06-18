import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CreditCard, Loader2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelBasicInfo } from "./ChannelBasicInfo";
import { VideoStyleSelector } from "./VideoStyleSelector";
import { ScheduleSelector } from "./ScheduleSelector";
import { VoiceSelectorWithPreview } from "./VoiceSelectorWithPreview";
import { TopicSelection } from "./TopicSelection";
import { ChannelSummary } from "./ChannelSummary";
import { ChannelPlatformSelector } from "./ChannelPlatformSelector";
import { ThemeSelector } from "./ThemeSelector";
import { useYouTubeAuth } from "@/hooks/useYouTubeAuth";
import { useEffect } from "react";

const mockTikTokAccounts = ["@motivationhub", "@techtalks", "@foodiefinds", "@lifehacks101"];

interface ChannelCreationProps {
  isDialog?: boolean;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
  isCreating?: boolean;
  playingVoice?: string | null;
  onVoicePreview?: (voiceId: string) => void;
}

export const ChannelCreation = ({ 
  isDialog = false, 
  onClose, 
  onSubmit, 
  isCreating = false,
  playingVoice: externalPlayingVoice,
  onVoicePreview: externalOnVoicePreview
}: ChannelCreationProps) => {
  const [channelName, setChannelName] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [topicMode, setTopicMode] = useState("ai-decide");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [internalPlayingVoice, setInternalPlayingVoice] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");
  const [accountName, setAccountName] = useState("");
  const [connectedYouTubeChannels, setConnectedYouTubeChannels] = useState<any[]>([]);
  
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();
  const { fetchConnectedChannels } = useYouTubeAuth();

  // Use external or internal state for voice preview
  const playingVoice = externalPlayingVoice !== undefined ? externalPlayingVoice : internalPlayingVoice;
  const onVoicePreview = externalOnVoicePreview || setInternalPlayingVoice;

  useEffect(() => {
    loadConnectedChannels();
  }, []);

  const loadConnectedChannels = async () => {
    const youtubeChannels = await fetchConnectedChannels();
    setConnectedYouTubeChannels(youtubeChannels);
  };

  // Function to get used YouTube channels (this would come from parent component)
  const getUsedYouTubeChannels = () => {
    // This should be passed from parent component that has access to existing channels
    return [];
  };

  const handleVideoTypeToggle = (videoTypeId: string) => {
    console.log("ChannelCreation - handleVideoTypeToggle called with:", videoTypeId);
    console.log("ChannelCreation - Current selectedVideoTypes before toggle:", selectedVideoTypes);
    
    setSelectedVideoTypes(prev => {
      const newSelection = prev.includes(videoTypeId) 
        ? prev.filter(id => id !== videoTypeId)
        : [...prev, videoTypeId];
      
      console.log("ChannelCreation - New selectedVideoTypes after toggle:", newSelection);
      return newSelection;
    });
  };

  console.log("ChannelCreation RENDER - selectedVideoTypes:", selectedVideoTypes);

  const handleCreateChannel = async () => {
    const needsTopics = topicMode !== "ai-decide" && selectedTopics.length === 0;
    
    console.log("Creating channel with:", {
      channelName,
      selectedSchedule,
      selectedVoice,
      selectedVideoTypes,
      selectedThemes,
      topicMode,
      selectedTopics,
      platform,
      accountName
    });
    
    console.log("Component props - isDialog:", isDialog, "onSubmit exists:", !!onSubmit);
    
    if (!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || selectedThemes.length === 0 || !platform || !accountName || needsTopics) {
      const missingFields = [];
      if (!channelName) missingFields.push("channel name");
      if (!selectedSchedule) missingFields.push("schedule");
      if (!selectedVoice) missingFields.push("voice");
      if (selectedVideoTypes.length === 0) missingFields.push("video styles");
      if (selectedThemes.length === 0) missingFields.push("themes");
      if (!platform || !accountName) missingFields.push("platform and account");
      if (needsTopics) missingFields.push("topics");
      
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const channelData = {
      selectedVideoTypes,
      selectedVoice,
      selectedThemes,
      topicMode,
      selectedTopics,
      platform,
      accountName
    };

    // Only use dialog mode if explicitly set AND onSubmit is provided
    if (isDialog && onSubmit) {
      const formData = {
        platform,
        accountName,
        voice: selectedVoice,
        topic: topicMode,
        schedule: selectedSchedule,
      };
      
      console.log("Dialog mode - calling onSubmit with:", { formData, selectedVideoStyles: selectedVideoTypes, selectedThemes });
      onSubmit({ formData, selectedVideoStyles: selectedVideoTypes, selectedThemes });
      return;
    }

    // Default behavior: create checkout session
    console.log("=== STARTING STRIPE CHECKOUT ===");
    console.log("Calling createCheckoutSession with:", { selectedSchedule, channelName, channelData });
    
    const success = await createCheckoutSession(selectedSchedule, channelName, channelData);
    
    console.log("Checkout session result:", success);
    
    if (success) {
      console.log("Checkout session created successfully");
    } else {
      console.error("Failed to create checkout session");
    }
  };

  const content = (
    <div className="space-y-6">
      <ChannelBasicInfo 
        channelName={channelName}
        setChannelName={setChannelName}
      />

      <ChannelPlatformSelector 
        platform={platform}
        accountName={accountName}
        onPlatformChange={setPlatform}
        onAccountChange={setAccountName}
        connectedYouTubeChannels={connectedYouTubeChannels}
        mockTikTokAccounts={mockTikTokAccounts}
        usedYouTubeChannels={getUsedYouTubeChannels()}
      />

      <VideoStyleSelector 
        selectedVideoTypes={selectedVideoTypes}
        onVideoTypeToggle={handleVideoTypeToggle}
      />

      <ThemeSelector
        selectedThemes={selectedThemes}
        onThemesChange={setSelectedThemes}
      />

      <ScheduleSelector 
        selectedSchedule={selectedSchedule}
        onScheduleSelect={setSelectedSchedule}
      />

      <VoiceSelectorWithPreview 
        selectedVoice={selectedVoice}
        onVoiceSelect={setSelectedVoice}
        playingVoice={playingVoice}
        onVoicePreview={onVoicePreview}
      />

      <TopicSelection 
        selectedMode={topicMode}
        onModeChange={setTopicMode}
        selectedTopics={selectedTopics}
        onTopicsChange={setSelectedTopics}
        selectedVideoTypes={selectedVideoTypes}
      />

      {!isDialog && (
        <ChannelSummary 
          channelName={channelName}
          selectedSchedule={selectedSchedule}
          selectedVoice={selectedVoice}
          selectedVideoTypes={selectedVideoTypes}
          topicSelection={topicMode}
          selectedTopics={selectedTopics}
        />
      )}

      <div className="flex gap-3">
        {isDialog && onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        
        <Button
          onClick={handleCreateChannel}
          disabled={!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || selectedThemes.length === 0 || !platform || !accountName || (topicMode !== "ai-decide" && selectedTopics.length === 0) || (isDialog ? isCreating : checkoutLoading)}
          className={`${isDialog ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
        >
          {(isDialog ? isCreating : checkoutLoading) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isDialog ? "Creating..." : "Creating Checkout..."}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {isDialog ? "Create Channel" : "Create Channel & Subscribe"}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // If used as dialog, return just the content
  if (isDialog) {
    return content;
  }

  // Default full-page layout
  return (
    <ScrollArea className="max-h-[90vh]">
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Channel
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set up your automated content channel with AI narration and variety
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </ScrollArea>
  );
};
