
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChannelCreation } from "./ChannelCreation";

interface ChannelCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isCreating: boolean;
  connectedYouTubeChannels: any[];
  playingVoice: string | null;
  onVoicePreview: (voiceId: string) => void;
}

export const ChannelCreationDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isCreating,
  connectedYouTubeChannels,
  playingVoice,
  onVoicePreview
}: ChannelCreationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Content Channel</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new channel with its own video styles, voice, and topic configuration
          </DialogDescription>
        </DialogHeader>
        
        <ChannelCreation 
          isDialog={true}
          onClose={() => onOpenChange(false)}
          onSubmit={onSubmit}
          isCreating={isCreating}
          playingVoice={playingVoice}
          onVoicePreview={onVoicePreview}
        />
      </DialogContent>
    </Dialog>
  );
};
