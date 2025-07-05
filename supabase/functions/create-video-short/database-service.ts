
import { ContentItem } from './types.ts';

export async function fetchContentItemWithScenes(supabase: any, contentItemId: string): Promise<ContentItem> {
  console.log('🔍 Fetching content item from database...');
  
  const { data: contentItem, error } = await supabase
    .from('content_items')
    .select(`
      *,
      content_scenes!inner(
        *,
        content_scene_videos(*)
      )
    `)
    .eq('id', contentItemId)
    .order('scene_number', { foreignTable: 'content_scenes', ascending: true })
    .single() as { data: ContentItem | null, error: any };

  console.log('📊 Database query result:', {
    hasData: !!contentItem,
    error: error?.message,
    contentItemTitle: contentItem?.title,
    scenesCount: contentItem?.content_scenes?.length || 0
  });

  if (error || !contentItem) {
    throw new Error(`Failed to fetch content item: ${error?.message || 'Not found'}`);
  }

  console.log('📄 Retrieved content item:', {
    title: contentItem.title,
    scenesCount: contentItem.content_scenes?.length || 0
  });

  return contentItem;
}

export async function updateContentItemWithVideo(supabase: any, contentItemId: string, storagePath: string): Promise<void> {
  await supabase
    .from('content_items')
    .update({
      video_status: 'completed',
      video_file_path: storagePath,
      updated_at: new Date().toISOString()
    })
    .eq('id', contentItemId);
}
