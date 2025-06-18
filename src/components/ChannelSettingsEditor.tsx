
import { useState } from "react";
import { ChannelSettingsDisplay } from "./ChannelSettingsDisplay";
import { ChannelSettingsForm } from "./ChannelSettingsForm";
import { ContentChannel } from "./channel/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChannelSettingsEditorProps {
  channel: ContentChannel;
  onChannelUpdate: (updatedChannel: ContentChannel) => void;
}

export const ChannelSettingsEditor = ({ channel, onChannelUpdate }: ChannelSettingsEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (editedChannel: ContentChannel) => {
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
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {isEditing ? (
        <ChannelSettingsForm
          channel={channel}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      ) : (
        <ChannelSettingsDisplay
          channel={channel}
          onEditClick={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};
