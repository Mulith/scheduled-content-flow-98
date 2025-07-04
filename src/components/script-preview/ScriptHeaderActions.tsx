
import { Button } from "@/components/ui/button";
import { Play, Edit, Download, Video } from "lucide-react";
import { StoryboardItem } from "./types";

interface ScriptHeaderActionsProps {
  onGenerateContent: () => void;
  isGenerating: boolean;
  onCreateVideoShort?: () => void;
  isCreatingVideoShort?: boolean;
  allScenesGenerated: boolean;
}

export const ScriptHeaderActions = ({ 
  onGenerateContent, 
  isGenerating, 
  onCreateVideoShort, 
  isCreatingVideoShort, 
  allScenesGenerated 
}: ScriptHeaderActionsProps) => {
  return (
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
  );
};
