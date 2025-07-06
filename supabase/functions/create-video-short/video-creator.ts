
interface Scene {
  scene_number: number;
  start_time_seconds: number;
  end_time_seconds: number;
  narration_text: string;
  visual_description: string;
  content_scene_videos?: {
    video_url: string;
    video_status: string;
  }[];
}

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
    const sceneData = scenes.map(scene => {
      const imageUrl = scene.content_scene_videos?.[0]?.video_url;
      
      if (!imageUrl) {
        console.warn(`⚠️ No image URL found for scene ${scene.scene_number}`);
        return null;
      }

      return {
        imageUrl: imageUrl,
        startTime: scene.start_time_seconds,
        endTime: scene.end_time_seconds,
        duration: scene.end_time_seconds - scene.start_time_seconds,
        sceneNumber: scene.scene_number,
        narrationText: scene.narration_text
      };
    }).filter(scene => scene !== null);

    if (sceneData.length === 0) {
      throw new Error('No valid scenes with images found');
    }

    console.log(`📋 Prepared ${sceneData.length} scenes with timing data`);
    sceneData.forEach((scene, index) => {
      console.log(`Scene ${index + 1}: ${scene.startTime}s - ${scene.endTime}s (${scene.duration}s)`);
      console.log(`Image URL: ${scene.imageUrl}`);
    });

    // Create FormData with enhanced parameters
    const formData = new FormData();
    
    // Add audio file - make sure it's properly formatted
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    formData.append('audio', audioBlob, 'audio.mp3');
    console.log('🎵 Audio added to form data, size:', audioData.length, 'bytes');
    
    // Add scene data with timing information
    formData.append('scenes', JSON.stringify(sceneData));
    console.log('📋 Added scene timing data:', JSON.stringify(sceneData, null, 2));
    
    // Add video configuration
    const videoConfig = {
      parallaxSpeed: 0.3, // Slower parallax effect (was likely 1.0 or higher)
      transitionDuration: 0.5, // Smooth transitions between scenes
      enableAudioSync: true, // Ensure audio synchronization
      totalDuration: scenes[scenes.length - 1]?.end_time_seconds || 30,
      frameRate: 30 // Standard frame rate for smooth playback
    };
    
    formData.append('config', JSON.stringify(videoConfig));
    console.log('⚙️ Added video configuration:', videoConfig);
    
    // Add metadata
    formData.append('title', title);
    console.log('📝 Metadata added to form data');

    // Log all form data keys for debugging
    const formDataEntries = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'audio') {
        formDataEntries.push(`${key}: [Blob ${(value as Blob).size} bytes]`);
      } else {
        formDataEntries.push(`${key}: ${typeof value === 'string' ? value.substring(0, 100) + '...' : value}`);
      }
    }
    console.log('📋 FormData entries being sent:', formDataEntries);

    console.log('🚀 Sending request to FFmpeg service...');
    const response = await fetch(`${ffmpegServiceUrl}/create-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
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

    const videoBuffer = await response.arrayBuffer();
    console.log('✅ Video received from external FFmpeg service, size:', videoBuffer.byteLength, 'bytes');
    return new Uint8Array(videoBuffer);

  } catch (error) {
    console.error('❌ Error in external FFmpeg video creation:', error);
    throw error;
  }
}
