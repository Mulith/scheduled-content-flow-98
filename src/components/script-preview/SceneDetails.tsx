
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Play } from "lucide-react";
import { Scene } from "./types";

interface SceneDetailsProps {
  scene: Scene;
}

export const SceneDetails = ({ scene }: SceneDetailsProps) => {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">
          Scene {scene.id} • {scene.timestamp}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Script Text */}
        <div>
          <h5 className="text-white font-medium mb-2">Script Text</h5>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-white text-lg leading-relaxed">
              {scene.text}
            </p>
          </div>
        </div>

        {/* Visual Description */}
        <div>
          <h5 className="text-white font-medium mb-2">Visual Description</h5>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-200">
              {scene.visual}
            </p>
          </div>
        </div>

        {/* Voice Notes */}
        <div>
          <h5 className="text-white font-medium mb-2">Voice Direction</h5>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200">
              {scene.voiceNote}
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
  );
};
