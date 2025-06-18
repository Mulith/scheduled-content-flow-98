import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Palette, Mic, Video, FileText, Settings, Youtube, Music, Power } from "lucide-react";
import { ContentCalendar } from "@/components/ContentCalendar";
import { VoiceSelectorWithPreview } from "@/components/VoiceSelectorWithPreview";
import { ColorCustomizer } from "@/components/ColorCustomizer";
import { ScriptPreview } from "@/components/ScriptPreview";
import { useVoices } from "@/hooks/useVoices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContentChannel {
  id: string;
  name: string;
  socialAccount: {
    platform: "youtube" | "tiktok";
    accountName: string;
    connected: boolean;
  };
  theme: {
    id: string;
    name: string;
    color: string;
  };
  voice: {
    id: string;
    name: string;
    type: "free" | "premium";
  };
  topic: string;
  schedule: string;
  status: "active" | "paused" | "setup";
  lastGenerated?: string;
  totalVideos: number;
  isActive?: boolean;
  videoStyle?: {
    id: string;
    name: string;
  };
  themes?: string[];
}

interface ChannelContentTabsProps {
  channel: ContentChannel;
  onChannelUpdate: (channels: ContentChannel[]) => void;
}

export const ChannelContentTabs = ({ channel, onChannelUpdate }: ChannelContentTabsProps) => {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { voices } = useVoices();

  const handleVoicePreview = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }
    setPlayingVoice(voiceId);
  };

  const handleActiveToggle = async (isActive: boolean) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('content_channels')
        .update({ is_active: isActive })
        .eq('id', channel.id);

      if (error) {
        console.error('Error updating channel status:', error);
        toast({
          title: "Error",
          description: "Failed to update channel status",
          variant: "destructive",
        });
        return;
      }

      // Update the local channel data with proper typing
      const updatedChannel: ContentChannel = { 
        ...channel, 
        isActive, 
        status: isActive ? 'active' as const : 'paused' as const
      };
      onChannelUpdate([updatedChannel]);

      toast({
        title: "Channel Updated",
        description: `Channel ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating channel status:', error);
      toast({
        title: "Error",
        description: "Failed to update channel status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string, isActive?: boolean) => {
    // Use isActive field for accurate status, fallback to status field
    const actuallyActive = isActive !== undefined ? isActive : status === "active";
    
    if (actuallyActive) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusText = (status: string, isActive?: boolean) => {
    const actuallyActive = isActive !== undefined ? isActive : status === "active";
    return actuallyActive ? "active" : "paused";
  };

  // Get the correct voice name from the voices data
  const getVoiceName = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    return voice ? voice.name : channel.voice.name;
  };

  const getVoiceType = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    return voice ? voice.type : channel.voice.type;
  };

  // Helper function to display themes
  const getThemeDisplay = () => {
    if (channel.themes && channel.themes.length > 0) {
      return channel.themes.join(', ');
    }
    return 'No specific themes';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Channel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {channel.socialAccount.platform === "youtube" ? (
              <Youtube className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Music className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{channel.name}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-400 text-sm md:text-base">{channel.socialAccount.accountName}</p>
              <Badge className={getStatusColor(channel.status, channel.isActive)}>
                {getStatusText(channel.status, channel.isActive)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-left md:text-right">
            <p className="text-gray-400 text-sm">Total Videos</p>
            <p className="text-xl md:text-2xl font-bold text-white">{channel.totalVideos}</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-black/40 border border-white/10 rounded-lg">
            <Power className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-gray-400">Channel Status</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">{channel.isActive ? 'Live' : 'Inactive'}</span>
                <Switch
                  checked={channel.isActive || false}
                  onCheckedChange={handleActiveToggle}
                  disabled={isUpdatingStatus}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Content Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4 md:space-y-6">
        <TabsList className="bg-black/40 border border-white/10 grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2 py-2 md:py-3 text-xs md:text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Overview</span>
            <span className="md:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-white/10 flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2 py-2 md:py-3 text-xs md:text-sm">
            <Video className="w-4 h-4" />
            <span className="hidden md:inline">Content</span>
            <span className="md:hidden">Content</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2 py-2 md:py-3 text-xs md:text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
            <span className="md:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {/* Channel Configuration */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg md:text-xl">Channel Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="flex items-center space-x-3">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Theme</p>
                    <p className="text-white font-medium text-sm md:text-base">{getThemeDisplay()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Voice</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-white font-medium text-sm md:text-base">{getVoiceName(channel.voice.id)}</p>
                      {getVoiceType(channel.voice.id) === "premium" && <span className="text-xs">👑</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Schedule</p>
                    <p className="text-white font-medium text-sm md:text-base">{channel.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Video Style</p>
                    <p className="text-white font-medium text-sm md:text-base">{channel.videoStyle?.name || channel.theme.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Recent Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white/5 rounded-lg space-y-2 md:space-y-0">
                    <div>
                      <p className="text-white font-medium text-sm md:text-base">5 Morning Productivity Tips</p>
                      <p className="text-gray-400 text-xs md:text-sm">Published 2 hours ago</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 self-start md:self-center">
                      Live
                    </Badge>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white/5 rounded-lg space-y-2 md:space-y-0">
                    <div>
                      <p className="text-white font-medium text-sm md:text-base">Transform Your Workspace</p>
                      <p className="text-gray-400 text-xs md:text-sm">Scheduled for tomorrow</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 self-start md:self-center">
                      Scheduled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Views This Month</p>
                    <p className="text-xl md:text-2xl font-bold text-white">12.4K</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Engagement Rate</p>
                    <p className="text-xl md:text-2xl font-bold text-white">7.2%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Avg. Watch Time</p>
                    <p className="text-xl md:text-2xl font-bold text-white">42s</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Subscribers</p>
                    <p className="text-xl md:text-2xl font-bold text-white">+127</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 md:space-y-6">
          <ContentCalendar />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Theme & Colors</CardTitle>
                <CardDescription className="text-gray-400 text-sm md:text-base">
                  Customize the visual appearance of your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <ColorCustomizer />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Voice Settings</CardTitle>
                <CardDescription className="text-gray-400 text-sm md:text-base">
                  Configure AI voice for narration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceSelectorWithPreview
                  selectedVoice={channel.voice.id}
                  onVoiceSelect={(voiceId) => {
                    // Handle voice selection update
                    console.log("Voice selected:", voiceId);
                  }}
                  playingVoice={playingVoice}
                  onVoicePreview={handleVoicePreview}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
