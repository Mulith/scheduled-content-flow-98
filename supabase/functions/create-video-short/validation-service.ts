
import { ContentItem } from './types.ts';

export function validateEnvironmentVariables(): void {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY');
  const ffmpegServiceUrl = Deno.env.get('FFMPEG_SERVICE_URL');
  
  console.log('🔑 Environment check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    hasElevenlabsKey: !!elevenlabsKey,
    hasFFmpegServiceUrl: !!ffmpegServiceUrl,
    ffmpegServiceUrl: ffmpegServiceUrl
  });

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  if (!elevenlabsKey) {
    throw new Error('Missing ElevenLabs API key');
  }

  if (!ffmpegServiceUrl) {
    throw new Error('Missing FFmpeg service URL');
  }
}

export function validateContentItem(contentItem: ContentItem): void {
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

  // Log detailed scene timing information
  scenesWithImages.forEach((scene, index) => {
    console.log(`Scene ${index + 1}:`, {
      scene_number: scene.scene_number,
      timing: `${scene.start_time_seconds}s - ${scene.end_time_seconds}s`,
      duration: scene.end_time_seconds - scene.start_time_seconds,
      has_video: !!scene.content_scene_videos?.[0]?.video_url,
      narration_preview: scene.narration_text.substring(0, 50) + '...'
    });
  });
}

export function getVoiceId(voiceId: string): string {
  const voiceIdMap: { [key: string]: string } = {
    'Aria': '9BWtsMINqrJLrRacOk9x',
    'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
    'Sarah': 'EXAVITQu4vr4xnSDxMaL',
    'Laura': 'FGY2WhTYpPnrIDTdsKH5',
    'Charlie': 'IKne3meq5aSn9XLyUdCD'
  };

  const elevenlabsVoiceId = voiceIdMap[voiceId] || voiceIdMap['Aria'];
  console.log('🎤 Using ElevenLabs voice ID:', elevenlabsVoiceId);
  return elevenlabsVoiceId;
}
