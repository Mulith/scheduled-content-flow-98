
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, CreditCard, Loader2, X, Sparkles, RefreshCw } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useVoices } from "@/hooks/useVoices";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ChannelCreation = () => {
  const [channelName, setChannelName] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<string[]>([]);
  const [topicSelection, setTopicSelection] = useState("ai-decide");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);
  
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();
  const { voices, isLoading: voicesLoading } = useVoices();

  const scheduleOptions = [
    { value: "monthly", label: "Monthly", price: "$15/month", description: "1 video per month" },
    { value: "weekly", label: "Weekly", price: "$20/month", description: "4 videos per month" },
    { value: "daily", label: "Daily", price: "$30/month", description: "30 videos per month" },
    { value: "twice-daily", label: "2x Daily", price: "$45/month", description: "60 videos per month" },
  ];

  const videoStyleOptions = [
    { id: "story", name: "Story Format", description: "Narrative-driven content with beginning, middle, and end" },
    { id: "top5", name: "Top 5 Lists", description: "Countdown and ranking format" },
    { id: "bestof", name: "Best of All Time", description: "Ultimate guides and definitive lists" },
    { id: "howto", name: "How-To Tutorial", description: "Step-by-step instructional content" },
    { id: "reaction", name: "Reaction & Commentary", description: "Response and opinion-based content" },
    { id: "quicktips", name: "Quick Tips", description: "Short, actionable advice format" },
  ];

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

  const handleVideoTypeToggle = (videoTypeId: string) => {
    setSelectedVideoTypes(prev => 
      prev.includes(videoTypeId) 
        ? prev.filter(id => id !== videoTypeId)
        : [...prev, videoTypeId]
    );
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic("");
    }
  };

  const removeSelectedTopic = (topic: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== topic));
  };

  const generateAITopics = async () => {
    if (selectedVideoTypes.length === 0) {
      toast({
        title: "Select Video Types First",
        description: "Please select at least one video type to generate relevant topics",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTopics(true);
    // Simulate AI generation based on selected video styles
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const topicsByStyle: Record<string, string[]> = {
      story: [
        "The story behind overnight success myths",
        "How one small habit changed everything", 
        "The real story of productivity experts",
        "What happened when I tried every morning routine",
        "The untold story of workplace efficiency"
      ],
      top5: [
        "Top 5 productivity hacks that actually work",
        "5 morning habits of successful people",
        "Top 5 time management mistakes to avoid",
        "5 apps that will transform your workflow",
        "Top 5 energy boosting techniques"
      ],
      bestof: [
        "Best productivity system of all time",
        "Ultimate guide to time management",
        "Best habits for maximum efficiency",
        "Ultimate workspace setup guide",
        "Best strategies for deep work"
      ],
      howto: [
        "How to build a perfect morning routine",
        "How to eliminate distractions forever",
        "How to double your productivity in 30 days",
        "How to master time blocking",
        "How to create focus in a noisy world"
      ],
      reaction: [
        "Reacting to viral productivity advice",
        "Why productivity gurus are wrong",
        "My honest review of popular time management",
        "Reacting to extreme morning routines",
        "The truth about productivity trends"
      ],
      quicktips: [
        "60-second productivity boost",
        "Quick energy hack for tired minds",
        "Instant focus technique",
        "30-second stress relief method",
        "Quick win for better time management"
      ]
    };
    
    // Get topics for all selected video types
    let aiTopics: string[] = [];
    selectedVideoTypes.forEach(videoType => {
      if (topicsByStyle[videoType]) {
        aiTopics = [...aiTopics, ...topicsByStyle[videoType]];
      }
    });
    
    // Remove duplicates and limit to 10
    aiTopics = [...new Set(aiTopics)].slice(0, 10);
    setGeneratedTopics(aiTopics);
    setIsGeneratingTopics(false);
    
    toast({
      title: "Topics Generated! 🎬",
      description: "AI has suggested topics based on your selected video styles!",
    });
  };

  const handleCreateChannel = async () => {
    const needsTopics = topicSelection !== "ai-decide" && selectedTopics.length === 0;
    
    if (!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || needsTopics) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one video type" + (needsTopics ? " and topic" : ""),
        variant: "destructive",
      });
      return;
    }

    const success = await createCheckoutSession(selectedSchedule, channelName);
    if (success) {
      toast({
        title: "Redirecting to Checkout",
        description: "Opening Stripe checkout in a new tab...",
      });
    }
  };

  const selectedScheduleData = scheduleOptions.find(s => s.value === selectedSchedule);
  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  return (
    <ScrollArea className="max-h-[90vh]">
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Channel
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set up your automated content channel with AI narration and variety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channelName" className="text-white">Channel Name</Label>
            <Input
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g., Daily Productivity Tips"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Video Types Selection - Multiple Selection */}
          <div className="space-y-3">
            <Label className="text-white">Video Types (Select Multiple for Variety)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {videoStyleOptions.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all ${
                    selectedVideoTypes.includes(style.id)
                      ? "bg-blue-600/20 border-blue-500 border-2"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => handleVideoTypeToggle(style.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{style.name}</h4>
                      <Checkbox 
                        checked={selectedVideoTypes.includes(style.id)}
                        onChange={() => {}} 
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                    <p className="text-gray-400 text-sm">{style.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedVideoTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedVideoTypes.map(typeId => {
                  const type = videoStyleOptions.find(s => s.id === typeId);
                  return (
                    <Badge key={typeId} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {type?.name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Schedule Selection */}
          <div className="space-y-3">
            <Label className="text-white">Posting Schedule</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheduleOptions.map((schedule) => (
                <Card
                  key={schedule.value}
                  className={`cursor-pointer transition-all ${
                    selectedSchedule === schedule.value
                      ? "bg-blue-600/20 border-blue-500 border-2"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedSchedule(schedule.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{schedule.label}</h4>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {schedule.price}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{schedule.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-3">
            <Label className="text-white">AI Voice</Label>
            {voicesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-400">Loading voices...</span>
              </div>
            ) : (
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose an AI voice" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id} className="text-white">
                      <div className="flex items-center space-x-2">
                        <span>{voice.name}</span>
                        {voice.type === "premium" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedVoiceData && (
              <p className="text-gray-400 text-sm">
                {selectedVoiceData.description} • {selectedVoiceData.accent} accent
              </p>
            )}
          </div>

          {/* Topics Selection with Radio Options */}
          <div className="space-y-4">
            <Label className="text-white">Content Topics</Label>
            
            <RadioGroup value={topicSelection} onValueChange={setTopicSelection} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai-decide" id="ai-decide" />
                <Label htmlFor="ai-decide" className="text-white cursor-pointer">
                  Let AI decide (Recommended) - AI will choose optimal topics based on trends
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="predefined" id="predefined" />
                <Label htmlFor="predefined" className="text-white cursor-pointer">
                  Choose from predefined topics
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai-generated" id="ai-generated" />
                <Label htmlFor="ai-generated" className="text-white cursor-pointer">
                  AI-generated topics based on video types
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-white cursor-pointer">
                  Add custom topics
                </Label>
              </div>
            </RadioGroup>

            {/* Predefined Topics */}
            {topicSelection === "predefined" && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Popular Topics:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {topicCategories.map((topic) => (
                    <Card
                      key={topic}
                      className={`cursor-pointer transition-all p-3 ${
                        selectedTopics.includes(topic)
                          ? "bg-purple-600/20 border-purple-500"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => handleTopicToggle(topic)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{topic}</span>
                        <Checkbox 
                          checked={selectedTopics.includes(topic)}
                          onChange={() => {}}
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Topic Generation */}
            {topicSelection === "ai-generated" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">AI-generated topic suggestions:</Label>
                  <Button 
                    type="button"
                    onClick={generateAITopics}
                    disabled={selectedVideoTypes.length === 0 || isGeneratingTopics}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {generatedTopics.map((topic, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all p-3 ${
                          selectedTopics.includes(topic)
                            ? "bg-purple-600/20 border-purple-500"
                            : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                        }`}
                        onClick={() => handleTopicToggle(topic)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{topic}</span>
                          <Checkbox 
                            checked={selectedTopics.includes(topic)}
                            onChange={() => {}}
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Topic Input */}
            {topicSelection === "custom" && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Add custom topics:</Label>
                <div className="flex space-x-2">
                  <Input
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g., Morning routines for entrepreneurs"
                    className="bg-gray-800 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
                  />
                  <Button 
                    type="button"
                    onClick={addCustomTopic}
                    disabled={!customTopic.trim()}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Selected Topics Display */}
            {(topicSelection !== "ai-decide" && selectedTopics.length > 0) && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Selected Topics ({selectedTopics.length}):</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map((topic) => (
                    <Badge 
                      key={topic} 
                      className="bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                      onClick={() => removeSelectedTopic(topic)}
                    >
                      {topic}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {channelName && selectedSchedule && selectedVoice && selectedVideoTypes.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-3">Channel Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Channel Name:</span>
                    <span className="text-white">{channelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Video Types:</span>
                    <span className="text-white">{selectedVideoTypes.length} types selected</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 text-sm">Selected Types:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedVideoTypes.map(typeId => {
                        const type = videoStyleOptions.find(s => s.id === typeId);
                        return (
                          <Badge key={typeId} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            {type?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Topic Selection:</span>
                    <span className="text-white">
                      {topicSelection === "ai-decide" ? "AI Decides" : `${selectedTopics.length} topics selected`}
                    </span>
                  </div>
                  {topicSelection !== "ai-decide" && selectedTopics.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-gray-400 text-sm">Selected Topics:</span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {selectedTopics.slice(0, 6).map((topic) => (
                          <Badge key={topic} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            {topic.length > 20 ? topic.substring(0, 20) + '...' : topic}
                          </Badge>
                        ))}
                        {selectedTopics.length > 6 && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                            +{selectedTopics.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Schedule:</span>
                    <span className="text-white">{selectedScheduleData?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voice:</span>
                    <span className="text-white">{selectedVoiceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Cost:</span>
                    <span className="text-white font-medium">{selectedScheduleData?.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Channel Button */}
          <Button
            onClick={handleCreateChannel}
            disabled={!channelName || !selectedSchedule || !selectedVoice || selectedVideoTypes.length === 0 || (topicSelection !== "ai-decide" && selectedTopics.length === 0) || checkoutLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Create Channel & Subscribe
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};
