
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Sparkles, RefreshCw } from "lucide-react";
import { VideoStyleSelector } from "./VideoStyleSelector";
import { VoiceSelectorWithPreview } from "./VoiceSelectorWithPreview";
import { ChannelSubscriptionNotice } from "./ChannelSubscriptionNotice";
import { ChannelPlatformSelector } from "./ChannelPlatformSelector";
import { ChannelPricingSummary } from "./ChannelPricingSummary";
import { ChannelFormActions } from "./ChannelFormActions";

interface FormData {
  platform: string;
  accountName: string;
  voice: string;
  topic: string;
  schedule: string;
}

interface ChannelCreationFormProps {
  onClose: () => void;
  onSubmit: (data: {
    formData: FormData;
    selectedVideoStyles: string[];
  }) => void;
  isCreating: boolean;
  connectedYouTubeChannels: any[];
  playingVoice: string | null;
  onVoicePreview: (voiceId: string) => void;
}

const scheduleOptions = [
  { value: "twice-daily", label: "2x Daily", price: "$45/month", description: "Two posts per day" },
  { value: "daily", label: "Daily", price: "$30/month", description: "One post per day" },
  { value: "weekly", label: "Weekly", price: "$20/month", description: "One post per week" },
  { value: "monthly", label: "Monthly", price: "$15/month", description: "One post per month" },
];

const topicCategories = [
  "Productivity & Self-Improvement",
  "Health & Fitness",
  "Technology & Gadgets",
  "Business & Entrepreneurship",
  "Cooking & Food",
  "Travel & Adventure",
  "Fashion & Style",
  "Gaming & Entertainment",
  "DIY & Crafts",
  "Personal Finance",
  "Relationships & Dating",
  "Education & Learning",
];

const mockTikTokAccounts = ["@motivationhub", "@techtalks", "@foodiefinds", "@lifehacks101"];

export const ChannelCreationForm = ({
  onClose,
  onSubmit,
  isCreating,
  connectedYouTubeChannels,
  playingVoice,
  onVoicePreview
}: ChannelCreationFormProps) => {
  const [selectedVideoStyles, setSelectedVideoStyles] = useState<string[]>([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [formData, setFormData] = useState<FormData>({
    platform: "",
    accountName: "",
    voice: "",
    topic: "",
    schedule: "",
  });

  const handleVideoStyleToggle = (styleId: string) => {
    setSelectedVideoStyles(prev => {
      const newSelection = prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId];
      return newSelection;
    });
  };

  const generateAITopics = async () => {
    if (selectedVideoStyles.length === 0) {
      return;
    }

    setIsGeneratingTopics(true);
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
    
    let aiTopics: string[] = [];
    selectedVideoStyles.forEach(videoType => {
      if (topicsByStyle[videoType]) {
        aiTopics = [...aiTopics, ...topicsByStyle[videoType]];
      }
    });
    
    aiTopics = [...new Set(aiTopics)].slice(0, 10);
    setGeneratedTopics(aiTopics);
    setIsGeneratingTopics(false);
  };

  const getSelectedSchedulePrice = () => {
    const selectedSchedule = scheduleOptions.find(s => s.value === formData.schedule);
    return selectedSchedule ? selectedSchedule.price : "$0/month";
  };

  const handleSubmit = () => {
    onSubmit({ formData, selectedVideoStyles });
  };

  return (
    <div className="space-y-6">
      <ChannelSubscriptionNotice 
        selectedSchedule={formData.schedule}
        getSelectedSchedulePrice={getSelectedSchedulePrice}
      />

      <ChannelPlatformSelector 
        platform={formData.platform}
        accountName={formData.accountName}
        onPlatformChange={(platform) => setFormData({...formData, platform})}
        onAccountChange={(accountName) => setFormData({...formData, accountName})}
        connectedYouTubeChannels={connectedYouTubeChannels}
        mockTikTokAccounts={mockTikTokAccounts}
      />

      <VideoStyleSelector 
        selectedVideoTypes={selectedVideoStyles}
        onVideoTypeToggle={handleVideoStyleToggle}
      />

      <VoiceSelectorWithPreview 
        selectedVoice={formData.voice}
        onVoiceSelect={(voiceId) => setFormData({...formData, voice: voiceId})}
        playingVoice={playingVoice}
        onVoicePreview={onVoicePreview}
      />

      {/* Schedule Selection */}
      <div className="space-y-2">
        <Label htmlFor="schedule" className="flex items-center space-x-2">
          <span>Posting Schedule</span>
          <DollarSign className="w-4 h-4 text-green-400" />
        </Label>
        <Select value={formData.schedule} onValueChange={(value) => setFormData({...formData, schedule: value})}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Select schedule & pricing" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {scheduleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-gray-400 text-xs ml-2">({option.description})</span>
                  </div>
                  <span className="text-green-400 font-medium ml-4">{option.price}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.schedule && (
          <div className="text-xs text-gray-400 mt-1">
            This will add {getSelectedSchedulePrice()} to your monthly subscription
          </div>
        )}
      </div>

      {/* Topic Selection */}
      <div className="space-y-3">
        <Label>Topic Selection</Label>
        
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Choose from popular topics:</Label>
          <Select value={formData.topic} onValueChange={(value) => setFormData({...formData, topic: value})}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select a topic category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {topicCategories.map((topic) => (
                <SelectItem key={topic} value={topic} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Or get AI-generated topic suggestions:</Label>
            <Button 
              type="button"
              onClick={generateAITopics}
              disabled={selectedVideoStyles.length === 0 || isGeneratingTopics}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGeneratingTopics ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Topics
            </Button>
          </div>
          
          {generatedTopics.length > 0 && (
            <div className="space-y-2">
              {generatedTopics.map((topic, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({...formData, topic})}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    formData.topic === topic 
                      ? "bg-purple-500/20 border-purple-500/50 text-white" 
                      : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Or enter a custom topic:</Label>
          <Input
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setFormData({...formData, topic: e.target.value});
            }}
            placeholder="e.g., Morning routines for entrepreneurs"
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      <ChannelPricingSummary 
        selectedSchedule={formData.schedule}
        getSelectedSchedulePrice={getSelectedSchedulePrice}
      />

      <ChannelFormActions 
        onCancel={onClose}
        onSubmit={handleSubmit}
        isCreating={isCreating}
        selectedSchedule={formData.schedule}
        getSelectedSchedulePrice={getSelectedSchedulePrice}
      />
    </div>
  );
};
