
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Edit, Download, Clock, Eye, Wand2 } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  theme: string;
  scheduledFor: string;
  status: string;
  engagement: string;
  channel: string;
  script: string;
  duration?: number;
}

interface ScriptPreviewProps {
  contentItem: ContentItem;
}

export const ScriptPreview = ({ contentItem }: ScriptPreviewProps) => {
  const [selectedScene, setSelectedScene] = useState(1);

  // Parse the script to create scenes (this is a simplified parser)
  const parseScriptToScenes = (script: string) => {
    // Split script by paragraphs or sentences to create scenes
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sceneDuration = (contentItem.duration || 60) / Math.max(sentences.length, 1);
    
    return sentences.map((sentence, index) => ({
      id: index + 1,
      timestamp: `${Math.floor(index * sceneDuration / 60)}:${String(Math.floor(index * sceneDuration) % 60).padStart(2, '0')}-${Math.floor((index + 1) * sceneDuration / 60)}:${String(Math.floor((index + 1) * sceneDuration) % 60).padStart(2, '0')}`,
      text: sentence.trim(),
      visual: `Visual description for scene ${index + 1}: Supporting imagery for "${sentence.trim().substring(0, 30)}..."`,
      voiceNote: index === 0 ? "Enthusiastic opening tone" : index === sentences.length - 1 ? "Strong concluding tone" : "Clear and engaging delivery"
    }));
  };

  const scenes = parseScriptToScenes(contentItem.script);
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "60 seconds";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs} seconds`;
  };

  const mockStoryboard = scenes.map((scene, index) => ({
    scene: scene.id,
    description: `Scene ${scene.id}: ${scene.visual}`
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Script Preview</h2>
        <p className="text-gray-400">Review and edit your AI-generated video script</p>
      </div>

      {/* Script Header */}
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
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Generate Video
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scene List */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-white font-medium">Scenes</h4>
              {scenes.map((scene) => (
                <Card 
                  key={scene.id}
                  className={`cursor-pointer transition-all ${
                    selectedScene === scene.id
                      ? "bg-blue-600/20 border-blue-500"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedScene(scene.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Scene {scene.id}
                      </Badge>
                      <span className="text-xs text-gray-400">{scene.timestamp}</span>
                    </div>
                    <p className="text-white text-sm line-clamp-2">{scene.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scene Details */}
            <div className="lg:col-span-2">
              {scenes.find(scene => scene.id === selectedScene) && (
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Scene {selectedScene} • {scenes.find(scene => scene.id === selectedScene)?.timestamp}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Script Text */}
                    <div>
                      <h5 className="text-white font-medium mb-2">Script Text</h5>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white text-lg leading-relaxed">
                          {scenes.find(scene => scene.id === selectedScene)?.text}
                        </p>
                      </div>
                    </div>

                    {/* Visual Description */}
                    <div>
                      <h5 className="text-white font-medium mb-2">Visual Description</h5>
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-purple-200">
                          {scenes.find(scene => scene.id === selectedScene)?.visual}
                        </p>
                      </div>
                    </div>

                    {/* Voice Notes */}
                    <div>
                      <h5 className="text-white font-medium mb-2">Voice Direction</h5>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-200">
                          {scenes.find(scene => scene.id === selectedScene)?.voiceNote}
                        </p>
                      </div>
                    </div>

                    {/* Scene Actions */}
                    <div className="flex space-x-3">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Scene
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Play className="w-4 h-4 mr-2" />
                        Preview Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="storyboard">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Visual Storyboard</CardTitle>
              <CardDescription className="text-gray-400">
                AI-generated visual descriptions for video production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockStoryboard.map((board, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Scene {board.scene}</span>
                      </div>
                      <p className="text-white text-sm">{board.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Production Pipeline</CardTitle>
              <CardDescription className="text-gray-400">
                Automated video generation workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: "Script Analysis", status: "completed", description: "AI analyzed script for timing and content" },
                  { step: "Voice Generation", status: "completed", description: "AI voice narration generated with selected voice" },
                  { step: "Visual Assets", status: contentItem.status === 'draft' ? "completed" : "processing", description: "Requesting video clips from AI models (VEO 3)" },
                  { step: "Final Assembly", status: contentItem.status === 'published' ? "completed" : "pending", description: "Merging clips, adding overlays and effects" }
                ].map((item, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium text-sm">{item.step}</h5>
                        <Badge 
                          className={
                            item.status === "completed" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : item.status === "processing"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Start Video Production
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
