
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChannelCard } from "./ChannelCard";
import { ContentChannel } from "./types";

interface ChannelGridProps {
  channels: ContentChannel[];
  onChannelClick: (channelId: string) => void;
  onToggleStatus: (channelId: string) => void;
  onDeleteChannel: (channelId: string) => void;
  onCreateChannel: () => void;
}

export const ChannelGrid = ({ 
  channels, 
  onChannelClick, 
  onToggleStatus, 
  onDeleteChannel, 
  onCreateChannel 
}: ChannelGridProps) => {
  if (channels.length === 0) {
    return (
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">No Content Channels Yet</h3>
          <p className="text-gray-400 mb-4">
            Create your first content channel to start generating AI-powered videos with Skadoosh! 🥋
          </p>
          <Button 
            onClick={onCreateChannel}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Your First Channel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onChannelClick={onChannelClick}
          onToggleStatus={onToggleStatus}
          onDeleteChannel={onDeleteChannel}
        />
      ))}
    </div>
  );
};
