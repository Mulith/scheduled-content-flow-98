
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

async function generateVoiceNarration(text: string, voiceId: string): Promise<Uint8Array> {
  console.log('🎙️ Generating voice narration with ElevenLabs...');
  console.log('🎙️ Voice ID:', voiceId);
  console.log('🎙️ Text length:', text.length);
  
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found');
  }
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
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
  console.log('✅ Voice narration generated successfully');
  return new Uint8Array(audioBuffer);
}

async function downloadImage(url: string): Promise<Uint8Array> {
  console.log('📥 Downloading image:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  console.log('✅ Image downloaded, size:', buffer.byteLength);
  return new Uint8Array(buffer);
}

async function createVideoWithFFmpeg(scenes: Scene[], audioData: Uint8Array, title: string): Promise<Uint8Array> {
  console.log('🎬 Creating video with FFmpeg...');
  console.log('🎞️ Processing', scenes.length, 'scenes');
  
  // Create temporary directory for processing
  const tempDir = await Deno.makeTempDir({ prefix: 'video_creation_' });
  console.log('📁 Created temp directory:', tempDir);
  
  try {
    // Save audio file
    const audioPath = `${tempDir}/narration.mp3`;
    await Deno.writeFile(audioPath, audioData);
    console.log('🎵 Audio saved to:', audioPath);

    // Download and save all scene images
    const imagePaths: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imageUrl = scene.content_scene_videos?.[0]?.video_url;
      
      if (imageUrl) {
        console.log(`📸 Processing scene ${i + 1}/${scenes.length}`);
        const imageData = await downloadImage(imageUrl);
        const imagePath = `${tempDir}/scene_${i.toString().padStart(3, '0')}.jpg`;
        await Deno.writeFile(imagePath, imageData);
        imagePaths.push(imagePath);
        console.log(`✅ Scene ${i + 1} image saved`);
      }
    }

    if (imagePaths.length === 0) {
      throw new Error('No images found to create video');
    }

    // Create video using FFmpeg
    const outputPath = `${tempDir}/output.mp4`;
    console.log('🎬 Starting FFmpeg video creation...');

    // Calculate duration per image (distribute evenly across scenes)
    const totalDuration = Math.max(60, scenes.length * 8); // Minimum 60 seconds, or 8 seconds per scene
    const durationPerImage = totalDuration / imagePaths.length;

    // Create a text file listing all images with durations
    const imageListPath = `${tempDir}/images.txt`;
    const imageListContent = imagePaths
      .map(path => `file '${path}'\nduration ${durationPerImage}`)
      .join('\n') + '\n' + `file '${imagePaths[imagePaths.length - 1]}'`; // Repeat last image
    
    await Deno.writeTextFile(imageListPath, imageListContent);

    // FFmpeg command to create video from images and audio
    const ffmpegArgs = [
      '-f', 'concat',
      '-safe', '0',
      '-i', imageListPath,
      '-i', audioPath,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-pix_fmt', 'yuv420p',
      '-r', '1', // 1 frame per second for slideshow effect
      '-shortest', // End when shortest input ends
      '-y', // Overwrite output file
      outputPath
    ];

    console.log('🚀 Running FFmpeg with args:', ffmpegArgs.join(' '));

    const ffmpegProcess = new Deno.Command('ffmpeg', {
      args: ffmpegArgs,
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await ffmpegProcess.output();
    
    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);
    
    console.log('📊 FFmpeg stdout:', stdoutText);
    console.log('📊 FFmpeg stderr:', stderrText);

    if (code !== 0) {
      throw new Error(`FFmpeg failed with code ${code}: ${stderrText}`);
    }

    // Read the generated video file
    const videoData = await Deno.readFile(outputPath);
    console.log('✅ Video created successfully, size:', videoData.length, 'bytes');

    return videoData;

  } catch (error) {
    console.error('❌ Error in video creation:', error);
    throw error;
  } finally {
    // Clean up temporary directory
    try {
      await Deno.remove(tempDir, { recursive: true });
      console.log('🧹 Cleaned up temp directory');
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temp directory:', cleanupError);
    }
  }
}

async function uploadVideoToStorage(supabase: any, videoData: Uint8Array, fileName: string): Promise<string> {
  console.log('☁️ Uploading video to Supabase storage...');
  console.log('📁 File name:', fileName);
  console.log('📊 File size:', videoData.length, 'bytes');

  const { data, error } = await supabase.storage
    .from('generated-videos')
    .upload(fileName, videoData, {
      contentType: 'video/mp4',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('❌ Storage upload error:', error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }

  console.log('✅ Video uploaded successfully:', data.path);
  
  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('generated-videos')
    .getPublicUrl(data.path);

  console.log('🔗 Public URL generated:', publicUrlData.publicUrl);
  return data.path; // Return the storage path
}

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

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasElevenlabsKey: !!elevenlabsKey
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!elevenlabsKey) {
      throw new Error('Missing ElevenLabs API key');
    }

    // Check if FFmpeg is available
    try {
      const ffmpegCheck = new Deno.Command('ffmpeg', { args: ['-version'] });
      const { code } = await ffmpegCheck.output();
      if (code !== 0) {
        throw new Error('FFmpeg not available');
      }
      console.log('✅ FFmpeg is available');
    } catch (error) {
      throw new Error('FFmpeg is not installed or not available in PATH');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch content item with scenes and generated images
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
      .single() as { data: ContentItem | null, error: any };

    console.log('📊 Database query result:', {
      hasData: !!contentItem,
      error: error?.message,
      contentItemTitle: contentItem?.title
    });

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
    console.log('🎤 Using ElevenLabs voice ID:', elevenlabsVoiceId);
    
    const audioData = await generateVoiceNarration(contentItem.script, elevenlabsVoiceId);

    // Create video using FFmpeg
    const videoData = await createVideoWithFFmpeg(scenesWithImages, audioData, contentItem.title);

    // Upload video to Supabase storage
    const fileName = `${contentItemId}-${Date.now()}.mp4`;
    const storagePath = await uploadVideoToStorage(supabase, videoData, fileName);

    // Update content item with video file path
    await supabase
      .from('content_items')
      .update({
        video_status: 'completed',
        video_file_path: storagePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    console.log('🎉 Video creation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        videoPath: storagePath,
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
