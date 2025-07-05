
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

  // Validate FFmpeg service URL format
  try {
    new URL(ffmpegServiceUrl);
  } catch (e) {
    throw new Error(`Invalid FFmpeg service URL format: ${ffmpegServiceUrl}`);
  }
}

export function validateContentItem(contentItem: ContentItem): void {
  console.log('🔍 Validating content item:', {
    id: contentItem.id,
    title: contentItem.title,
    hasScript: !!contentItem.script,
    scriptLength: contentItem.script?.length || 0,
    scenesCount: contentItem.content_scenes?.length || 0
  });
  
  if (!contentItem.content_scenes || contentItem.content_scenes.length === 0) {
    throw new Error('No scenes found for this content item. Please generate scene breakdown first.');
  }

  // Check if we have generated images for all scenes
  const scenesWithImages = contentItem.content_scenes.filter(scene => {
    const hasVideo = scene.content_scene_videos?.some(video => 
      video.video_status === 'completed' && video.video_url
    );
    
    if (!hasVideo) {
      console.log(`Scene ${scene.scene_number} missing video:`, {
        hasVideos: !!scene.content_scene_videos,
        videosCount: scene.content_scene_videos?.length || 0,
        videoStatuses: scene.content_scene_videos?.map(v => v.video_status) || []
      });
    }
    
    return hasVideo;
  });

  if (scenesWithImages.length === 0) {
    throw new Error('No generated images found. Please generate scene images first by clicking "Generate Images" in the storyboard tab.');
  }

  console.log(`🖼️ Found ${scenesWithImages.length} scenes with generated images out of ${contentItem.content_scenes.length} total scenes`);

  // Validate scene timing information
  const timingErrors: string[] = [];
  
  for (const scene of scenesWithImages) {
    const startTime = Number(scene.start_time_seconds);
    const endTime = Number(scene.end_time_seconds);
    
    // Check for valid numbers
    if (isNaN(startTime) || isNaN(endTime)) {
      timingErrors.push(`Scene ${scene.scene_number}: Invalid timing data (start=${scene.start_time_seconds}, end=${scene.end_time_seconds})`);
      continue;
    }
    
    // Check timing logic
    if (startTime >= endTime) {
      timingErrors.push(`Scene ${scene.scene_number}: Start time (${startTime}s) must be less than end time (${endTime}s)`);
    }
    
    // Check for negative times
    if (startTime < 0 || endTime < 0) {
      timingErrors.push(`Scene ${scene.scene_number}: Times cannot be negative (start=${startTime}s, end=${endTime}s)`);
    }
    
    // Check for reasonable duration (between 0.1s and 60s per scene)
    const duration = endTime - startTime;
    if (duration < 0.1) {
      timingErrors.push(`Scene ${scene.scene_number}: Duration too short (${duration}s), minimum 0.1s required`);
    } else if (duration > 60) {
      timingErrors.push(`Scene ${scene.scene_number}: Duration too long (${duration}s), maximum 60s allowed`);
    }
  }
  
  if (timingErrors.length > 0) {
    console.error('❌ Scene timing validation errors:', timingErrors);
    throw new Error(`Scene timing validation failed:\n${timingErrors.join('\n')}`);
  }

  // Validate scene content
  const contentErrors: string[] = [];
  
  for (const scene of scenesWithImages) {
    if (!scene.narration_text || scene.narration_text.trim().length === 0) {
      contentErrors.push(`Scene ${scene.scene_number}: Missing narration text`);
    }
    
    if (!scene.visual_description || scene.visual_description.trim().length === 0) {
      contentErrors.push(`Scene ${scene.scene_number}: Missing visual description`);
    }
    
    // Check for valid image URLs
    const imageUrl = scene.content_scene_videos?.[0]?.video_url;
    if (!imageUrl || !isValidUrl(imageUrl)) {
      contentErrors.push(`Scene ${scene.scene_number}: Invalid or missing image URL`);
    }
  }
  
  if (contentErrors.length > 0) {
    console.warn('⚠️ Scene content validation warnings:', contentErrors);
    // Don't throw for content warnings, just log them
  }

  // Log detailed scene information for debugging
  scenesWithImages.forEach((scene, index) => {
    console.log(`Scene ${index + 1} validation:`, {
      scene_number: scene.scene_number,
      timing: `${scene.start_time_seconds}s - ${scene.end_time_seconds}s`,
      duration: Number(scene.end_time_seconds) - Number(scene.start_time_seconds),
      has_video: !!scene.content_scene_videos?.[0]?.video_url,
      video_status: scene.content_scene_videos?.[0]?.video_status,
      narration_length: scene.narration_text?.length || 0,
      visual_description_length: scene.visual_description?.length || 0
    });
  });
  
  console.log('✅ Content item validation completed successfully');
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
  console.log('🎤 Using ElevenLabs voice ID:', elevenlabsVoiceId, 'for voice:', voiceId);
  return elevenlabsVoiceId;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
