import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Youtube, Music, Edit, Trash2, MoreVertical, Palette, Mic, Target, ExternalLink, Calendar, DollarSign, AlertCircle } from "lucide-react";
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
  const [channels, setChannels] = useState<ContentChannel[]>(mockChannels);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ContentChannel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    accountName: "",
    theme: "",
    voice: "",
    topic: "",
    schedule: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      platform: "",
      accountName: "",
      theme: "",
      voice: "",
      topic: "",
      schedule: "",
    });
  };

  const handleCreateChannel = () => {
    if (!formData.name || !formData.platform || !formData.theme || !formData.voice || !formData.topic || !formData.schedule) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedTheme = availableThemes.find(t => t.id === formData.theme);
    const selectedVoice = availableVoices.find(v => v.id === formData.voice);

    const newChannel: ContentChannel = {
      id: Date.now().toString(),
      name: formData.name,
      socialAccount: {
        platform: formData.platform as "youtube" | "tiktok",
        accountName: formData.accountName || "Not connected",
        connected: !!formData.accountName,
      },
      theme: selectedTheme!,
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
      description: `${formData.name} has been created successfully!`,
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
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Content Channel</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new channel with its own theme, voice, and topic configuration
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Channel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Productivity Tips"
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Social Platform</Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account Name (Optional)</Label>
                <Input
                  id="account"
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  placeholder="@youraccount"
                  className="bg-white/10 border-white/20"
                />
              </div>
              
              {/* Enhanced Schedule Selection with Pricing */}
              <div className="space-y-2">
                <Label htmlFor="schedule" className="flex items-center space-x-2">
                  <span>Posting Schedule</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </Label>
                <Select value={formData.schedule} onValueChange={(value) => setFormData({...formData, schedule: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Select schedule & pricing" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    {scheduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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

              <div className="space-y-2">
                <Label htmlFor="theme">Content Theme</Label>
                <Select value={formData.theme} onValueChange={(value) => setFormData({...formData, theme: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    {availableThemes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice">AI Voice</Label>
                <Select value={formData.voice} onValueChange={(value) => setFormData({...formData, voice: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} {voice.type === "premium" && "👑"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="topic">Specific Topic/Niche</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Morning routines for entrepreneurs"
                  className="bg-white/10 border-white/20"
                />
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
                        {channel.socialAccount.accountName}
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
                      <DropdownMenuContent className="bg-gray-800 border-white/10">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(channel.id); }} className="text-white hover:bg-white/10">
                          <Edit className="w-4 h-4 mr-2" />
                          {channel.status === "active" ? "Pause" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteChannel(channel.id); }} className="text-red-400 hover:bg-red-500/10">
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
                      <p className="text-xs text-gray-400">Theme</p>
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
