import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useVideoShortCreation = () => {
  const queryClient = useQueryClient();

  const createVideoShort = useMutation({
    mutationFn: async ({ contentItemId, voiceId }: { contentItemId: string, voiceId?: string }) => {
      console.log('🎬 Starting video short creation for content item:', contentItemId);
      
      const { data, error } = await supabase.functions.invoke('create-video-short', {
        body: { contentItemId, voiceId }
      });
      
      if (error) {
        console.error('❌ Video creation edge function error:', error);
        throw new Error(`Video creation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log('✅ Video creation edge function response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Video short created successfully:', data);
      toast({
        title: "Video Short Created! 🎬",
        description: `Successfully created video short "${data?.title}" with narration. Ready for YouTube Shorts!`,
      });
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-item-with-scenes'] });
    },
    onError: (error: Error) => {
      console.error('💥 Error creating video short:', error);
      toast({
        title: "Video Creation Failed",
        description: error.message || "Failed to create video short with narration",
        variant: "destructive",
      });
    },
  });

  return {
    createVideoShort,
    isCreating: createVideoShort.isPending,
  };
};