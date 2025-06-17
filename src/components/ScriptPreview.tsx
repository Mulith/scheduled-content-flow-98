
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { ContentItem } from "./script-preview/types";
import { getScenes } from "./script-preview/utils";
import { ScriptHeader } from "./script-preview/ScriptHeader";
import { ScriptTimeline } from "./script-preview/ScriptTimeline";
import { Storyboard } from "./script-preview/Storyboard";
import { ProductionPipeline } from "./script-preview/ProductionPipeline";

interface ScriptPreviewProps {
  contentItem: ContentItem;
}

export const ScriptPreview = ({ contentItem }: ScriptPreviewProps) => {
  const [selectedScene, setSelectedScene] = useState(1);
  const { generateVideos, isGenerating } = useVideoGeneration();

  const handleGenerateVideos = () => {
    generateVideos.mutate(contentItem.id);
  };

  const scenes = getScenes(contentItem);
  
  const mockStoryboard = scenes.map((scene, index) => {
    const sceneData = contentItem.scenes?.find(s => s.scene_number === scene.id);
    const sceneVideo = sceneData?.content_scene_videos?.[0];
    
    return {
      scene: scene.id,
      description: `Scene ${scene.id}: ${scene.visual}`,
      videoUrl: sceneVideo?.video_url,
      videoStatus: sceneVideo?.video_status || 'not_started',
      errorMessage: sceneVideo?.error_message
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Script Preview</h2>
        <p className="text-gray-400">Review and edit your AI-generated video script</p>
      </div>

      <ScriptHeader 
        contentItem={contentItem}
        scenes={scenes}
        onGenerateVideos={handleGenerateVideos}
        isGenerating={isGenerating}
      />

      {/* Script Content */}
      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10">
          <TabsTrigger value="script" className="text-white data-[state=active]:bg-blue-600">
            Script Timeline
          </TabsTrigger>
          <TabsTrigger value="storyboard" className="text-white data-[state=active]:bg-blue-600">
            Storyboard
          </TabsTrigger>
          <TabsTrigger value="production" className="text-white data-[state=active]:bg-blue-600">
            Production Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-4">
          <ScriptTimeline 
            scenes={scenes}
            selectedScene={selectedScene}
            onSceneSelect={setSelectedScene}
          />
        </TabsContent>

        <TabsContent value="storyboard">
          <Storyboard contentItem={contentItem} storyboard={mockStoryboard} />
        </TabsContent>

        <TabsContent value="production">
          <ProductionPipeline contentItem={contentItem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
