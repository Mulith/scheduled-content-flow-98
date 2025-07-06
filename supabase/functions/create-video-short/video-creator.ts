
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
    // Prepare image URLs and durations arrays as expected by the API
    const imageUrls: string[] = [];
    const durations: number[] = [];
    
    scenes.forEach(scene => {
      const imageUrl = scene.content_scene_videos?.[0]?.video_url;
      
      if (!imageUrl) {
        console.warn(`⚠️ No image URL found for scene ${scene.scene_number}`);
        return;
      }

      imageUrls.push(imageUrl);
      durations.push(scene.end_time_seconds - scene.start_time_seconds);
      
      console.log(`Scene ${scene.scene_number}: ${imageUrl} (${scene.end_time_seconds - scene.start_time_seconds}s)`);
    });

    if (imageUrls.length === 0) {
      throw new Error('No valid scenes with images found');
    }

    console.log(`📋 Prepared ${imageUrls.length} image URLs and durations`);
    console.log('🖼️ Image URLs:', imageUrls);
    console.log('⏱️ Durations:', durations);

    // Create FormData with the correct structure expected by multer
    const formData = new FormData();
    
    // Add audio file with the correct field name for multer
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    formData.append('audioFile', audioBlob, 'audio.mp3');
    console.log('🎵 Audio file added to form data, size:', audioData.length, 'bytes');
    
    // Add parameters as individual form fields (not JSON strings)
    // The FFmpeg service parses these from req.body after multer processes the form
    imageUrls.forEach((url, index) => {
      formData.append(`imageUrls[${index}]`, url);
    });
    
    durations.forEach((duration, index) => {
      formData.append(`durations[${index}]`, duration.toString());
    });
    
    // Add optional configuration parameters as form fields
    formData.append('transition', 'fade');
    formData.append('fps', '30');
    formData.append('resolution', '1080x1920'); // Vertical video for YouTube Shorts
    
    console.log('⚙️ Added all parameters as form fields');

    // Log all form data entries for debugging
    const formDataEntries = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'audioFile') {
        formDataEntries.push(`${key}: [Blob ${(value as Blob).size} bytes]`);
      } else {
        formDataEntries.push(`${key}: ${value}`);
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
