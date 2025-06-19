
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useVideoGeneration = () => {
  const queryClient = useQueryClient();

  const generateVideos = useMutation({
    mutationFn: async (contentItemId: string) => {
      console.log('🎬 Starting content generation for content item:', contentItemId);
      
      const { data, error } = await supabase.functions.invoke('generate-scene-videos', {
        body: { contentItemId }
      });
      
      if (error) {
        console.error('❌ Content generation edge function error:', error);
        throw new Error(`Content generation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log('✅ Content generation edge function response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Content generation initiated successfully:', data);
      const contentType = data?.generationType === 'video' ? 'videos' : 'images';
      toast({
        title: "Content Generation Started",
        description: `Processing ${data?.scenesProcessed || 0} scenes to create ${contentType}. Check the storyboard for progress.`,
      });
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-item-with-scenes'] });
    },
    onError: (error: Error) => {
      console.error('💥 Error generating content:', error);
      toast({
        title: "Content Generation Failed",
        description: error.message || "Failed to start content generation",
        variant: "destructive",
      });
    },
  });

  return {
    generateVideos,
    isGenerating: generateVideos.isPending,
  };
};
