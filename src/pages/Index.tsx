
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Calendar, Palette, Mic, Video, Upload, Settings, Plus, X } from "lucide-react";
import { SocialConnections } from "@/components/SocialConnections";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ContentCalendar } from "@/components/ContentCalendar";
import { VoiceSelector } from "@/components/VoiceSelector";
import { ColorCustomizer } from "@/components/ColorCustomizer";
import { ScriptPreview } from "@/components/ScriptPreview";
import { ContentChannels } from "@/components/ContentChannels";
import { ChannelContentTabs } from "@/components/ChannelContentTabs";

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

const mockChannels: ContentChannel[] = [
  {
    id: "1",
    name: "Productivity Tips",
    socialAccount: {
      platform: "youtube",
      accountName: "ProductivityMaster",
      connected: true,
    },
    theme: {
      id: "productivity",
      name: "Productivity & Self-Improvement",
      color: "from-blue-500 to-cyan-500",
    },
    voice: {
      id: "aria",
      name: "Aria",
      type: "free",
    },
    topic: "Daily productivity hacks and time management",
    schedule: "daily",
    status: "active",
    lastGenerated: "2 hours ago",
    totalVideos: 47,
  },
  {
    id: "2",
    name: "Motivational Moments",
    socialAccount: {
      platform: "tiktok",
      accountName: "@motivationhub",
      connected: true,
    },
    theme: {
      id: "motivation",
      name: "Motivational Content",
      color: "from-orange-500 to-red-500",
    },
    voice: {
      id: "alexander",
      name: "Alexander",
      type: "premium",
    },
    topic: "Inspirational quotes and success mindset",
    schedule: "twice-daily",
    status: "active",
    lastGenerated: "4 hours ago",
    totalVideos: 23,
  },
];

const Index = () => {
  const [channels, setChannels] = useState<ContentChannel[]>(mockChannels);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const stats = [
    { label: "Videos Created", value: "127", icon: Video },
    { label: "Total Views", value: "45.2K", icon: PlayCircle },
    { label: "Scheduled Posts", value: "23", icon: Calendar },
    { label: "Active Channels", value: channels.filter(c => c.status === "active").length.toString(), icon: Settings },
  ];

  const handleChannelUpdate = (updatedChannels: ContentChannel[]) => {
    setChannels(updatedChannels);
  };

  const handleChannelClick = (channelId: string) => {
    setSelectedChannelId(channelId);
    setActiveTab(`channel-${channelId}`);
  };

  const selectedChannel = selectedChannelId ? channels.find(c => c.id === selectedChannelId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ContentAI Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Pro Plan
              </Badge>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {/* Global Tabs */}
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSelectedChannelId(null);
              }}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab("channels");
                setSelectedChannelId(null);
              }}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "channels"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">Manage Channels</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("connections");
                setSelectedChannelId(null);
              }}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "connections"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Social Accounts</span>
            </button>

            {/* Separator */}
            <div className="h-8 w-px bg-white/20 mx-2" />

            {/* Channel Tabs */}
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel.id)}
                className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap group ${
                  activeTab === `channel-${channel.id}`
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${channel.theme.color}`} />
                <span className="font-medium">{channel.name}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    channel.status === "active" 
                      ? "bg-green-500/20 text-green-400" 
                      : channel.status === "paused"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {channel.status}
                </Badge>
              </button>
            ))}

            {/* Add Channel Button */}
            <button
              onClick={() => {
                setActiveTab("channels");
                setSelectedChannelId(null);
              }}
              className="flex items-center space-x-2 py-4 px-4 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Channel</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <stat.icon className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Get started with your content creation workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab("channels")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Channels
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("connections")}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 h-12"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Connect Accounts
                  </Button>
                  <Button 
                    onClick={() => channels.length > 0 && handleChannelClick(channels[0].id)}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 h-12"
                    disabled={channels.length === 0}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Video generated", title: "5 Morning Productivity Tips", time: "2 hours ago", status: "completed", channel: "Productivity Tips" },
                    { action: "Script created", title: "Why You Need This Habit", time: "4 hours ago", status: "processing", channel: "Motivational Moments" },
                    { action: "Posted to YouTube", title: "Transform Your Day in 60 Seconds", time: "1 day ago", status: "live", channel: "Productivity Tips" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-gray-400 text-sm">{item.action} • {item.channel} • {item.time}</p>
                      </div>
                      <Badge 
                        variant={item.status === "live" ? "default" : "secondary"}
                        className={
                          item.status === "live" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : item.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "channels" && (
          <ContentChannels onChannelsUpdate={handleChannelUpdate} />
        )}

        {activeTab === "connections" && <SocialConnections />}

        {activeTab.startsWith("channel-") && selectedChannel && (
          <ChannelContentTabs channel={selectedChannel} onChannelUpdate={handleChannelUpdate} />
        )}
      </main>
    </div>
  );
};

export default Index;
