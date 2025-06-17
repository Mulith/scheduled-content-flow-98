
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2 } from "lucide-react";
import { ContentItem } from "./types";

interface ProductionPipelineProps {
  contentItem: ContentItem;
}

export const ProductionPipeline = ({ contentItem }: ProductionPipelineProps) => {
  const pipelineSteps = [
    { step: "Script Analysis", status: "completed", description: "AI analyzed script for timing and content" },
    { step: "Voice Generation", status: "completed", description: "AI voice narration generated with selected voice" },
    { step: "Visual Assets", status: contentItem.status === 'draft' ? "completed" : "processing", description: "Requesting video clips from AI models (VEO 3)" },
    { step: "Final Assembly", status: contentItem.status === 'published' ? "completed" : "pending", description: "Merging clips, adding overlays and effects" }
  ];

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Production Pipeline</CardTitle>
        <CardDescription className="text-gray-400">
          Automated video generation workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((item, index) => (
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
  );
};
