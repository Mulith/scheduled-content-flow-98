
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TopicSelectionProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  selectedVideoTypes?: string[];
  className?: string;
}

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

export const TopicSelection = ({
  selectedMode,
  onModeChange,
  selectedTopics,
  onTopicsChange,
  selectedVideoTypes = [],
  className = ""
}: TopicSelectionProps) => {
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);

  const handleTopicToggle = (topic: string) => {
    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    onTopicsChange(newTopics);
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      onTopicsChange([...selectedTopics, customTopic.trim()]);
      setCustomTopic("");
    }
  };

  const removeSelectedTopic = (topic: string) => {
    onTopicsChange(selectedTopics.filter(t => t !== topic));
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
    
    let aiTopics: string[] = [];
    selectedVideoTypes.forEach(videoType => {
      if (topicsByStyle[videoType]) {
        aiTopics = [...aiTopics, ...topicsByStyle[videoType]];
      }
    });
    
    aiTopics = [...new Set(aiTopics)].slice(0, 10);
    setGeneratedTopics(aiTopics);
    setIsGeneratingTopics(false);
    
    toast({
      title: "Topics Generated! 🎬",
      description: "AI has suggested topics based on your selected video styles!",
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-white">Content Topics</Label>
      
      <RadioGroup value={selectedMode} onValueChange={onModeChange} className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ai-decide" id="ai-decide" />
          <Label htmlFor="ai-decide" className="text-white cursor-pointer">
            Let AI decide (Recommended) - AI will choose optimal topics based on trends
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="predefined" id="predefined" />
          <Label htmlFor="predefined" className="text-white cursor-pointer">
            Choose from a list of topics
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ai-generated" id="ai-generated" />
          <Label htmlFor="ai-generated" className="text-white cursor-pointer">
            Let AI generate topics based on video styles
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="manual" id="manual" />
          <Label htmlFor="manual" className="text-white cursor-pointer">
            Manually type in as many topics as you'd like
          </Label>
        </div>
      </RadioGroup>

      {/* Predefined Topics */}
      {selectedMode === "predefined" && (
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
                <span className="text-white text-sm">{topic}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Topic Generation */}
      {selectedMode === "ai-generated" && (
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
                  <span className="text-white text-sm">{topic}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Topic Input */}
      {selectedMode === "manual" && (
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
      {(selectedMode !== "ai-decide" && selectedTopics.length > 0) && (
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
  );
};
