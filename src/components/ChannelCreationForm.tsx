
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { VideoStyleSelector } from "./VideoStyleSelector";
import { VoiceSelectorWithPreview } from "./VoiceSelectorWithPreview";
import { ChannelSubscriptionNotice } from "./ChannelSubscriptionNotice";
import { ChannelPlatformSelector } from "./ChannelPlatformSelector";
import { ChannelPricingSummary } from "./ChannelPricingSummary";
import { ChannelFormActions } from "./ChannelFormActions";
import { TopicSelection } from "./TopicSelection";

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
  const [topicMode, setTopicMode] = useState("ai-decide");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
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

      <TopicSelection 
        selectedMode={topicMode}
        onModeChange={setTopicMode}
        selectedTopics={selectedTopics}
        onTopicsChange={setSelectedTopics}
        selectedVideoTypes={selectedVideoStyles}
      />

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
