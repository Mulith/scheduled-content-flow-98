
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play, Pause } from "lucide-react";
import { useVoices } from "@/hooks/useVoices";
import { toast } from "@/hooks/use-toast";

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

  const handleVoicePreview = (voiceId: string) => {
    onVoicePreview(voiceId);
    
    // Simulate voice preview (replace with actual TTS API call)
    const utterance = new SpeechSynthesisUtterance("This is a sample of how your content will sound with this voice.");
    const voice = speechSynthesis.getVoices().find(v => v.name.includes(voiceId)) || speechSynthesis.getVoices()[0];
    if (voice) utterance.voice = voice;
    
    speechSynthesis.speak(utterance);

    toast({
      title: "Voice Preview",
      description: "Playing voice sample...",
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
