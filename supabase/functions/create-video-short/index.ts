
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

import { generateVoiceNarration } from './voice-service.ts';
import { createVideoWithExternalFFmpeg } from './video-processor.ts';
import { uploadVideoToStorage } from './storage-service.ts';
import { fetchContentItemWithScenes, updateContentItemWithVideo } from './database-service.ts';
import { validateEnvironmentVariables, validateContentItem, getVoiceId } from './validation-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🎬 Video creation function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Parsing request body...');
    const requestBody = await req.json();
    console.log('📥 Request body:', requestBody);
    
    const { contentItemId, voiceId = 'Aria' } = requestBody;

    if (!contentItemId) {
      throw new Error('Content item ID is required');
    }

    console.log('🎥 Starting video creation for content item:', contentItemId);

    // Validate environment variables
    validateEnvironmentVariables();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch content item with scenes and generated images
    const contentItem = await fetchContentItemWithScenes(supabase, contentItemId);

    // Validate content item has required data
    validateContentItem(contentItem);

    // Get scenes with images
    const scenesWithImages = contentItem.content_scenes.filter(scene => 
      scene.content_scene_videos?.some(video => 
        video.video_status === 'completed' && video.video_url
      )
    );

    // Generate voice narration from the script
    const elevenlabsVoiceId = getVoiceId(voiceId);
    const audioData = await generateVoiceNarration(contentItem.script, elevenlabsVoiceId);

    // Sort scenes by scene number to ensure proper order
    const sortedScenes = scenesWithImages.sort((a, b) => a.scene_number - b.scene_number);
    
    // Create video using external FFmpeg service with proper timing
    const videoData = await createVideoWithExternalFFmpeg(sortedScenes, audioData, contentItem.title);

    // Upload video to Supabase storage
    const fileName = `${contentItemId}-${Date.now()}.mp4`;
    const storagePath = await uploadVideoToStorage(supabase, videoData, fileName);

    // Update content item with video file path
    await updateContentItemWithVideo(supabase, contentItemId, storagePath);

    console.log('🎉 Video creation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        videoPath: storagePath,
        contentItemId: contentItemId,
        scenesProcessed: scenesWithImages.length,
        title: contentItem.title,
        totalDuration: sortedScenes[sortedScenes.length - 1]?.end_time_seconds || 30
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Video creation error:', error);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        details: error.stack || 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
