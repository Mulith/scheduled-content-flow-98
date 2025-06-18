
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentItemWithScenes = (contentItemId: string | null) => {
  return useQuery({
    queryKey: ['content-item-with-scenes', contentItemId],
    queryFn: async () => {
      if (!contentItemId) return null;

      console.log('🔍 Fetching content item with scenes:', contentItemId);

      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          content_scenes!inner(
            *,
            content_scene_videos(*)
          )
        `)
        .eq('id', contentItemId)
        .single();

      if (error) {
        console.error('❌ Error fetching content item:', error);
        throw error;
      }

      console.log('✅ Fetched content item with scenes:', {
        id: data.id,
        title: data.title,
        video_status: data.video_status,
        generation_stage: data.generation_stage,
        scenes: data.content_scenes?.map(scene => ({
          scene_number: scene.scene_number,
          videos_count: scene.content_scene_videos?.length || 0,
          videos: scene.content_scene_videos?.map(v => ({
            id: v.id,
            video_status: v.video_status,
            has_url: !!v.video_url,
            error: v.error_message
          }))
        }))
      });

      return data;
    },
    enabled: !!contentItemId,
    refetchInterval: 3000, // Refetch every 3 seconds to get video updates
    staleTime: 1000, // Consider data stale after 1 second
  });
};
