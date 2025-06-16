
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Type, RefreshCw } from "lucide-react";

const colorPresets = [
  { name: "Classic White", primary: "#FFFFFF", secondary: "#F8F9FA", accent: "#E9ECEF" },
  { name: "Bold Yellow", primary: "#FFD700", secondary: "#FFF3CD", accent: "#FFEB9C" },
  { name: "Electric Blue", primary: "#00D4FF", secondary: "#B3F0FF", accent: "#80E5FF" },
  { name: "Vibrant Orange", primary: "#FF6B35", secondary: "#FFE5DB", accent: "#FFB199" },
  { name: "Neon Green", primary: "#39FF14", secondary: "#E5FFE0", accent: "#B3FFB3" },
  { name: "Hot Pink", primary: "#FF1493", secondary: "#FFE4F1", accent: "#FFADD6" },
  { name: "Purple Power", primary: "#8A2BE2", secondary: "#F0E6FF", accent: "#D1B3FF" },
  { name: "Sunset Red", primary: "#FF4500", secondary: "#FFE4DB", accent: "#FFB399" },
];

const fontStyles = [
  { name: "Bold Sans", style: "font-black", weight: "900" },
  { name: "Medium Sans", style: "font-bold", weight: "700" },
  { name: "Regular Sans", style: "font-semibold", weight: "600" },
  { name: "Light Sans", style: "font-medium", weight: "500" },
];

export const ColorCustomizer = () => {
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [selectedFont, setSelectedFont] = useState(fontStyles[0]);
  const [customColor, setCustomColor] = useState("#FFFFFF");

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Text & Color Customization
        </CardTitle>
        <CardDescription className="text-gray-400">
          Customize the appearance of text overlays in your videos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Presets */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Color Presets</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {colorPresets.map((preset) => (
              <div
                key={preset.name}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                  selectedColor.name === preset.name
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/30"
                }`}
                onClick={() => setSelectedColor(preset)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.primary }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.secondary }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.accent }}
                  ></div>
                </div>
                <p className="text-white text-sm font-medium">{preset.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Color Picker */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Custom Color</h4>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-12 h-12 rounded-lg border border-white/20 bg-transparent cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>

        {/* Font Styles */}
        <div className="space-y-4">
          <h4 className="text-white font-medium flex items-center">
            <Type className="w-4 h-4 mr-2" />
            Font Weight
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fontStyles.map((font) => (
              <div
                key={font.name}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  selectedFont.name === font.name
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/30"
                }`}
                onClick={() => setSelectedFont(font)}
              >
                <p className={`text-white text-center ${font.style}`}>
                  Aa
                </p>
                <p className="text-gray-400 text-xs text-center mt-1">
                  {font.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Preview</h4>
          <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 aspect-video flex items-center justify-center">
            <div className="text-center space-y-4">
              <h3 
                className={`text-4xl ${selectedFont.style}`}
                style={{ color: selectedColor.primary }}
              >
                Your Video Title
              </h3>
              <p 
                className="text-lg font-medium"
                style={{ color: selectedColor.secondary }}
              >
                Subtitle text appears here
              </p>
              <div 
                className="inline-block px-4 py-2 rounded-full font-semibold"
                style={{ 
                  backgroundColor: selectedColor.accent,
                  color: selectedColor.primary === "#FFFFFF" ? "#000000" : selectedColor.primary 
                }}
              >
                Call to Action
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            Apply to All Videos
          </Button>
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
