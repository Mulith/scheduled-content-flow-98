
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scene } from "./types";
import { SceneDetails } from "./SceneDetails";

interface ScriptTimelineProps {
  scenes: Scene[];
  selectedScene: number;
  onSceneSelect: (sceneId: number) => void;
}

export const ScriptTimeline = ({ scenes, selectedScene, onSceneSelect }: ScriptTimelineProps) => {
  const selectedSceneData = scenes.find(scene => scene.id === selectedScene);

  return (
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
            onClick={() => onSceneSelect(scene.id)}
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
        {selectedSceneData && <SceneDetails scene={selectedSceneData} />}
      </div>
    </div>
  );
};
