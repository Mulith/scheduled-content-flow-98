
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";

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
