
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit, Download, Clock, Eye, Video } from "lucide-react";
import { ContentStatusProgress } from "@/components/ContentStatusProgress";
import { ContentItem, Scene, StoryboardItem } from "./types";
import { formatDuration } from "./utils";

interface ScriptHeaderProps {
  contentItem: ContentItem;
  scenes: Scene[];
  onGenerateContent: () => void;
  isGenerating: boolean;
  onCreateVideoShort?: () => void;
  isCreatingVideoShort?: boolean;
  storyboard?: StoryboardItem[];
}

export const ScriptHeader = ({ 
  contentItem, 
  scenes, 
  onGenerateContent, 
  isGenerating, 
  onCreateVideoShort, 
  isCreatingVideoShort, 
  storyboard 
}: ScriptHeaderProps) => {
  // Check if all scenes have generated images
  const allScenesGenerated = storyboard?.every(item => 
    item.videoStatus === 'completed' && item.videoUrl
  ) || false;
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-xl">{contentItem.title}</CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  {contentItem.theme}
                </Badge>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(contentItem.duration)}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {scenes.length} scenes
                </span>
              </div>
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Edit className="w-4 h-4 mr-2" />
              Edit Script
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={onGenerateContent}
              disabled={isGenerating}
            >
              <Play className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
            {onCreateVideoShort && allScenesGenerated && (
              <Button 
                className="bg-purple-600 hover:bg-purple-700" 
                onClick={onCreateVideoShort}
                disabled={isCreatingVideoShort}
              >
                <Video className="w-4 h-4 mr-2" />
                {isCreatingVideoShort ? "Creating Video..." : "Create YouTube Short"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {/* Status Progress */}
      {contentItem.generation_stage && (
        <CardContent>
          <ContentStatusProgress
            generationStage={contentItem.generation_stage}
            scriptStatus={contentItem.script_status || 'not_started'}
            videoStatus={contentItem.video_status || 'not_started'}
            musicStatus={contentItem.music_status || 'not_started'}
            postStatus={contentItem.post_status || 'not_started'}
          />
        </CardContent>
      )}
    </Card>
  );
};
