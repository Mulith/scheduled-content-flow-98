import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Crown, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useVoices } from "@/hooks/useVoices";
import { supabase } from "@/integrations/supabase/client";

export const VoiceSelector = () => {
  const { voices, isLoading, error, refetch } = useVoices();
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [voiceSettings, setVoiceSettings] = useState({
    speed: [1],
    pitch: [1],
    volume: [0.8],
  });

  // Set first voice as default when voices load
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0].id);
    }
  }, [voices, selectedVoice]);

  const handleVoiceSelect = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    if (voice?.type === "premium") {
      toast({
        title: "Premium Voice Selected",
        description: "Premium voices require an additional fee. Upgrade your plan to unlock all features.",
        variant: "default",
      });
    }
    setSelectedVoice(voiceId);
  };

  const handlePlayPreview = async (voiceId: string) => {
    if (isPlaying === voiceId) {
      // Stop current audio
      const audio = audioElements.get(voiceId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlaying(null);
      return;
    }

    try {
      setIsPlaying(voiceId);
      
      const voice = voices.find(v => v.id === voiceId);
      if (!voice) return;

      // Check if we already have audio for this voice
      let audio = audioElements.get(voiceId);
      
      if (!audio) {
        // Generate new audio using ElevenLabs
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': await getElevenLabsKey(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: voice.preview,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate audio preview');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audio = new Audio(audioUrl);
        
        // Store audio element
        const newAudioElements = new Map(audioElements);
        newAudioElements.set(voiceId, audio);
        setAudioElements(newAudioElements);
      }

      // Set volume and play
      audio.volume = voiceSettings.volume[0];
      audio.playbackRate = voiceSettings.speed[0];
      
      audio.onended = () => setIsPlaying(null);
      audio.onerror = () => {
        setIsPlaying(null);
        toast({
          title: "Playback Error",
          description: "Failed to play voice preview",
          variant: "destructive",
        });
      };

      await audio.play();
      
      toast({
        title: "Playing Preview",
        description: `Now playing: ${voice?.name}`,
      });
    } catch (error) {
      setIsPlaying(null);
      console.error('Error playing voice preview:', error);
      toast({
        title: "Preview Failed",
        description: "Could not play voice preview. Using fallback simulation.",
        variant: "destructive",
      });
      
      // Fallback to simulation
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  const getElevenLabsKey = async () => {
    // In a real implementation, this would get the key from your backend
    // For now, we'll try to get it from the edge function or use a fallback
    try {
      const { data } = await supabase.functions.invoke('get-voices');
      return data?.apiKey; // This would need to be modified in the edge function
    } catch {
      // Fallback - in production you'd handle this properly
      return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Voice Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-white">Loading voices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Voice Selection
          {error && (
            <Button
              size="sm"
              variant="ghost"
              onClick={refetch}
              className="ml-auto text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose the perfect voice for your content narration
          {error && (
            <span className="block text-yellow-400 text-sm mt-1">
              Using fallback voices - click refresh to retry
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map((voice) => (
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
        {voices.find(v => v.id === selectedVoice)?.type === "premium" && (
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
