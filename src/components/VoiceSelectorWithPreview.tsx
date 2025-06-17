
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play, Pause } from "lucide-react";
import { useVoices } from "@/hooks/useVoices";
import { toast } from "@/hooks/use-toast";
import { useRef } from "react";

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleVoicePreview = (voiceId: string) => {
    // Stop any currently playing audio
    speechSynthesis.cancel();
    
    if (playingVoice === voiceId) {
      // If clicking the same voice that's playing, stop it
      onVoicePreview("");
      return;
    }

    // Find the voice data
    const voiceData = voices.find(v => v.id === voiceId);
    if (!voiceData) return;

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(voiceData.preview);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to match browser voice to our voice name/gender
    const availableVoices = speechSynthesis.getVoices();
    let matchedVoice = null;

    if (voiceData.gender === 'female') {
      matchedVoice = availableVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes(voiceData.name.toLowerCase())
      ) || availableVoices.find(v => v.name.includes('Samantha') || v.name.includes('Alex'));
    } else {
      matchedVoice = availableVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes(voiceData.name.toLowerCase())
      ) || availableVoices.find(v => v.name.includes('Daniel') || v.name.includes('Tom'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set up event listeners
    utterance.onstart = () => {
      onVoicePreview(voiceId);
    };

    utterance.onend = () => {
      onVoicePreview("");
    };

    utterance.onerror = () => {
      onVoicePreview("");
      toast({
        title: "Voice Preview Error",
        description: "Unable to play voice preview. Please try again.",
        variant: "destructive",
      });
    };

    // Store reference and speak
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);

    toast({
      title: "Voice Preview",
      description: `Playing ${voiceData.name} voice sample...`,
    });
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
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {playingVoice === voice.id ? (
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
