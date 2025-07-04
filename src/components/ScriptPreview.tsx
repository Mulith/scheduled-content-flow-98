
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
  contentItem: any; // Real content item from database
}

export const ScriptPreview = ({ contentItem }: ScriptPreviewProps) => {
  const [selectedScene, setSelectedScene] = useState(1);
  const { generateVideos, isGenerating, createVideoShort, isCreatingVideoShort } = useVideoGeneration();

  const handleGenerateContent = () => {
    generateVideos.mutate(contentItem.id);
  };

  const handleCreateVideoShort = () => {
    createVideoShort.mutate({ 
      contentItemId: contentItem.id, 
      voiceId: 'Aria' // Default voice, can be made configurable
    });
  };

  // Process scenes from the real data structure
  const scenes = contentItem.content_scenes?.map((scene: any) => ({
    id: scene.scene_number,
    timestamp: `${Math.floor(scene.start_time_seconds / 60)}:${(scene.start_time_seconds % 60).toString().padStart(2, '0')}`,
    text: scene.narration_text,
    visual: scene.visual_description,
    voiceNote: `Scene ${scene.scene_number}`
  })) || [];

  // Process storyboard data from real database structure
  const storyboard = contentItem.content_scenes?.map((scene: any) => {
    const sceneVideo = scene.content_scene_videos?.[0];
    
    return {
      scene: scene.scene_number,
      description: `Scene ${scene.scene_number}: ${scene.visual_description}`,
      videoUrl: sceneVideo?.video_url,
      videoStatus: sceneVideo?.video_status || 'not_started',
      errorMessage: sceneVideo?.error_message
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Script Preview</h2>
        <p className="text-gray-400">Review and edit your AI-generated content script</p>
      </div>

      <ScriptHeader 
        contentItem={contentItem}
        scenes={scenes}
        onGenerateContent={handleGenerateContent}
        isGenerating={isGenerating}
        onCreateVideoShort={handleCreateVideoShort}
        isCreatingVideoShort={isCreatingVideoShort}
        storyboard={storyboard}
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
          <Storyboard contentItem={contentItem} storyboard={storyboard} />
        </TabsContent>

        <TabsContent value="production">
          <ProductionPipeline contentItem={contentItem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
