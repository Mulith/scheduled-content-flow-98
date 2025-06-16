
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Calendar, Palette, Mic, Video, Upload, Settings, Plus, X, Menu } from "lucide-react";
import { SocialConnections } from "@/components/SocialConnections";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ContentCalendar } from "@/components/ContentCalendar";
import { VoiceSelector } from "@/components/VoiceSelector";
import { ColorCustomizer } from "@/components/ColorCustomizer";
import { ScriptPreview } from "@/components/ScriptPreview";
import { ContentChannels } from "@/components/ContentChannels";
import { ChannelContentTabs } from "@/components/ChannelContentTabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stats = [
    { label: "Videos Created", value: "127", icon: Video },
    { label: "Total Views", value: "45.2K", icon: PlayCircle },
    { label: "Scheduled Posts", value: "23", icon: Calendar },
    { label: "Active Channels", value: channels.filter(c => c.status === "active").length.toString(), icon: Settings },
  ];

  const handleChannelUpdate = (updatedChannels: ContentChannel[]) => {
    setChannels(updatedChannels);
  };

  const handleChannelSelect = (channelId: string | null) => {
    setSelectedChannelId(channelId);
  };

  const selectedChannel = selectedChannelId ? channels.find(c => c.id === selectedChannelId) : null;

  const NavigationContent = () => (
    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-1 overflow-x-auto">
      {/* Global Tabs */}
      <button
        onClick={() => {
          setActiveTab("dashboard");
          setSelectedChannelId(null);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center justify-start md:justify-center space-x-2 py-3 md:py-4 px-4 border-b-2 md:border-b-2 border-r-0 md:border-r-0 transition-colors whitespace-nowrap text-left md:text-center ${
          activeTab === "dashboard"
            ? "border-blue-500 text-blue-400 bg-blue-500/10 md:bg-transparent"
            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 md:hover:bg-transparent"
        }`}
      >
        <PlayCircle className="w-4 h-4" />
        <span className="font-medium">Dashboard</span>
      </button>
      
      <button
        onClick={() => {
          setActiveTab("channels");
          setSelectedChannelId(null);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center justify-start md:justify-center space-x-2 py-3 md:py-4 px-4 border-b-2 md:border-b-2 border-r-0 md:border-r-0 transition-colors whitespace-nowrap text-left md:text-center ${
          activeTab === "channels"
            ? "border-blue-500 text-blue-400 bg-blue-500/10 md:bg-transparent"
            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 md:hover:bg-transparent"
        }`}
      >
        <Settings className="w-4 h-4" />
        <span className="font-medium">Channels</span>
      </button>

      <button
        onClick={() => {
          setActiveTab("connections");
          setSelectedChannelId(null);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center justify-start md:justify-center space-x-2 py-3 md:py-4 px-4 border-b-2 md:border-b-2 border-r-0 md:border-r-0 transition-colors whitespace-nowrap text-left md:text-center ${
          activeTab === "connections"
            ? "border-blue-500 text-blue-400 bg-blue-500/10 md:bg-transparent"
            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 md:hover:bg-transparent"
        }`}
      >
        <Upload className="w-4 h-4" />
        <span className="font-medium">Social Accounts</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ContentAI Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 hidden sm:block">
                Pro Plan
              </Badge>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hidden sm:flex">
                Settings
              </Button>
              {/* Mobile menu trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-slate-900/95 border-white/10 backdrop-blur-sm w-80">
                  <div className="py-4">
                    <NavigationContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop */}
      <nav className="border-b border-white/10 bg-black/10 backdrop-blur-sm hidden md:block">
        <div className="container mx-auto px-4 md:px-6">
          <NavigationContent />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6 md:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">{stat.label}</p>
                        <p className="text-lg md:text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400 text-sm md:text-base">
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
                    onClick={() => {
                      setActiveTab("channels");
                      if (channels.length > 0) {
                        setSelectedChannelId(channels[0].id);
                      }
                    }}
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
                <CardTitle className="text-white text-lg md:text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Video generated", title: "5 Morning Productivity Tips", time: "2 hours ago", status: "completed", channel: "Productivity Tips" },
                    { action: "Script created", title: "Why You Need This Habit", time: "4 hours ago", status: "processing", channel: "Motivational Moments" },
                    { action: "Posted to YouTube", title: "Transform Your Day in 60 Seconds", time: "1 day ago", status: "live", channel: "Productivity Tips" },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-lg space-y-2 md:space-y-0">
                      <div>
                        <p className="text-white font-medium text-sm md:text-base">{item.title}</p>
                        <p className="text-gray-400 text-xs md:text-sm">{item.action} • {item.channel} • {item.time}</p>
                      </div>
                      <Badge 
                        variant={item.status === "live" ? "default" : "secondary"}
                        className={`self-start md:self-center ${
                          item.status === "live" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : item.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
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
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Content Channels</h2>
                <p className="text-gray-400 text-sm md:text-base">Create and manage your content channels</p>
              </div>
            </div>

            {/* Channel Selector */}
            {channels.length > 0 && (
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg md:text-xl">Select Channel</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose a channel to manage its content and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {channels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelSelect(channel.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                          selectedChannelId === channel.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${channel.theme.color}`} />
                          <h3 className="text-white font-medium">{channel.name}</h3>
                          <Badge className={`text-xs ${
                            channel.status === "active" 
                              ? "bg-green-500/20 text-green-400" 
                              : channel.status === "paused"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {channel.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{channel.socialAccount.accountName}</p>
                        <p className="text-gray-500 text-xs mt-1">{channel.totalVideos} videos</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Channel Content or Channel Management */}
            {selectedChannel ? (
              <ChannelContentTabs channel={selectedChannel} onChannelUpdate={handleChannelUpdate} />
            ) : (
              <ContentChannels onChannelsUpdate={handleChannelUpdate} />
            )}
          </div>
        )}

        {activeTab === "connections" && <SocialConnections />}
      </main>
    </div>
  );
};

export default Index;
