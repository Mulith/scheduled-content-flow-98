
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { VoiceSelectorWithPreview } from "./VoiceSelectorWithPreview";
import { ThemeSelector } from "./ThemeSelector";
import { ScheduleSelector } from "./ScheduleSelector";
import { TopicSelector } from "./TopicSelector";
import { ContentChannel } from "./channel/types";
import { useVoices } from "@/hooks/useVoices";

interface ChannelSettingsFormProps {
  channel: ContentChannel;
  onSave: (updatedChannel: ContentChannel) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const ChannelSettingsForm = ({ channel, onSave, onCancel, isSaving }: ChannelSettingsFormProps) => {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [editedChannel, setEditedChannel] = useState<ContentChannel>(channel);
  const { voices } = useVoices();

  const handleVoicePreview = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }
    setPlayingVoice(voiceId);
  };

  const handleSave = () => {
    onSave(editedChannel);
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Edit Channel Settings</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div>
          <h3 className="text-white font-medium mb-3">AI Voice</h3>
          <VoiceSelectorWithPreview
            selectedVoice={editedChannel.voice.id}
            onVoiceSelect={(voiceId) => {
              const selectedVoice = voices.find(v => v.id === voiceId);
              if (selectedVoice) {
                setEditedChannel({
                  ...editedChannel,
                  voice: {
                    id: voiceId,
                    name: selectedVoice.name,
                    type: selectedVoice.type
                  }
                });
              }
            }}
            playingVoice={playingVoice}
            onVoicePreview={handleVoicePreview}
          />
        </div>

        {/* Theme Selection */}
        <div>
          <h3 className="text-white font-medium mb-3">Content Themes</h3>
          <ThemeSelector
            selectedThemes={editedChannel.themes || []}
            onThemesChange={(themes) => {
              setEditedChannel({
                ...editedChannel,
                themes
              });
            }}
          />
        </div>

        {/* Schedule Selection */}
        <div>
          <h3 className="text-white font-medium mb-3">Publishing Schedule</h3>
          <ScheduleSelector
            selectedSchedule={editedChannel.schedule}
            onScheduleSelect={(schedule) => {
              setEditedChannel({
                ...editedChannel,
                schedule
              });
            }}
          />
        </div>

        {/* Topic Selection */}
        <div>
          <h3 className="text-white font-medium mb-3">Topic Focus</h3>
          <TopicSelector
            topicSelection={editedChannel.topic.includes('AI-Generated') ? 'ai-decide' : 'custom'}
            onTopicSelectionChange={(selection) => {
              setEditedChannel({
                ...editedChannel,
                topic: selection === 'ai-decide' ? 'AI-Generated Topics' : 'Custom Topics'
              });
            }}
            selectedTopics={[]}
            onTopicToggle={(topic) => {
              console.log("Topic toggled:", topic);
            }}
            customTopic=""
            onCustomTopicChange={(topic) => {
              console.log("Custom topic changed:", topic);
            }}
            onAddCustomTopic={() => {
              console.log("Add custom topic");
            }}
            onRemoveSelectedTopic={(topic) => {
              console.log("Remove topic:", topic);
            }}
            selectedVideoTypes={[]}
          />
        </div>
      </CardContent>
    </Card>
  );
};
