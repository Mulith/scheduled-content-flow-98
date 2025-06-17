
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play, Pause } from "lucide-react";
import { useVoices } from "@/hooks/useVoices";
import { toast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceSelectorWithPreviewProps {
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
  playingVoice: string | null;
  onVoicePreview: (voiceId: string) => void;
}

export const VoiceSelectorWithPreview = ({ 
  selectedVoice, 
  onVoiceSelect, 
  playingVoice, 
  onVoicePreview 
}: VoiceSelectorWithPreviewProps) => {
  const { voices, isLoading: voicesLoading } = useVoices();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);

  const handleVoicePreview = async (voiceId: string) => {
    console.log(`Attempting to preview voice: ${voiceId}`);
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (playingVoice === voiceId) {
      // If clicking the same voice that's playing, stop it
      onVoicePreview("");
      return;
    }

    // Find the voice data from our centralized source
    const voiceData = voices.find(v => v.id === voiceId);
    if (!voiceData) {
      console.error("Voice not found:", voiceId);
      return;
    }

    try {
      setLoadingPreview(voiceId);
      console.log(`Generating voice preview for ${voiceData.name} (${voiceId})`);
      
      // Use our text-to-speech function to generate a preview
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: voiceData.preview,
          voice_id: voiceId,
          model_id: "eleven_turbo_v2_5"
        }
      });

      if (error) {
        throw error;
      }

      if (data?.audio_url) {
        console.log(`Playing generated audio for ${voiceData.name}`);
        
        // Create audio element
        const audio = new Audio();
        audioRef.current = audio;

        audio.onplay = () => {
          console.log("Audio started playing");
          onVoicePreview(voiceId);
        };

        audio.onended = () => {
          console.log("Audio finished playing");
          onVoicePreview("");
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          onVoicePreview("");
          toast({
            title: "Voice Preview Error",
            description: `Could not play voice preview for ${voiceData.name}. Please try again.`,
            variant: "destructive",
          });
        };

        audio.src = data.audio_url;
        await audio.play();
        
      } else {
        throw new Error('No audio URL received');
      }

    } catch (error) {
      console.error('Voice preview failed:', error);
      onVoicePreview("");
      toast({
        title: "Voice Preview Unavailable",
        description: `Voice preview for ${voiceData.name} is temporarily unavailable. You can still select this voice for your content.`,
        variant: "default",
      });
    } finally {
      setLoadingPreview(null);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-white">AI Voice</Label>
      {voicesLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-400">Loading voices...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {voices.map((voice) => (
            <Card
              key={voice.id}
              className={`cursor-pointer transition-all ${
                selectedVoice === voice.id
                  ? "bg-purple-600/20 border-purple-500 border-2"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              onClick={() => onVoiceSelect(voice.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="text-white font-medium flex items-center">
                        {voice.name}
                        {voice.type === "premium" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs ml-2">
                            Premium
                          </Badge>
                        )}
                        {voice.gender && (
                          <Badge className={`text-xs ml-2 ${
                            voice.gender === 'female' 
                              ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {voice.gender === 'female' ? '♀' : '♂'}
                          </Badge>
                        )}
                      </h4>
                      <p className="text-gray-400 text-sm">{voice.description} • {voice.accent} accent</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoicePreview(voice.id);
                      }}
                      disabled={loadingPreview === voice.id}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {loadingPreview === voice.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : playingVoice === voice.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Checkbox 
                      checked={selectedVoice === voice.id}
                      onChange={() => {}}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
