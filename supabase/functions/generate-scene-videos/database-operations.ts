
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export class DatabaseOperations {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async getContentItem(contentItemId: string) {
    const { data: contentItem, error: contentError } = await this.supabase
      .from('content_items')
      .select('*')
      .eq('id', contentItemId)
      .single();

    if (contentError) {
      console.error('Error fetching content item:', contentError);
      throw new Error(`Error fetching content item: ${contentError.message}`);
    }

    return contentItem;
  }

  async updateContentItemStatus(contentItemId: string, updates: any) {
    const { error: updateError } = await this.supabase
      .from('content_items')
      .update({
        ...updates,
        updated_by_system: new Date().toISOString()
      })
      .eq('id', contentItemId);

    if (updateError) {
      console.error('Error updating content item status:', updateError);
    }
  }

  async getScenes(contentItemId: string) {
    const { data: scenes, error: scenesError } = await this.supabase
      .from('content_scenes')
      .select('*')
      .eq('content_item_id', contentItemId)
      .order('scene_number');

    if (scenesError) {
      console.error('Error fetching scenes:', scenesError);
      throw new Error(`Error fetching scenes: ${scenesError.message}`);
    }

    if (!scenes || scenes.length === 0) {
      throw new Error('No scenes found for content item');
    }

    return scenes;
  }

  async getOrCreateSceneVideo(sceneId: string) {
    const { data: existingVideo } = await this.supabase
      .from('content_scene_videos')
      .select('*')
      .eq('scene_id', sceneId)
      .single();

    let sceneVideoId = existingVideo?.id;

    if (!existingVideo) {
      const { data: sceneVideo, error: insertError } = await this.supabase
        .from('content_scene_videos')
        .insert({
          scene_id: sceneId,
          video_status: 'generating',
          generation_request_id: `scene_${sceneId}_${Date.now()}`
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Error creating scene video record: ${insertError.message}`);
      }

      sceneVideoId = sceneVideo.id;
    } else {
      if (existingVideo.video_status !== 'completed') {
        await this.supabase
          .from('content_scene_videos')
          .update({
            video_status: 'generating',
            error_message: null
          })
          .eq('id', sceneVideoId);
      }
    }

    return sceneVideoId;
  }

  async updateSceneVideo(sceneVideoId: string, updates: any) {
    const { error: updateVideoError } = await this.supabase
      .from('content_scene_videos')
      .update({
        ...updates,
        completed_at: new Date().toISOString()
      })
      .eq('id', sceneVideoId);

    if (updateVideoError) {
      throw new Error(`Error updating scene video: ${updateVideoError.message}`);
    }
  }

  async getSceneVideosStatus(sceneIds: string[]) {
    const { data: sceneVideos } = await this.supabase
      .from('content_scene_videos')
      .select('video_status')
      .in('scene_id', sceneIds);

    return sceneVideos;
  }
}
