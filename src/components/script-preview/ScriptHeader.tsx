
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ContentStatusProgress } from "@/components/ContentStatusProgress";
import { ContentItem, Scene, StoryboardItem } from "./types";
import { ScriptHeaderInfo } from "./ScriptHeaderInfo";
import { ScriptHeaderActions } from "./ScriptHeaderActions";
import { VideoPreview } from "./VideoPreview";

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
    <div className="space-y-4">
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <ScriptHeaderInfo contentItem={contentItem} scenes={scenes} />
            <ScriptHeaderActions 
              onGenerateContent={onGenerateContent}
              isGenerating={isGenerating}
              onCreateVideoShort={onCreateVideoShort}
              isCreatingVideoShort={isCreatingVideoShort}
              allScenesGenerated={allScenesGenerated}
            />
          </div>
        </CardHeader>
        
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

      <VideoPreview contentItem={contentItem} />
    </div>
  );
};
