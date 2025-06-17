import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Youtube, Music, Edit, Trash2, MoreVertical, Palette, Mic, Target, ExternalLink, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useYouTubeAuth } from "@/hooks/useYouTubeAuth";
import { supabase } from "@/integrations/supabase/client";
import { VideoStyleSelector } from "./VideoStyleSelector";
import { VoiceSelectorWithPreview } from "./VoiceSelectorWithPreview";
import { TopicSelection } from "./TopicSelection";
import { ChannelCreation } from "./ChannelCreation";

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

// Updated video style themes
const availableVideoStyles = [
  { id: "story", name: "Story Format", color: "from-blue-500 to-cyan-500", description: "Narrative-driven content with beginning, middle, and end" },
  { id: "top5", name: "Top 5 Lists", color: "from-purple-500 to-pink-500", description: "Countdown and ranking format" },
  { id: "bestof", name: "Best of All Time", color: "from-orange-500 to-red-500", description: "Ultimate guides and definitive lists" },
  { id: "howto", name: "How-To Tutorial", color: "from-green-500 to-emerald-500", description: "Step-by-step instructional content" },
  { id: "reaction", name: "Reaction & Commentary", color: "from-yellow-500 to-orange-500", description: "Response and opinion-based content" },
  { id: "quicktips", name: "Quick Tips", color: "from-indigo-500 to-purple-500", description: "Short, actionable advice format" },
];

// Predefined topic categories
const topicCategories = [
  "Productivity & Self-Improvement",
  "Health & Fitness",
  "Technology & Gadgets",
  "Business & Entrepreneurship",
  "Cooking & Food",
  "Travel & Adventure",
  "Fashion & Style",
  "Gaming & Entertainment",
  "DIY & Crafts",
  "Personal Finance",
  "Relationships & Dating",
  "Education & Learning",
];

// Mock connected TikTok accounts for now
const mockTikTokAccounts = ["@motivationhub", "@techtalks", "@foodiefinds", "@lifehacks101"];

const availableThemes = [
  { id: "productivity", name: "Productivity & Self-Improvement", color: "from-blue-500 to-cyan-500" },
  { id: "motivation", name: "Motivational Content", color: "from-orange-500 to-red-500" },
  { id: "wellness", name: "Health & Wellness", color: "from-green-500 to-emerald-500" },
  { id: "knowledge", name: "Quick Learning & Facts", color: "from-purple-500 to-pink-500" },
];

const availableVoices = [
  { id: "aria", name: "Aria", type: "free" as const },
  { id: "marcus", name: "Marcus", type: "free" as const },
  { id: "sofia", name: "Sofia", type: "free" as const },
  { id: "alexander", name: "Alexander", type: "premium" as const },
  { id: "isabella", name: "Isabella", type: "premium" as const },
  { id: "james", name: "James", type: "premium" as const },
];

const scheduleOptions = [
  { value: "twice-daily", label: "2x Daily", price: "$45/month", description: "Two posts per day" },
  { value: "daily", label: "Daily", price: "$30/month", description: "One post per day" },
  { value: "weekly", label: "Weekly", price: "$20/month", description: "One post per week" },
  { value: "monthly", label: "Monthly", price: "$15/month", description: "One post per month" },
];

interface ContentChannelsProps {
  onChannelsUpdate?: (channels: ContentChannel[]) => void;
  onChannelSelect?: (channelId: string | null) => void;
}

export const ContentChannels = ({ onChannelsUpdate, onChannelSelect }: ContentChannelsProps) => {
  const [channels, setChannels] = useState<ContentChannel[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [connectedYouTubeChannels, setConnectedYouTubeChannels] = useState<any[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const { fetchConnectedChannels } = useYouTubeAuth();

  useEffect(() => {
    loadConnectedChannels();
    loadExistingChannels();
  }, []);

  const loadConnectedChannels = async () => {
    const youtubeChannels = await fetchConnectedChannels();
    setConnectedYouTubeChannels(youtubeChannels);
  };

  const loadExistingChannels = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // For now, we'll use mock data but this is where you'd load from your content_channels table
      // when you create that table structure
      const mockChannels: ContentChannel[] = [
        {
          id: "1",
          name: "Productivity Tips",
          socialAccount: {
            platform: "youtube",
            accountName: connectedYouTubeChannels[0]?.channel_name || "ProductivityMaster",
            connected: true,
          },
          theme: availableVideoStyles[0],
          voice: availableVoices[0],
          topic: "Daily productivity hacks and time management",
          schedule: "daily",
          status: "active",
          lastGenerated: "2 hours ago",
          totalVideos: 47,
        },
      ];
      
      setChannels(mockChannels);
      onChannelsUpdate?.(mockChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const handleChannelFormSubmit = (data: {
    formData: any;
    selectedVideoStyles: string[];
  }) => {
    console.log("Channel creation data:", data);
    toast({
      title: "Channel Creation Started",
      description: "Redirecting to Stripe checkout...",
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteChannel = (channelId: string) => {
    const updatedChannels = channels.filter(c => c.id !== channelId);
    setChannels(updatedChannels);
    onChannelsUpdate?.(updatedChannels);
    toast({
      title: "Channel Deleted",
      description: "Content channel has been removed",
    });
  };

  const handleToggleStatus = (channelId: string) => {
    const updatedChannels = channels.map(channel => {
      if (channel.id === channelId) {
        const newStatus: "active" | "paused" = channel.status === "active" ? "paused" : "active";
        return { ...channel, status: newStatus };
      }
      return channel;
    });
    setChannels(updatedChannels);
    onChannelsUpdate?.(updatedChannels);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "setup": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleChannelClick = (channelId: string) => {
    onChannelSelect?.(channelId);
  };

  const getScheduleDisplay = (scheduleValue: string) => {
    const schedule = scheduleOptions.find(s => s.value === scheduleValue);
    return schedule ? { label: schedule.label, price: schedule.price } : { label: "Unknown", price: "N/A" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Content Channels</h2>
          <p className="text-gray-400">Create and manage your content channels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content Channel</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new channel with its own video styles, voice, and topic configuration
              </DialogDescription>
            </DialogHeader>
            
            <ChannelCreation
              isDialog={true}
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleChannelFormSubmit}
              isCreating={false}
              playingVoice={playingVoice}
              onVoicePreview={setPlayingVoice}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {channels.map((channel) => {
          const scheduleDisplay = getScheduleDisplay(channel.schedule);
          return (
            <Card 
              key={channel.id} 
              className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/60 transition-colors group cursor-pointer"
              onClick={() => handleChannelClick(channel.id)}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-600">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(channel.id); }} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          <Edit className="w-4 h-4 mr-2" />
                          {channel.status === "active" ? "Pause" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteChannel(channel.id); }} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
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
        })}
      </div>

      {/* Empty State */}
      {channels.length === 0 && (
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
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Your First Channel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
