
import { Scene, VideoConfig, SceneData } from './types.ts';

export async function createVideoWithExternalFFmpeg(scenes: Scene[], audioData: Uint8Array, title: string): Promise<Uint8Array> {
  console.log('🎬 Calling external FFmpeg service...');
  console.log('🎞️ Processing', scenes.length, 'scenes');
  
  const ffmpegServiceUrl = Deno.env.get('FFMPEG_SERVICE_URL');
  if (!ffmpegServiceUrl) {
    throw new Error('FFMPEG_SERVICE_URL environment variable not set');
  }

  console.log('🔗 FFmpeg service URL:', ffmpegServiceUrl);

  try {
    // Prepare scene data with proper timing information
    const sceneData = prepareSceneData(scenes);
    
    if (sceneData.length === 0) {
      throw new Error('No valid scenes with images found');
    }

    console.log(`📋 Prepared ${sceneData.length} scenes with timing data`);
    logSceneTimings(sceneData);

    // Create FormData with the exact structure expected by FFmpeg service
    const formData = createFormData(audioData, sceneData, title, scenes);

    console.log('🚀 Sending request to FFmpeg service...');
    
    // Log the request details for debugging
    console.log('📊 Request details:', {
      url: `${ffmpegServiceUrl}/create-video`,
      audioSize: audioData.length,
      scenesCount: sceneData.length,
      title: title
    });

    const response = await fetch(`${ffmpegServiceUrl}/create-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      await handleFFmpegError(response);
    }

    const videoBuffer = await response.arrayBuffer();
    console.log('✅ Video received from external FFmpeg service, size:', videoBuffer.byteLength, 'bytes');
    return new Uint8Array(videoBuffer);

  } catch (error) {
    console.error('❌ Error in external FFmpeg video creation:', error);
    throw error;
  }
}

function prepareSceneData(scenes: Scene[]): SceneData[] {
  const validScenes: SceneData[] = [];
  
  console.log('🔍 Preparing scene data from', scenes.length, 'scenes');
  
  for (const scene of scenes) {
    console.log(`Processing scene ${scene.scene_number}:`, {
      hasVideos: !!scene.content_scene_videos,
      videosCount: scene.content_scene_videos?.length || 0,
      startTime: scene.start_time_seconds,
      endTime: scene.end_time_seconds
    });

    const rawImageUrl = scene.content_scene_videos?.[0]?.video_url;
    
    if (!rawImageUrl) {
      console.warn(`⚠️ No image URL found for scene ${scene.scene_number}, skipping`);
      continue;
    }

    // Convert CloudFront URL to public Supabase storage URL if needed
    const imageUrl = convertToPublicStorageUrl(rawImageUrl);
    console.log(`🔄 URL conversion for scene ${scene.scene_number}:`, {
      original: rawImageUrl.substring(0, 100) + '...',
      converted: imageUrl.substring(0, 100) + '...',
      isConverted: rawImageUrl !== imageUrl
    });

    // Ensure timing values are valid numbers
    const startTime = Number(scene.start_time_seconds);
    const endTime = Number(scene.end_time_seconds);
    
    if (isNaN(startTime) || isNaN(endTime)) {
      console.warn(`⚠️ Invalid timing for scene ${scene.scene_number}: start=${scene.start_time_seconds}, end=${scene.end_time_seconds}, skipping`);
      continue;
    }

    if (startTime >= endTime) {
      console.warn(`⚠️ Invalid timing sequence for scene ${scene.scene_number}: start (${startTime}) >= end (${endTime}), skipping`);
      continue;
    }

    const duration = endTime - startTime;
    if (duration <= 0) {
      console.warn(`⚠️ Invalid duration for scene ${scene.scene_number}: ${duration}s, skipping`);
      continue;
    }

    const sceneData: SceneData = {
      imageUrl: imageUrl,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      sceneNumber: scene.scene_number,
      narrationText: scene.narration_text || ''
    };

    console.log(`✅ Valid scene data prepared:`, {
      sceneNumber: sceneData.sceneNumber,
      timing: `${sceneData.startTime}s - ${sceneData.endTime}s`,
      duration: `${sceneData.duration}s`,
      hasImageUrl: !!sceneData.imageUrl,
      hasNarration: !!sceneData.narrationText,
      imageUrl: sceneData.imageUrl.substring(0, 100) + '...'
    });

    validScenes.push(sceneData);
  }

  return validScenes.sort((a, b) => a.sceneNumber - b.sceneNumber);
}

function convertToPublicStorageUrl(originalUrl: string): string {
  // If it's already a Supabase storage URL, return as is
  if (originalUrl.includes('supabase.co/storage/v1/object/public/')) {
    return originalUrl;
  }
  
  // If it's a CloudFront URL with JWT, try to extract the file path and convert to public URL
  if (originalUrl.includes('cloudfront.net/') && originalUrl.includes('?_jwt=')) {
    try {
      // Extract the UUID filename from the CloudFront URL
      const urlParts = originalUrl.split('/');
      const filenamePart = urlParts[urlParts.length - 1];
      const filename = filenamePart.split('?')[0]; // Remove JWT query params
      
      // Construct public Supabase storage URL
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      if (supabaseUrl && filename.includes('.')) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/generated-videos/${filename}`;
        console.log(`🔄 Converted CloudFront URL to public storage URL:`, {
          from: originalUrl.substring(0, 100) + '...',
          to: publicUrl
        });
        return publicUrl;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to convert CloudFront URL, using original:`, error);
    }
  }
  
  return originalUrl;
}

function logSceneTimings(sceneData: SceneData[]): void {
  console.log('📋 Final scene timing summary:');
  sceneData.forEach((scene, index) => {
    console.log(`Scene ${index + 1} (${scene.sceneNumber}): ${scene.startTime}s - ${scene.endTime}s (${scene.duration}s)`);
  });
  
  const totalDuration = sceneData.length > 0 ? Math.max(...sceneData.map(s => s.endTime)) : 0;
  console.log(`🎬 Total video duration: ${totalDuration}s`);
}

function createFormData(audioData: Uint8Array, sceneData: SceneData[], title: string, scenes: Scene[]): FormData {
  const formData = new FormData();
  
  console.log('📦 Creating FormData with:', {
    audioSize: audioData.length,
    scenesCount: sceneData.length,
    title: title
  });
  
  // Add audio file with proper filename and type
  const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
  formData.append('audio', audioBlob, 'narration.mp3');
  console.log('🎵 Audio blob created and added:', {
    size: audioBlob.size,
    type: audioBlob.type
  });
  
  // Prepare scenes data with explicit image URLs
  const scenesForFFmpeg = sceneData.map((scene, index) => {
    console.log(`🖼️ Scene ${index + 1} final image URL:`, scene.imageUrl);
    return {
      imageUrl: scene.imageUrl,
      startTime: scene.startTime,
      endTime: scene.endTime,
      duration: scene.duration,
      sceneNumber: scene.sceneNumber
    };
  });
  
  const scenesJson = JSON.stringify(scenesForFFmpeg);
  formData.append('scenes', scenesJson);
  console.log('📋 Scenes JSON prepared for FFmpeg:', {
    length: scenesJson.length,
    preview: scenesJson.substring(0, 200) + '...',
    parsedCount: scenesForFFmpeg.length,
    firstSceneImageUrl: scenesForFFmpeg[0]?.imageUrl ? 'Present' : 'Missing'
  });
  
  // Calculate total duration from the last scene's end time
  const sortedScenes = scenes.sort((a, b) => a.scene_number - b.scene_number);
  const totalDuration = sortedScenes.length > 0 ? Number(sortedScenes[sortedScenes.length - 1].end_time_seconds) : 30;
  
  // Video configuration with proper settings
  const videoConfig: VideoConfig = {
    parallaxSpeed: 0.2,
    transitionDuration: 0.8,
    enableAudioSync: true,
    totalDuration: totalDuration,
    frameRate: 30
  };
  
  const configJson = JSON.stringify(videoConfig);
  formData.append('config', configJson);
  console.log('⚙️ Video config prepared:', {
    config: videoConfig,
    jsonLength: configJson.length
  });
  
  // Add title and metadata
  formData.append('title', title);
  formData.append('totalDuration', totalDuration.toString());
  
  console.log('📝 Metadata added:', {
    title: title,
    totalDuration: totalDuration
  });

  // Final validation before sending
  console.log('🔍 Final validation - FormData entries:');
  const entries = Array.from(formData.entries());
  entries.forEach(([key, value]) => {
    if (key === 'scenes') {
      const scenesData = JSON.parse(value as string);
      console.log(`✅ ${key}: ${scenesData.length} scenes with URLs:`, 
        scenesData.map((s: any, i: number) => `Scene ${i+1}: ${s.imageUrl ? 'Has URL' : 'Missing URL'}`).join(', ')
      );
    } else {
      console.log(`✅ ${key}: ${typeof value === 'object' && 'size' in value ? `${value.size} bytes` : value.toString().substring(0, 50)}`);
    }
  });

  return formData;
}

async function handleFFmpegError(response: Response): Promise<never> {
  let errorText = '';
  
  try {
    errorText = await response.text();
  } catch (e) {
    errorText = 'Unable to read error response';
  }
  
  console.error('❌ FFmpeg service error details:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: errorText
  });
  
  // Provide more specific error messaging based on status code
  if (response.status === 400) {
    throw new Error(`FFmpeg service bad request (400). The request data format is invalid. This could be due to missing or malformed scene data, audio data, or configuration. Server response: ${errorText}`);
  } else if (response.status === 403) {
    throw new Error(`FFmpeg service authentication failed (403). Please check if the Cloud Run service allows unauthenticated requests or configure proper authentication. Error: ${errorText}`);
  } else if (response.status === 503) {
    throw new Error(`FFmpeg service unavailable (503). This might be due to billing account not being linked to your Google Cloud project. Error: ${errorText}`);
  } else if (response.status === 500) {
    throw new Error(`FFmpeg service internal error (500). There was an error processing the video on the server side. Error: ${errorText}`);
  }
  
  throw new Error(`FFmpeg service failed with status ${response.status}: ${errorText}`);
}
