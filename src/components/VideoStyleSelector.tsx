
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface VideoStyleSelectorProps {
  selectedVideoTypes: string[];
  onVideoTypeToggle: (typeId: string) => void;
}

const videoStyleOptions = [
  { id: "story", name: "Story Format", description: "Narrative-driven content" },
  { id: "top5", name: "Top 5 Lists", description: "Countdown and ranking format" },
  { id: "bestof", name: "Best of All Time", description: "Ultimate guides and definitive lists" },
  { id: "howto", name: "How-To Tutorial", description: "Step-by-step instructional content" },
  { id: "reaction", name: "Reaction & Commentary", description: "Response and opinion-based content" },
  { id: "quicktips", name: "Quick Tips", description: "Short, actionable advice format" },
];

export const VideoStyleSelector = ({ selectedVideoTypes, onVideoTypeToggle }: VideoStyleSelectorProps) => {
  const handleCheckboxChange = (styleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onVideoTypeToggle(styleId);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-white text-lg font-medium">Video Styles</Label>
        <p className="text-gray-400 text-sm mt-1">Select multiple styles for variety in your content</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {videoStyleOptions.map((style) => {
          const isSelected = selectedVideoTypes.includes(style.id);
          
          return (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600/30 border-blue-400 border-2 shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
              }`}
              onClick={() => onVideoTypeToggle(style.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onVideoTypeToggle(style.id)}
                      onClick={(e) => handleCheckboxChange(style.id, e)}
                      className={`${
                        isSelected 
                          ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                          : "border-white/30"
                      }`}
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm">{style.name}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{style.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedVideoTypes.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-300 text-sm">
            ⚠️ Please select at least one video style to continue
          </p>
        </div>
      )}
    </div>
  );
};

export { videoStyleOptions };
