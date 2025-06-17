
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface VideoStyleSelectorProps {
  selectedVideoTypes: string[];
  onVideoTypeToggle: (typeId: string) => void;
}

const videoStyleOptions = [
  { id: "story", name: "Story Format", description: "Narrative-driven content with beginning, middle, and end" },
  { id: "top5", name: "Top 5 Lists", description: "Countdown and ranking format" },
  { id: "bestof", name: "Best of All Time", description: "Ultimate guides and definitive lists" },
  { id: "howto", name: "How-To Tutorial", description: "Step-by-step instructional content" },
  { id: "reaction", name: "Reaction & Commentary", description: "Response and opinion-based content" },
  { id: "quicktips", name: "Quick Tips", description: "Short, actionable advice format" },
];

export const VideoStyleSelector = ({ selectedVideoTypes, onVideoTypeToggle }: VideoStyleSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white text-lg font-medium">Video Styles</Label>
        <p className="text-gray-400 text-sm mt-1">Select multiple styles for variety in your content</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onVideoTypeToggle(style.id)}
                      className={`${
                        isSelected 
                          ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                          : "border-white/30"
                      }`}
                    />
                    <h4 className="text-white font-medium text-sm">{style.name}</h4>
                  </div>
                  {isSelected && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed ml-7">{style.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedVideoTypes.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium text-sm">Selected Video Styles ({selectedVideoTypes.length})</h4>
            <button 
              onClick={() => selectedVideoTypes.forEach(id => onVideoTypeToggle(id))}
              className="text-blue-400 hover:text-blue-300 text-xs underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedVideoTypes.map(typeId => {
              const type = videoStyleOptions.find(s => s.id === typeId);
              return (
                <Badge 
                  key={typeId} 
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 cursor-pointer hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoTypeToggle(typeId);
                  }}
                >
                  {type?.name} ×
                </Badge>
              );
            })}
          </div>
        </div>
      )}
      
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
