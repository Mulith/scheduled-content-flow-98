
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Mic, Palette, Target, Calendar } from "lucide-react";
import { VoiceSelectorWithPreview } from "./VoiceSelectorWithPreview";
import { ThemeSelector } from "./ThemeSelector";
import { ScheduleSelector } from "./ScheduleSelector";
import { TopicSelector } from "./TopicSelector";
import { ContentChannel } from "./channel/types";
import { useVoices } from "@/hooks/useVoices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChannelSettingsEditorProps {
  channel: ContentChannel;
  onChannelUpdate: (updatedChannel: ContentChannel) => void;
}

export const ChannelSettingsEditor = ({ channel, onChannelUpdate }: ChannelSettingsEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const getCurrentVoice = () => {
    return voices.find(v => v.id === channel.voice.id);
  };

  const getThemeDisplay = () => {
    if (channel.themes && channel.themes.length > 0) {
      return channel.themes.join(', ');
    }
    return 'No specific themes';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving channel settings:', editedChannel);
      
      // Update the channel in the database
      const { error } = await supabase
        .from('content_channels')
        .update({
          selected_voice: editedChannel.voice.id,
          selected_themes: editedChannel.themes || [],
          schedule: editedChannel.schedule,
          topic_mode: editedChannel.topic.includes('AI-Generated') ? 'ai-decide' : 'custom',
          updated_at: new Date().toISOString()
        })
        .eq('id', channel.id);

      if (error) {
        console.error('Error updating channel:', error);
        toast({
          title: "Error",
          description: "Failed to save channel settings",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      onChannelUpdate(editedChannel);
      setIsEditing(false);
      
      toast({
        title: "Settings Saved",
        description: "Channel settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving channel settings:', error);
      toast({
        title: "Error",
        description: "Failed to save channel settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedChannel(channel);
    setIsEditing(false);
  };

  const currentVoice = getCurrentVoice();

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Channel Settings</CardTitle>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Voice */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Mic className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">AI Voice</p>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-medium">{currentVoice?.name || 'Loading...'}</p>
                  {currentVoice?.type === "premium" && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      Premium
                    </Badge>
                  )}
                  {currentVoice?.gender && (
                    <Badge className={`text-xs ${
                      currentVoice.gender === 'female' 
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {currentVoice.gender === 'female' ? '♀' : '♂'}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{currentVoice?.description} • {currentVoice?.accent} accent</p>
              </div>
            </div>

            {/* Current Themes */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Content Themes</p>
                <p className="text-white font-medium">{getThemeDisplay()}</p>
              </div>
            </div>

            {/* Current Schedule */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Calendar className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Publishing Schedule</p>
                <p className="text-white font-medium">{channel.schedule}</p>
              </div>
            </div>

            {/* Current Topic Mode */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Target className="w-5 h-5 text-orange-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Topic Focus</p>
                <p className="text-white font-medium">{channel.topic}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">Edit Channel Settings</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCancel}
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
    </div>
  );
};
