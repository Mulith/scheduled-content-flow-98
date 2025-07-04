import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Scene {
  scene_number: number;
  narration_text: string;
  visual_description: string;
  content_scene_videos?: {
    video_url: string;
    video_status: string;
  }[];
}

interface ContentItem {
  id: string;
  title: string;
  script: string;
  content_scenes: Scene[];
}

async function generateVoiceNarration(text: string, voiceId: string): Promise<string> {
  console.log('🎙️ Generating voice narration with ElevenLabs...');
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.5,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  
  console.log('✅ Voice narration generated successfully');
  return base64Audio;
}

async function createVideoWithRunwayML(scenes: Scene[], audioBase64: string, title: string): Promise<string> {
  console.log('🎬 Creating video with Runway ML...');
  
  // For now, we'll use a placeholder implementation
  // In production, you would integrate with RunwayML's video generation API
  // or use FFmpeg to combine images, audio, and effects
  
  const imageUrls = scenes
    .map(scene => scene.content_scene_videos?.[0]?.video_url)
    .filter(url => url) as string[];

  if (imageUrls.length === 0) {
    throw new Error('No generated images found for video creation');
  }

  console.log('📝 Video creation request:', {
    imageCount: imageUrls.length,
    title: title,
    hasAudio: !!audioBase64
  });

  // This is a placeholder - in production you would:
  // 1. Download the images from URLs
  // 2. Create parallax effects using FFmpeg or video API
  // 3. Add audio narration
  // 4. Add text overlays
  // 5. Export as MP4 in 9:16 aspect ratio for YouTube Shorts
  
  // For now, return a mock video URL
  const mockVideoUrl = `https://example.com/generated-video-${Date.now()}.mp4`;
  
  console.log('✅ Video created successfully (mock):', mockVideoUrl);
  return mockVideoUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentItemId, voiceId = 'Aria' } = await req.json();

    if (!contentItemId) {
      throw new Error('Content item ID is required');
    }

    console.log('🎥 Starting video creation for content item:', contentItemId);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch content item with scenes and generated images
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
      .single() as { data: ContentItem | null, error: any };

    if (error || !contentItem) {
      throw new Error(`Failed to fetch content item: ${error?.message || 'Not found'}`);
    }

    console.log('📄 Retrieved content item:', {
      title: contentItem.title,
      scenesCount: contentItem.content_scenes?.length || 0
    });

    // Check if we have generated images for all scenes
    const scenesWithImages = contentItem.content_scenes.filter(scene => 
      scene.content_scene_videos?.some(video => 
        video.video_status === 'completed' && video.video_url
      )
    );

    if (scenesWithImages.length === 0) {
      throw new Error('No generated images found. Please generate scene images first.');
    }

    console.log(`🖼️ Found ${scenesWithImages.length} scenes with generated images`);

    // Generate voice narration from the script
    const voiceIdMap: { [key: string]: string } = {
      'Aria': '9BWtsMINqrJLrRacOk9x',
      'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Laura': 'FGY2WhTYpPnrIDTdsKH5',
      'Charlie': 'IKne3meq5aSn9XLyUdCD'
    };

    const elevenlabsVoiceId = voiceIdMap[voiceId] || voiceIdMap['Aria'];
    const audioBase64 = await generateVoiceNarration(contentItem.script, elevenlabsVoiceId);

    // Create video with parallax effects, narration, and text overlays
    const videoUrl = await createVideoWithRunwayML(scenesWithImages, audioBase64, contentItem.title);

    // Update content item with video URL
    await supabase
      .from('content_items')
      .update({
        video_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    console.log('🎉 Video creation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: videoUrl,
        contentItemId: contentItemId,
        scenesProcessed: scenesWithImages.length,
        title: contentItem.title
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Video creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});