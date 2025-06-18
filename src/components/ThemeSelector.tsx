
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ThemeSelectorProps {
  selectedThemes: string[];
  onThemesChange: (themes: string[]) => void;
}

const popularThemes = [
  "Productivity & Self-Improvement",
  "Health & Fitness",
  "Technology & Gadgets",
  "Business & Entrepreneurship",
  "Personal Finance",
  "Motivational & Inspirational",
  "Lifestyle & Wellness",
  "Education & Learning",
  "Travel & Adventure",
  "Food & Cooking",
  "Fashion & Beauty",
  "Gaming & Entertainment",
  "DIY & Crafts",
  "Relationships & Dating",
  "Parenting & Family",
  "Career Development",
  "Mental Health & Mindfulness",
  "Science & Innovation",
  "Sports & Recreation",
  "Music & Arts",
  "Home & Garden",
  "Automotive",
  "Photography & Videography",
  "Comedy & Humor"
];

export const ThemeSelector = ({ selectedThemes, onThemesChange }: ThemeSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredThemes = popularThemes.filter(theme =>
    theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleThemeToggle = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      onThemesChange(selectedThemes.filter(t => t !== theme));
    } else {
      onThemesChange([...selectedThemes, theme]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white text-lg font-medium">Content Themes</Label>
        <p className="text-gray-400 text-sm mt-1">
          Select themes that align with your content focus. These will guide topic selection and content style.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search themes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
        />
      </div>

      {/* Selected themes summary */}
      {selectedThemes.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-300 text-sm mb-2">Selected themes ({selectedThemes.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedThemes.map((theme) => (
              <Badge 
                key={theme} 
                className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs"
              >
                {theme}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Theme grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredThemes.map((theme) => {
          const isSelected = selectedThemes.includes(theme);
          
          return (
            <Card
              key={theme}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600/30 border-blue-400 border-2 shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
              }`}
              onClick={() => handleThemeToggle(theme)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleThemeToggle(theme)}
                      onClick={(e) => e.stopPropagation()}
                      className={`${
                        isSelected 
                          ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                          : "border-white/30"
                      }`}
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm">{theme}</h4>
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

      {filteredThemes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No themes found matching "{searchTerm}"</p>
        </div>
      )}

      {selectedThemes.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-300 text-sm">
            💡 Select at least one theme to help guide your content creation
          </p>
        </div>
      )}
    </div>
  );
};
