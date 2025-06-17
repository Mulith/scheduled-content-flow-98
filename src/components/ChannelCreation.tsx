
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

export const ChannelCreation = () => {
  const [channelName, setChannelName] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<string[]>([]);
  const [topicMode, setTopicMode] = useState("ai-decide");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");
  const [accountName, setAccountName] = useState("");
  
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();

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
      topicMode,
      selectedTopics,
      platform,
      accountName
    });
    
    if (!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || needsTopics) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one video type" + (needsTopics ? " and topic" : ""),
        variant: "destructive",
      });
      return;
    }

    const channelData = {
      selectedVideoTypes,
      selectedVoice,
      topicMode,
      selectedTopics,
      platform,
      accountName
    };

    const success = await createCheckoutSession(selectedSchedule, channelName, channelData);
    if (success) {
      toast({
        title: "Redirecting to Checkout",
        description: "Opening Stripe checkout in a new tab...",
      });
    }
  };

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
        <CardContent className="space-y-6">
          <ChannelBasicInfo 
            channelName={channelName}
            setChannelName={setChannelName}
          />

          <VideoStyleSelector 
            selectedVideoTypes={selectedVideoTypes}
            onVideoTypeToggle={handleVideoTypeToggle}
          />

          <ScheduleSelector 
            selectedSchedule={selectedSchedule}
            onScheduleSelect={setSelectedSchedule}
          />

          <VoiceSelectorWithPreview 
            selectedVoice={selectedVoice}
            onVoiceSelect={setSelectedVoice}
            playingVoice={playingVoice}
            onVoicePreview={setPlayingVoice}
          />

          <TopicSelection 
            selectedMode={topicMode}
            onModeChange={setTopicMode}
            selectedTopics={selectedTopics}
            onTopicsChange={setSelectedTopics}
            selectedVideoTypes={selectedVideoTypes}
          />

          <ChannelSummary 
            channelName={channelName}
            selectedSchedule={selectedSchedule}
            selectedVoice={selectedVoice}
            selectedVideoTypes={selectedVideoTypes}
            topicSelection={topicMode}
            selectedTopics={selectedTopics}
          />

          <Button
            onClick={handleCreateChannel}
            disabled={!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || (topicMode !== "ai-decide" && selectedTopics.length === 0) || checkoutLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Create Channel & Subscribe
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};
