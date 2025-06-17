
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
    <div className="space-y-3">
      <Label className="text-white">Video Styles (Select Multiple for Variety)</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {videoStyleOptions.map((style) => (
          <Card
            key={style.id}
            className={`cursor-pointer transition-all ${
              selectedVideoTypes.includes(style.id)
                ? "bg-blue-600/20 border-blue-500 border-2"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
            onClick={() => onVideoTypeToggle(style.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{style.name}</h4>
                <Checkbox 
                  checked={selectedVideoTypes.includes(style.id)}
                  onChange={() => {}} 
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
              <p className="text-gray-400 text-sm">{style.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedVideoTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedVideoTypes.map(typeId => {
            const type = videoStyleOptions.find(s => s.id === typeId);
            return (
              <Badge key={typeId} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {type?.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { videoStyleOptions };
