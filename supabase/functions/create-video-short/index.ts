
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

async function createVideoWithExternalFFmpeg(scenes: Scene[], audioData: Uint8Array, title: string): Promise<Uint8Array> {
  console.log('🎬 Calling external FFmpeg service...');
  console.log('🎞️ Processing', scenes.length, 'scenes');
  
  const ffmpegServiceUrl = Deno.env.get('FFMPEG_SERVICE_URL');
  if (!ffmpegServiceUrl) {
    throw new Error('FFMPEG_SERVICE_URL environment variable not set');
  }

  console.log('🔗 FFmpeg service URL:', ffmpegServiceUrl);

  try {
    // Create FormData with audio and image URLs
    const formData = new FormData();
    
    // Add audio file
    formData.append('audio', new Blob([audioData], { type: 'audio/mpeg' }), 'audio.mp3');
    console.log('🎵 Audio added to form data');
    
    // Add image URLs instead of downloading and uploading images
    const imageUrls: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imageUrl = scene.content_scene_videos?.[0]?.video_url;
      
      if (imageUrl) {
        console.log(`🔗 Adding image URL for scene ${i + 1}/${scenes.length}: ${imageUrl}`);
        imageUrls.push(imageUrl);
      }
    }
    
    // Send image URLs as JSON array
    formData.append('imageUrls', JSON.stringify(imageUrls));
    console.log(`📋 Added ${imageUrls.length} image URLs to form data`);
    
    // Add metadata
    formData.append('title', title);
    formData.append('parallax', 'true');
    console.log('📝 Metadata added to form data');

    console.log('🚀 Sending request to FFmpeg service...');
    const response = await fetch(`${ffmpegServiceUrl}/create-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FFmpeg service error:', errorText);
      
      // Provide more specific error messaging
      if (response.status === 403) {
        throw new Error(`FFmpeg service authentication failed (403). Please check if the Cloud Run service allows unauthenticated requests or configure proper authentication. Error: ${errorText}`);
      } else if (response.status === 503) {
        throw new Error(`FFmpeg service unavailable (503). This might be due to billing account not being linked to your Google Cloud project. Error: ${errorText}`);
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
    const ffmpegServiceUrl = Deno.env.get('FFMPEG_SERVICE_URL');
    
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasElevenlabsKey: !!elevenlabsKey,
      hasFFmpegServiceUrl: !!ffmpegServiceUrl
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

    // Create video using external FFmpeg service
    const videoData = await createVideoWithExternalFFmpeg(scenesWithImages, audioData, contentItem.title);

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
