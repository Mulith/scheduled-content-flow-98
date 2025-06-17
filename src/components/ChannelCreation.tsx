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
import { TopicSelector } from "./TopicSelector";
import { ChannelSummary } from "./ChannelSummary";

export const ChannelCreation = () => {
  const [channelName, setChannelName] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<string[]>([]);
  const [topicSelection, setTopicSelection] = useState("ai-decide");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  
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

  // Log every render to see what's happening
  console.log("ChannelCreation RENDER - selectedVideoTypes:", selectedVideoTypes);
  console.log("ChannelCreation RENDER - handleVideoTypeToggle function:", handleVideoTypeToggle);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic("");
    }
  };

  const removeSelectedTopic = (topic: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== topic));
  };

  const generateAITopics = async () => {
    if (selectedVideoTypes.length === 0) {
      toast({
        title: "Select Video Types First",
        description: "Please select at least one video type to generate relevant topics",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTopics(true);
    // Simulate AI generation based on selected video styles
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const topicsByStyle: Record<string, string[]> = {
      story: [
        "The story behind overnight success myths",
        "How one small habit changed everything", 
        "The real story of productivity experts",
        "What happened when I tried every morning routine",
        "The untold story of workplace efficiency"
      ],
      top5: [
        "Top 5 productivity hacks that actually work",
        "5 morning habits of successful people",
        "Top 5 time management mistakes to avoid",
        "5 apps that will transform your workflow",
        "Top 5 energy boosting techniques"
      ],
      bestof: [
        "Best productivity system of all time",
        "Ultimate guide to time management",
        "Best habits for maximum efficiency",
        "Ultimate workspace setup guide",
        "Best strategies for deep work"
      ],
      howto: [
        "How to build a perfect morning routine",
        "How to eliminate distractions forever",
        "How to double your productivity in 30 days",
        "How to master time blocking",
        "How to create focus in a noisy world"
      ],
      reaction: [
        "Reacting to viral productivity advice",
        "Why productivity gurus are wrong",
        "My honest review of popular time management",
        "Reacting to extreme morning routines",
        "The truth about productivity trends"
      ],
      quicktips: [
        "60-second productivity boost",
        "Quick energy hack for tired minds",
        "Instant focus technique",
        "30-second stress relief method",
        "Quick win for better time management"
      ]
    };
    
    // Get topics for all selected video types
    let aiTopics: string[] = [];
    selectedVideoTypes.forEach(videoType => {
      if (topicsByStyle[videoType]) {
        aiTopics = [...aiTopics, ...topicsByStyle[videoType]];
      }
    });
    
    // Remove duplicates and limit to 10
    aiTopics = [...new Set(aiTopics)].slice(0, 10);
    setGeneratedTopics(aiTopics);
    setIsGeneratingTopics(false);
    
    toast({
      title: "Topics Generated! 🎬",
      description: "AI has suggested topics based on your selected video styles!",
    });
  };

  const handleVoicePreview = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      // Stop any playing audio
      return;
    }

    setPlayingVoice(voiceId);
  };

  const handleCreateChannel = async () => {
    const needsTopics = topicSelection !== "ai-decide" && selectedTopics.length === 0;
    
    console.log("Creating channel with:", {
      channelName,
      selectedSchedule,
      selectedVoice,
      selectedVideoTypes,
      topicSelection,
      selectedTopics
    });
    
    if (!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || needsTopics) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one video type" + (needsTopics ? " and topic" : ""),
        variant: "destructive",
      });
      return;
    }

    const success = await createCheckoutSession(selectedSchedule, channelName);
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

          <TopicSelector 
            topicSelection={topicSelection}
            onTopicSelectionChange={setTopicSelection}
            selectedTopics={selectedTopics}
            onTopicToggle={handleTopicToggle}
            customTopic={customTopic}
            onCustomTopicChange={setCustomTopic}
            onAddCustomTopic={addCustomTopic}
            onRemoveSelectedTopic={removeSelectedTopic}
            selectedVideoTypes={selectedVideoTypes}
            onGenerateAITopics={generateAITopics}
            isGeneratingTopics={isGeneratingTopics}
            generatedTopics={generatedTopics}
          />

          <ChannelSummary 
            channelName={channelName}
            selectedSchedule={selectedSchedule}
            selectedVoice={selectedVoice}
            selectedVideoTypes={selectedVideoTypes}
            topicSelection={topicSelection}
            selectedTopics={selectedTopics}
          />

          {/* Create Channel Button */}
          <Button
            onClick={handleCreateChannel}
            disabled={!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || (topicSelection !== "ai-decide" && selectedTopics.length === 0) || checkoutLoading}
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
