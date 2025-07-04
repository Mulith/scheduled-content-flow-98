
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import { ContentItem, Scene } from "./types";
import { formatDuration } from "./utils";

interface ScriptHeaderInfoProps {
  contentItem: ContentItem;
  scenes: Scene[];
}

export const ScriptHeaderInfo = ({ contentItem, scenes }: ScriptHeaderInfoProps) => {
  return (
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
  );
};
