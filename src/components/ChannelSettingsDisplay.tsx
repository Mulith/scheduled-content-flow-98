
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mic, Palette, Target, Calendar } from "lucide-react";
import { ContentChannel } from "./channel/types";
import { useVoices } from "@/hooks/useVoices";

interface ChannelSettingsDisplayProps {
  channel: ContentChannel;
  onEditClick: () => void;
}

export const ChannelSettingsDisplay = ({ channel, onEditClick }: ChannelSettingsDisplayProps) => {
  const { voices } = useVoices();

  const getCurrentVoice = () => {
    return voices.find(v => v.id === channel.voice.id);
  };

  const getThemeDisplay = () => {
    if (channel.themes && channel.themes.length > 0) {
      return channel.themes.join(', ');
    }
    return 'No specific themes';
  };

  const currentVoice = getCurrentVoice();

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Channel Settings</CardTitle>
          <Button
            onClick={onEditClick}
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
  );
};
