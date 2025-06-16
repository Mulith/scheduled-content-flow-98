import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Youtube, Music, Edit, Trash2, MoreVertical, Palette, Mic, Target, ExternalLink, Calendar, DollarSign, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useYouTubeChannels } from "@/hooks/useYouTubeChannels";

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

// Mock connected social accounts - now integrated with real YouTube data
const mockConnectedAccounts = {
  youtube: [], // This will be populated from real data
  tiktok: ["@motivationhub", "@techtalks", "@foodiefinds", "@lifehacks101"],
};

// Predefined theme categories
const availableThemes = [
  { id: "productivity", name: "Productivity & Self-Improvement", color: "from-blue-500 to-cyan-500" },
  { id: "motivation", name: "Motivational Content", color: "from-orange-500 to-red-500" },
  { id: "wellness", name: "Health & Wellness", color: "from-green-500 to-emerald-500" },
  { id: "knowledge", name: "Quick Learning & Facts", color: "from-purple-500 to-pink-500" },
];

// Predefined voice options
const availableVoices = [
  { id: "aria", name: "Aria", type: "free" as const },
  { id: "marcus", name: "Marcus", type: "free" as const },
  { id: "sofia", name: "Sofia", type: "free" as const },
  { id: "alexander", name: "Alexander", type: "premium" as const },
  { id: "isabella", name: "Isabella", type: "premium" as const },
  { id: "james", name: "James", type: "premium" as const },
];

// Predefined schedule options
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
  const [channels, setChannels] = useState<ContentChannel[]>(mockChannels);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ContentChannel | null>(null);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [formData, setFormData] = useState({
    platform: "",
    accountName: "",
    videoStyle: "",
    voice: "",
    topic: "",
    schedule: "",
  });

  // Add YouTube channels hook
  const { channels: youtubeChannels, connectYouTube, loading: youtubeLoading } = useYouTubeChannels();

  const resetForm = () => {
    setFormData({
      platform: "",
      accountName: "",
      videoStyle: "",
      voice: "",
      topic: "",
      schedule: "",
    });
    setGeneratedTopics([]);
    setCustomTopic("");
  };

  const generateAITopics = async () => {
    setIsGeneratingTopics(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiTopics = [
      "Morning routines that actually work",
      "5-minute productivity hacks for busy professionals",
      "Why most people fail at building habits",
      "The secret to staying motivated every day",
      "Simple tricks to boost your energy instantly",
    ];
    
    setGeneratedTopics(aiTopics);
    setIsGeneratingTopics(false);
    
    toast({
      title: "Topics Generated",
      description: "AI has suggested topics based on your video style selection!",
    });
  };

  const handleCreateChannel = () => {
    if (!formData.platform || !formData.accountName || !formData.videoStyle || !formData.voice || !formData.topic || !formData.schedule) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedStyle = availableVideoStyles.find(s => s.id === formData.videoStyle);
    const selectedVoice = availableVoices.find(v => v.id === formData.voice);

    const newChannel: ContentChannel = {
      id: Date.now().toString(),
      name: formData.accountName,
      socialAccount: {
        platform: formData.platform as "youtube" | "tiktok",
        accountName: formData.accountName,
        connected: true,
      },
      theme: selectedStyle!,
      voice: selectedVoice!,
      topic: formData.topic,
      schedule: formData.schedule,
      status: "setup",
      totalVideos: 0,
    };

    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    onChannelsUpdate?.(updatedChannels);
    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: "Channel Created",
      description: `${formData.accountName} channel has been created successfully!`,
    });
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

  const getSelectedSchedulePrice = () => {
    const selectedSchedule = scheduleOptions.find(s => s.value === formData.schedule);
    return selectedSchedule ? selectedSchedule.price : "$0/month";
  };

  const getAvailableAccounts = () => {
    if (!formData.platform) return [];
    
    if (formData.platform === 'youtube') {
      return youtubeChannels.map(channel => channel.channel_name);
    }
    
    return mockConnectedAccounts[formData.platform as keyof typeof mockConnectedAccounts] || [];
  };

  const handleConnectYouTube = () => {
    connectYouTube();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400">Create and manage your content channels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content Channel</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new channel with its own video style, voice, and topic configuration
              </DialogDescription>
            </DialogHeader>
            
            {/* Subscription Impact Notice */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium">Subscription Impact</h4>
                  <p className="text-gray-300 text-sm">
                    Creating a new channel will add to your monthly subscription. Each channel is billed separately based on its posting frequency.
                  </p>
                  {formData.schedule && (
                    <div className="mt-2 p-2 bg-blue-500/20 rounded border border-blue-500/30">
                      <p className="text-white font-medium">Selected Plan: {getSelectedSchedulePrice()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Platform and Account Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Social Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value, accountName: ""})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="youtube" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        <div className="flex items-center space-x-2">
                          <Youtube className="w-4 h-4 text-red-500" />
                          <span>YouTube</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tiktok" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        <div className="flex items-center space-x-2">
                          <Music className="w-4 h-4 text-pink-500" />
                          <span>TikTok</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account">Connected Account</Label>
                  <Select 
                    value={formData.accountName} 
                    onValueChange={(value) => setFormData({...formData, accountName: value})}
                    disabled={!formData.platform}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder={formData.platform ? "Select account" : "Choose platform first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {getAvailableAccounts().map((account) => (
                        <SelectItem key={account} value={account} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          {account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.platform === 'youtube' && youtubeChannels.length === 0 && !youtubeLoading && (
                    <div className="space-y-2">
                      <p className="text-xs text-yellow-400">No YouTube channels connected.</p>
                      <Button 
                        type="button"
                        onClick={handleConnectYouTube}
                        size="sm"
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <Youtube className="w-4 h-4 mr-2" />
                        Connect YouTube Account
                      </Button>
                    </div>
                  )}
                  {formData.platform && formData.platform !== 'youtube' && getAvailableAccounts().length === 0 && (
                    <p className="text-xs text-yellow-400">No connected accounts found. Connect your {formData.platform} account first.</p>
                  )}
                </div>
              </div>

              {/* Video Style and Voice */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoStyle">Video Style</Label>
                  <Select value={formData.videoStyle} onValueChange={(value) => setFormData({...formData, videoStyle: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select video style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {availableVideoStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-gray-400">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voice">AI Voice</Label>
                  <Select value={formData.voice} onValueChange={(value) => setFormData({...formData, voice: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          <div className="flex items-center justify-between w-full">
                            <span>{voice.name}</span>
                            {voice.type === "premium" && <span className="text-yellow-400">👑</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Schedule Selection with Pricing */}
              <div className="space-y-2">
                <Label htmlFor="schedule" className="flex items-center space-x-2">
                  <span>Posting Schedule</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </Label>
                <Select value={formData.schedule} onValueChange={(value) => setFormData({...formData, schedule: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select schedule & pricing" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {scheduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-medium">{option.label}</span>
                            <span className="text-gray-400 text-xs ml-2">({option.description})</span>
                          </div>
                          <span className="text-green-400 font-medium ml-4">{option.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.schedule && (
                  <div className="text-xs text-gray-400 mt-1">
                    This will add {getSelectedSchedulePrice()} to your monthly subscription
                  </div>
                )}
              </div>

              {/* Topic Selection */}
              <div className="space-y-3">
                <Label>Topic Selection</Label>
                
                {/* Topic Categories */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Choose from popular topics:</Label>
                  <Select value={formData.topic} onValueChange={(value) => setFormData({...formData, topic: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select a topic category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {topicCategories.map((topic) => (
                        <SelectItem key={topic} value={topic} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Topic Generation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-300">Or get AI-generated topic suggestions:</Label>
                    <Button 
                      type="button"
                      onClick={generateAITopics}
                      disabled={!formData.videoStyle || isGeneratingTopics}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGeneratingTopics ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate Topics
                    </Button>
                  </div>
                  
                  {generatedTopics.length > 0 && (
                    <div className="space-y-2">
                      {generatedTopics.map((topic, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({...formData, topic})}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            formData.topic === topic 
                              ? "bg-purple-500/20 border-purple-500/50 text-white" 
                              : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Topic Input */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Or enter a custom topic:</Label>
                  <Input
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      setFormData({...formData, topic: e.target.value});
                    }}
                    placeholder="e.g., Morning routines for entrepreneurs"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            {formData.schedule && (
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Subscription Summary</h4>
                    <p className="text-gray-400 text-sm">This channel will be added to your billing</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{getSelectedSchedulePrice()}</p>
                    <p className="text-xs text-gray-400">per month</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={handleCreateChannel} className="bg-blue-600 hover:bg-blue-700">
                {formData.schedule ? `Create Channel (${getSelectedSchedulePrice()})` : "Create Channel"}
              </Button>
            </div>
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
              Create your first content channel to start generating AI-powered videos
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
