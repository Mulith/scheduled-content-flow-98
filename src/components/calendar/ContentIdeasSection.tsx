
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Edit, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  title: string;
  theme: string;
  scheduledFor: string;
  status: string;
  engagement: string;
  channel: string;
  script?: string;
  duration?: number;
}

interface ContentIdeasSectionProps {
  contentItems: ContentItem[];
  isLoading: boolean;
  onIdeaClick: (ideaId: string) => void;
  onRefetch: () => void;
}

export const ContentIdeasSection = ({ 
  contentItems, 
  isLoading, 
  onIdeaClick, 
  onRefetch 
}: ContentIdeasSectionProps) => {
  const generateMoreIdeas = async () => {
    try {
      const response = await fetch('/api/content-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger content generation');
      }

      toast({
        title: "Content Generation Started",
        description: "New content ideas are being generated in the background!",
      });

      setTimeout(() => {
        onRefetch();
      }, 2000);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate new content ideas",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "generating": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "published": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "scheduled": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "Very High": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case "draft": return "Script Ready";
      case "generating": return "Generating...";
      case "published": return "Published";
      case "scheduled": return "Scheduled";
      default: return status;
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <PlayCircle className="w-5 h-5 mr-2" />
              AI-Generated Content Ideas
            </CardTitle>
            <CardDescription className="text-gray-400">
              Based on your selected themes and trending topics. Click on any idea to view its script.
            </CardDescription>
          </div>
          <Button 
            onClick={generateMoreIdeas}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Generate More Ideas"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading content ideas...</div>
          </div>
        ) : contentItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No content ideas generated yet</p>
            <Button 
              onClick={generateMoreIdeas}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Generate Your First Ideas
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contentItems.map((idea) => (
              <div 
                key={idea.id} 
                className="p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onIdeaClick(idea.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-2 hover:text-blue-400 transition-colors">{idea.title}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                          {idea.theme}
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {idea.scheduledFor}
                      </div>
                      <div className={`flex items-center ${getEngagementColor(idea.engagement)}`}>
                        <span className="text-xs font-medium">
                          {idea.engagement} Engagement
                        </span>
                      </div>
                      {idea.duration && (
                        <div className="flex items-center text-gray-400">
                          <span className="text-xs">
                            {Math.floor(idea.duration / 60)}:{(idea.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(idea.status)}>
                      {getStatusDisplayText(idea.status)}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality here
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                {idea.status === "draft" && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium">Ready for production!</p>
                    <p className="text-gray-300 text-sm">Script generated • Storyboard created • Voice selected</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
