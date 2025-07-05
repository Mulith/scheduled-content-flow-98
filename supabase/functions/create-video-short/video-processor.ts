
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

    // Create FormData with enhanced parameters
    const formData = createFormData(audioData, sceneData, title, scenes);

    console.log('🚀 Sending request to FFmpeg service...');
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
  
  for (const scene of scenes) {
    const imageUrl = scene.content_scene_videos?.[0]?.video_url;
    
    if (!imageUrl) {
      console.warn(`⚠️ No image URL found for scene ${scene.scene_number}, skipping`);
      continue;
    }

    // Ensure timing values are numbers, not strings
    const startTime = Number(scene.start_time_seconds);
    const endTime = Number(scene.end_time_seconds);
    
    if (isNaN(startTime) || isNaN(endTime)) {
      console.warn(`⚠️ Invalid timing for scene ${scene.scene_number}, skipping`);
      continue;
    }

    validScenes.push({
      imageUrl: imageUrl,
      startTime: startTime,
      endTime: endTime,
      duration: endTime - startTime,
      sceneNumber: scene.scene_number,
      narrationText: scene.narration_text || ''
    });
  }

  return validScenes.sort((a, b) => a.sceneNumber - b.sceneNumber);
}

function logSceneTimings(sceneData: SceneData[]): void {
  sceneData.forEach((scene, index) => {
    console.log(`Scene ${index + 1} (${scene.sceneNumber}): ${scene.startTime}s - ${scene.endTime}s (${scene.duration}s)`);
  });
}

function createFormData(audioData: Uint8Array, sceneData: SceneData[], title: string, scenes: Scene[]): FormData {
  const formData = new FormData();
  
  // Add audio file
  formData.append('audio', new Blob([audioData], { type: 'audio/mpeg' }), 'audio.mp3');
  console.log('🎵 Audio added to form data, size:', audioData.length, 'bytes');
  
  // Add scene data with timing information - ensure it's properly serialized
  const scenesJson = JSON.stringify(sceneData);
  formData.append('scenes', scenesJson);
  console.log('📋 Added scene timing data:', scenesJson.substring(0, 200) + '...');
  
  // Calculate total duration properly
  const sortedScenes = scenes.sort((a, b) => a.scene_number - b.scene_number);
  const totalDuration = sortedScenes.length > 0 ? Number(sortedScenes[sortedScenes.length - 1].end_time_seconds) : 30;
  
  // Add video configuration
  const videoConfig: VideoConfig = {
    parallaxSpeed: 0.3, // Slower parallax effect
    transitionDuration: 0.5, // Smooth transitions between scenes
    enableAudioSync: true, // Ensure audio synchronization
    totalDuration: totalDuration,
    frameRate: 30 // Standard frame rate for smooth playback
  };
  
  const configJson = JSON.stringify(videoConfig);
  formData.append('config', configJson);
  console.log('⚙️ Added video configuration:', configJson);
  
  // Add metadata
  formData.append('title', title);
  console.log('📝 Metadata added to form data');

  // Log all form data keys for debugging
  const formDataKeys = Array.from(formData.keys());
  console.log('📋 FormData keys being sent:', formDataKeys);

  return formData;
}

async function handleFFmpegError(response: Response): Promise<never> {
  const errorText = await response.text();
  console.error('❌ FFmpeg service error response:', errorText);
  console.error('❌ Response status:', response.status);
  console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
  
  // Provide more specific error messaging
  if (response.status === 403) {
    throw new Error(`FFmpeg service authentication failed (403). Please check if the Cloud Run service allows unauthenticated requests or configure proper authentication. Error: ${errorText}`);
  } else if (response.status === 503) {
    throw new Error(`FFmpeg service unavailable (503). This might be due to billing account not being linked to your Google Cloud project. Error: ${errorText}`);
  } else if (response.status === 400) {
    throw new Error(`FFmpeg service bad request (400). Check if all required parameters are being sent correctly. Error: ${errorText}`);
  }
  
  throw new Error(`FFmpeg service failed: ${response.status} - ${errorText}`);
}
