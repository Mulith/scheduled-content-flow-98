
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Palette, Mic, Video, FileText, Settings, Youtube, Music } from "lucide-react";
import { ContentCalendar } from "@/components/ContentCalendar";
import { VoiceSelector } from "@/components/VoiceSelector";
import { ColorCustomizer } from "@/components/ColorCustomizer";
import { ScriptPreview } from "@/components/ScriptPreview";
import { ThemeSelector } from "@/components/ThemeSelector";

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
}

interface ChannelContentTabsProps {
  channel: ContentChannel;
  onChannelUpdate: (channels: ContentChannel[]) => void;
}

export const ChannelContentTabs = ({ channel, onChannelUpdate }: ChannelContentTabsProps) => {
  const [activeSubTab, setActiveSubTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "setup": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Channel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {channel.socialAccount.platform === "youtube" ? (
              <Youtube className="w-6 h-6 text-white" />
            ) : (
              <Music className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{channel.name}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-400">{channel.socialAccount.accountName}</p>
              <Badge className={getStatusColor(channel.status)}>
                {channel.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Total Videos</p>
          <p className="text-2xl font-bold text-white">{channel.totalVideos}</p>
        </div>
      </div>

      {/* Channel Configuration Overview */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Channel Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Theme</p>
                <p className="text-white font-medium">{channel.theme.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mic className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Voice</p>
                <div className="flex items-center space-x-1">
                  <p className="text-white font-medium">{channel.voice.name}</p>
                  {channel.voice.type === "premium" && <span className="text-xs">👑</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Schedule</p>
                <p className="text-white font-medium">{channel.schedule}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Topic</p>
                <p className="text-white font-medium">{channel.topic}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Content Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
            <Settings className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-white/10">
            <Calendar className="w-4 h-4 mr-2" />
            Content Calendar
          </TabsTrigger>
          <TabsTrigger value="scripts" className="data-[state=active]:bg-white/10">
            <Video className="w-4 h-4 mr-2" />
            Scripts & Previews
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">
            <Settings className="w-4 h-4 mr-2" />
            Channel Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">5 Morning Productivity Tips</p>
                      <p className="text-gray-400 text-sm">Published 2 hours ago</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Transform Your Workspace</p>
                      <p className="text-gray-400 text-sm">Scheduled for tomorrow</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Scheduled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Views This Month</p>
                    <p className="text-2xl font-bold text-white">12.4K</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Engagement Rate</p>
                    <p className="text-2xl font-bold text-white">7.2%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Watch Time</p>
                    <p className="text-2xl font-bold text-white">42s</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Subscribers</p>
                    <p className="text-2xl font-bold text-white">+127</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <ContentCalendar />
        </TabsContent>

        <TabsContent value="scripts">
          <ScriptPreview />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Theme & Colors</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize the visual appearance of your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ThemeSelector />
                <ColorCustomizer />
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Voice Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure AI voice for narration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceSelector />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
