
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TopicSelectorProps {
  topicSelection: string;
  onTopicSelectionChange: (value: string) => void;
  selectedTopics: string[];
  onTopicToggle: (topic: string) => void;
  customTopic: string;
  onCustomTopicChange: (topic: string) => void;
  onAddCustomTopic: () => void;
  onRemoveSelectedTopic: (topic: string) => void;
  selectedVideoTypes: string[];
  onGenerateAITopics: () => void;
  isGeneratingTopics: boolean;
  generatedTopics: string[];
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

export const TopicSelector = ({
  topicSelection,
  onTopicSelectionChange,
  selectedTopics,
  onTopicToggle,
  customTopic,
  onCustomTopicChange,
  onAddCustomTopic,
  onRemoveSelectedTopic,
  selectedVideoTypes,
  onGenerateAITopics,
  isGeneratingTopics,
  generatedTopics
}: TopicSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-white">Content Topics</Label>
      
      <RadioGroup value={topicSelection} onValueChange={onTopicSelectionChange} className="space-y-3">
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
            AI-generated topics based on video styles
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
                onClick={() => onTopicToggle(topic)}
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
              onClick={onGenerateAITopics}
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
                  onClick={() => onTopicToggle(topic)}
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
              onChange={(e) => onCustomTopicChange(e.target.value)}
              placeholder="e.g., Morning routines for entrepreneurs"
              className="bg-gray-800 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && onAddCustomTopic()}
            />
            <Button 
              type="button"
              onClick={onAddCustomTopic}
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
                onClick={() => onRemoveSelectedTopic(topic)}
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
