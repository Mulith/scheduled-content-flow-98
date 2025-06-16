
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const voiceOptions = [
  {
    id: "aria",
    name: "Aria",
    type: "free",
    description: "Warm, friendly female voice perfect for lifestyle content",
    accent: "American",
    preview: "Hello! I'm Aria, and I'll be narrating your amazing content today.",
  },
  {
    id: "marcus",
    name: "Marcus",
    type: "free",
    description: "Professional male voice ideal for business and productivity",
    accent: "American",
    preview: "Welcome to another episode. I'm Marcus, your guide to success.",
  },
  {
    id: "sofia",
    name: "Sofia",
    type: "free",
    description: "Energetic female voice great for motivational content",
    accent: "American",
    preview: "Get ready to transform your life! This is Sofia with your daily motivation.",
  },
  {
    id: "alexander",
    name: "Alexander",
    type: "premium",
    description: "Deep, authoritative male voice for serious topics",
    accent: "British",
    preview: "Good day. I'm Alexander, and today we're exploring fascinating insights.",
  },
  {
    id: "isabella",
    name: "Isabella",
    type: "premium",
    description: "Elegant female voice with sophisticated tone",
    accent: "British",
    preview: "Hello there. Isabella here, ready to share some remarkable discoveries with you.",
  },
  {
    id: "james",
    name: "James",
    type: "premium",
    description: "Charismatic male voice perfect for storytelling",
    accent: "Australian",
    preview: "G'day! James here, and I've got an incredible story to share with you today.",
  },
];

export const VoiceSelector = () => {
  const [selectedVoice, setSelectedVoice] = useState("aria");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    speed: [1],
    pitch: [1],
    volume: [0.8],
  });

  const handleVoiceSelect = (voiceId: string) => {
    const voice = voiceOptions.find(v => v.id === voiceId);
    if (voice?.type === "premium") {
      toast({
        title: "Premium Voice Selected",
        description: "Premium voices require an additional fee. Upgrade your plan to unlock all features.",
        variant: "default",
      });
    }
    setSelectedVoice(voiceId);
  };

  const handlePlayPreview = (voiceId: string) => {
    setIsPlaying(voiceId);
    // Simulate audio playing
    setTimeout(() => {
      setIsPlaying(null);
    }, 3000);
    
    const voice = voiceOptions.find(v => v.id === voiceId);
    toast({
      title: "Playing Preview",
      description: `Now playing: ${voice?.name}`,
    });
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Voice Selection
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose the perfect voice for your content narration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {voiceOptions.map((voice) => (
            <Card 
              key={voice.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedVoice === voice.id
                  ? "bg-blue-600/20 border-blue-500 border-2"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              onClick={() => handleVoiceSelect(voice.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-medium">{voice.name}</h4>
                    {voice.type === "premium" && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={voice.type === "premium" ? "default" : "secondary"}
                      className={voice.type === "premium" 
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                      }
                    >
                      {voice.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(voice.id);
                      }}
                    >
                      {isPlaying === voice.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{voice.description}</p>
                <p className="text-gray-400 text-xs">Accent: {voice.accent}</p>
                <div className="mt-3 p-2 bg-black/20 rounded text-xs text-gray-300 italic">
                  "{voice.preview}"
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Voice Settings */}
        <div className="space-y-6">
          <h4 className="text-white font-medium">Voice Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Speed</label>
                <span className="text-gray-400 text-sm">{voiceSettings.speed[0]}x</span>
              </div>
              <Slider
                value={voiceSettings.speed}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, speed: value }))}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Pitch</label>
                <span className="text-gray-400 text-sm">{voiceSettings.pitch[0]}x</span>
              </div>
              <Slider
                value={voiceSettings.pitch}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                min={0.5}
                max={1.5}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Volume</label>
                <span className="text-gray-400 text-sm">{Math.round(voiceSettings.volume[0] * 100)}%</span>
              </div>
              <Slider
                value={voiceSettings.volume}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Premium Upgrade */}
        {voiceOptions.find(v => v.id === selectedVoice)?.type === "premium" && (
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-yellow-400 font-medium flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium Voice Selected
                  </h4>
                  <p className="text-gray-300 text-sm mt-1">
                    Unlock premium voices for $9.99/month additional
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
