
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentItemWithScenes = (contentItemId: string | null) => {
  return useQuery({
    queryKey: ['content-item-with-scenes', contentItemId],
    queryFn: async () => {
      if (!contentItemId) return null;

      console.log('Fetching content item with scenes:', contentItemId);

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
        console.error('Error fetching content item:', error);
        throw error;
      }

      console.log('Fetched content item with scenes:', data);
      return data;
    },
    enabled: !!contentItemId,
    refetchInterval: 5000, // Refetch every 5 seconds to get video updates
  });
};
