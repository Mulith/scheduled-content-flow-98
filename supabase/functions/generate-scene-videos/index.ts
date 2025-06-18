
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { VideoGenerationGateway } from './video-gateway.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SceneVideoRequest {
  contentItemId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { contentItemId } = await req.json() as SceneVideoRequest

    console.log(`🎬 Starting video generation for content item: ${contentItemId}`)

    // Initialize video generation gateway
    const videoGateway = new VideoGenerationGateway()
    const availableProviders = videoGateway.getAvailableProviders()
    const config = videoGateway.getCurrentConfiguration()
    
    console.log(`📋 Available video providers:`, availableProviders)
    console.log(`⚙️ Current configuration:`, config)

    // Update content item status to video creation in progress
    await supabase
      .from('content_items')
      .update({ 
        generation_stage: 'video_creation',
        video_status: 'in_progress',
        updated_by_system: new Date().toISOString()
      })
      .eq('id', contentItemId)

    // Get all scenes for this content item
    const { data: scenes, error: scenesError } = await supabase
      .from('content_scenes')
      .select('*')
      .eq('content_item_id', contentItemId)
      .order('scene_number')

    if (scenesError) {
      throw new Error(`Error fetching scenes: ${scenesError.message}`)
    }

    if (!scenes || scenes.length === 0) {
      throw new Error('No scenes found for content item')
    }

    console.log(`Found ${scenes.length} scenes to generate videos for`)

    // Generate video for each scene
    for (const scene of scenes) {
      try {
        console.log(`🎥 Generating video for scene ${scene.scene_number}`)

        // Create scene video record
        const { data: sceneVideo, error: insertError } = await supabase
          .from('content_scene_videos')
          .insert({
            scene_id: scene.id,
            video_status: 'generating',
            generation_request_id: `scene_${scene.id}_${Date.now()}`
          })
          .select()
          .single()

        if (insertError) {
          console.error(`Error creating scene video record: ${insertError.message}`)
          continue
        }

        // Generate video using the gateway
        const videoResult = await videoGateway.generateVideo({
          prompt: scene.visual_description,
          duration: scene.end_time_seconds - scene.start_time_seconds,
          aspectRatio: '16:9',
          quality: 'standard'
        })

        if (videoResult.success) {
          // Update scene video with generated video URL
          await supabase
            .from('content_scene_videos')
            .update({
              video_url: videoResult.videoUrl,
              video_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', sceneVideo.id)

          console.log(`✅ Video generated successfully for scene ${scene.scene_number} using ${videoResult.providerId}`)
        } else {
          // Update scene video with error
          await supabase
            .from('content_scene_videos')
            .update({
              video_status: 'failed',
              error_message: videoResult.error,
              completed_at: new Date().toISOString()
            })
            .eq('id', sceneVideo.id)

          console.error(`❌ Video generation failed for scene ${scene.scene_number}: ${videoResult.error}`)
        }

      } catch (sceneError) {
        console.error(`Error processing scene ${scene.scene_number}:`, sceneError)
      }
    }

    // Check if all videos are completed
    const { data: sceneVideos } = await supabase
      .from('content_scene_videos')
      .select('video_status')
      .in('scene_id', scenes.map(s => s.id))

    const allCompleted = sceneVideos?.every(sv => sv.video_status === 'completed')
    const anyFailed = sceneVideos?.some(sv => sv.video_status === 'failed')

    // Update content item video status
    const finalVideoStatus = allCompleted ? 'completed' : anyFailed ? 'failed' : 'in_progress'
    const nextStage = allCompleted ? 'music_creation' : 'video_creation'

    await supabase
      .from('content_items')
      .update({
        video_status: finalVideoStatus,
        generation_stage: nextStage,
        updated_by_system: new Date().toISOString()
      })
      .eq('id', contentItemId)

    console.log(`🎉 Video generation completed for content item ${contentItemId}`)

    return new Response(JSON.stringify({ 
      success: true, 
      contentItemId,
      videosGenerated: scenes.length,
      allCompleted,
      anyFailed,
      providersUsed: config,
      availableProviders
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
