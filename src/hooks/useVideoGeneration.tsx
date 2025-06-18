
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useVideoGeneration = () => {
  const queryClient = useQueryClient();

  const generateVideos = useMutation({
    mutationFn: async (contentItemId: string) => {
      console.log('🎬 Starting video generation for content item:', contentItemId);
      
      const { data, error } = await supabase.functions.invoke('generate-scene-videos', {
        body: { contentItemId }
      });
      
      if (error) {
        console.error('❌ Video generation edge function error:', error);
        throw new Error(`Video generation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log('✅ Video generation edge function response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Video generation initiated successfully:', data);
      toast({
        title: "Video Generation Started",
        description: `Processing ${data?.scenesProcessed || 0} scenes. Check the storyboard for progress.`,
      });
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-item-with-scenes'] });
    },
    onError: (error: Error) => {
      console.error('💥 Error generating videos:', error);
      toast({
        title: "Video Generation Failed",
        description: error.message || "Failed to start video generation",
        variant: "destructive",
      });
    },
  });

  return {
    generateVideos,
    isGenerating: generateVideos.isPending,
  };
};
