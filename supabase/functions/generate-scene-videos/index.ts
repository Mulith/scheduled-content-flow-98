
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
    const { error: updateError } = await supabase
      .from('content_items')
      .update({ 
        generation_stage: 'video_creation',
        video_status: 'in_progress',
        updated_by_system: new Date().toISOString()
      })
      .eq('id', contentItemId)

    if (updateError) {
      console.error('Error updating content item status:', updateError)
    }

    // Get all scenes for this content item
    const { data: scenes, error: scenesError } = await supabase
      .from('content_scenes')
      .select('*')
      .eq('content_item_id', contentItemId)
      .order('scene_number')

    if (scenesError) {
      console.error('Error fetching scenes:', scenesError)
      throw new Error(`Error fetching scenes: ${scenesError.message}`)
    }

    if (!scenes || scenes.length === 0) {
      throw new Error('No scenes found for content item')
    }

    console.log(`📝 Found ${scenes.length} scenes to generate videos for:`, scenes.map(s => ({ id: s.id, scene_number: s.scene_number, visual: s.visual_description.substring(0, 50) + '...' })))

    let successCount = 0
    let failCount = 0

    // Generate video for each scene
    for (const scene of scenes) {
      try {
        console.log(`🎥 Generating video for scene ${scene.scene_number} (ID: ${scene.id})`)
        console.log(`📝 Visual description: ${scene.visual_description}`)

        // Check if scene video already exists
        const { data: existingVideo } = await supabase
          .from('content_scene_videos')
          .select('*')
          .eq('scene_id', scene.id)
          .single()

        let sceneVideoId = existingVideo?.id

        if (!existingVideo) {
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
            console.error(`❌ Error creating scene video record for scene ${scene.scene_number}:`, insertError)
            failCount++
            continue
          }

          sceneVideoId = sceneVideo.id
          console.log(`✅ Created scene video record with ID: ${sceneVideoId}`)
        } else {
          console.log(`📋 Found existing scene video record with ID: ${sceneVideoId}`)
          
          // Update status to generating if not already completed
          if (existingVideo.video_status !== 'completed') {
            await supabase
              .from('content_scene_videos')
              .update({
                video_status: 'generating',
                error_message: null
              })
              .eq('id', sceneVideoId)
          }
        }

        // Generate video using the gateway
        console.log(`🎬 Calling video gateway for scene ${scene.scene_number}...`)
        const videoResult = await videoGateway.generateVideo({
          prompt: scene.visual_description,
          duration: scene.end_time_seconds - scene.start_time_seconds,
          aspectRatio: '16:9',
          quality: 'standard'
        })

        console.log(`📊 Video generation result for scene ${scene.scene_number}:`, videoResult)

        if (videoResult.success) {
          // Update scene video with generated video URL
          const { error: updateVideoError } = await supabase
            .from('content_scene_videos')
            .update({
              video_url: videoResult.videoUrl,
              video_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', sceneVideoId)

          if (updateVideoError) {
            console.error(`❌ Error updating scene video for scene ${scene.scene_number}:`, updateVideoError)
            failCount++
          } else {
            console.log(`✅ Video generated successfully for scene ${scene.scene_number} using ${videoResult.providerId}`)
            console.log(`🔗 Video URL: ${videoResult.videoUrl}`)
            successCount++
          }
        } else {
          // Update scene video with error
          const { error: updateErrorStatus } = await supabase
            .from('content_scene_videos')
            .update({
              video_status: 'failed',
              error_message: videoResult.error,
              completed_at: new Date().toISOString()
            })
            .eq('id', sceneVideoId)

          if (updateErrorStatus) {
            console.error(`❌ Error updating failed status for scene ${scene.scene_number}:`, updateErrorStatus)
          }

          console.error(`❌ Video generation failed for scene ${scene.scene_number}: ${videoResult.error}`)
          failCount++
        }

      } catch (sceneError) {
        console.error(`💥 Error processing scene ${scene.scene_number}:`, sceneError)
        failCount++
      }
    }

    // Check final status of all videos
    const { data: sceneVideos, error: finalCheckError } = await supabase
      .from('content_scene_videos')
      .select('video_status')
      .in('scene_id', scenes.map(s => s.id))

    if (finalCheckError) {
      console.error('Error checking final video status:', finalCheckError)
    }

    const allCompleted = sceneVideos?.every(sv => sv.video_status === 'completed') || false
    const anyFailed = sceneVideos?.some(sv => sv.video_status === 'failed') || false

    console.log(`📊 Final status: ${successCount} successful, ${failCount} failed, allCompleted: ${allCompleted}, anyFailed: ${anyFailed}`)

    // Update content item video status
    const finalVideoStatus = allCompleted ? 'completed' : anyFailed ? 'failed' : 'in_progress'
    const nextStage = allCompleted ? 'music_creation' : 'video_creation'

    const { error: finalUpdateError } = await supabase
      .from('content_items')
      .update({
        video_status: finalVideoStatus,
        generation_stage: nextStage,
        updated_by_system: new Date().toISOString()
      })
      .eq('id', contentItemId)

    if (finalUpdateError) {
      console.error('Error updating final content item status:', finalUpdateError)
    }

    console.log(`🎉 Video generation process completed for content item ${contentItemId}`)

    return new Response(JSON.stringify({ 
      success: true, 
      contentItemId,
      scenesProcessed: scenes.length,
      videosGenerated: successCount,
      videosFailed: failCount,
      allCompleted,
      anyFailed,
      providersUsed: config,
      availableProviders
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Video generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
