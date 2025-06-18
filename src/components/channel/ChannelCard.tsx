
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Youtube, Music, Edit, Trash2, MoreVertical, Palette, Mic, Target, ExternalLink, Calendar } from "lucide-react";
import { ContentChannel } from "./types";
import { scheduleOptions } from "./channelConstants";

interface ChannelCardProps {
  channel: ContentChannel;
  onChannelClick: (channelId: string) => void;
  onToggleStatus: (channelId: string) => void;
  onDeleteChannel: (channelId: string) => void;
}

export const ChannelCard = ({ 
  channel, 
  onChannelClick, 
  onToggleStatus, 
  onDeleteChannel 
}: ChannelCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "setup": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getScheduleDisplay = (scheduleValue: string) => {
    const schedule = scheduleOptions.find(s => s.value === scheduleValue);
    return schedule ? { label: schedule.label, price: schedule.price } : { label: "Unknown", price: "N/A" };
  };

  const scheduleDisplay = getScheduleDisplay(channel.schedule);

  return (
    <Card 
      className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/60 transition-colors group cursor-pointer"
      onClick={() => onChannelClick(channel.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {channel.socialAccount.platform === "youtube" ? (
                <Youtube className="w-5 h-5 text-white" />
              ) : (
                <Music className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-white">{channel.name}</CardTitle>
                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardDescription className="text-gray-400">
                {channel.socialAccount.platform === "youtube" ? "YouTube" : "TikTok"} • {channel.socialAccount.accountName}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(channel.status)}>
              {channel.status}
            </Badge>
            {channel.isActive && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Live
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-600">
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onToggleStatus(channel.id); }} 
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {channel.status === "active" ? "Pause" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel.id); }} 
                  className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Schedule with Pricing */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Current Schedule</p>
              <p className="text-sm font-medium text-white">{scheduleDisplay.label}</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
            <p className="text-xs font-medium text-blue-300">{scheduleDisplay.price}</p>
          </div>
        </div>

        {/* Channel Configuration */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Style</p>
              <p className="text-sm text-white">{channel.theme.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Mic className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Voice</p>
              <div className="flex items-center space-x-1">
                <p className="text-sm text-white">{channel.voice.name}</p>
                {channel.voice.type === "premium" && <span className="text-xs">👑</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Posts</p>
              <p className="text-sm text-white">{scheduleDisplay.label}</p>
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Topic Focus</p>
          <p className="text-sm text-white">{channel.topic}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-400">Total Videos: </span>
            <span className="text-white font-medium">{channel.totalVideos}</span>
          </div>
          {channel.lastGenerated && (
            <div>
              <span className="text-gray-400">Last: </span>
              <span className="text-white">{channel.lastGenerated}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
