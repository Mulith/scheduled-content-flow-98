
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { VideoGenerationGateway } from './video-gateway.ts'
import { ImageGenerationGateway } from './image-gateway.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SceneGenerationRequest {
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
    const { contentItemId } = await req.json() as SceneGenerationRequest

    console.log(`🎬 Starting scene generation for content item: ${contentItemId}`)

    // Get content item with channel info to check generation type
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select(`
        *,
        content_channels (
          content_generation_type
        )
      `)
      .eq('id', contentItemId)
      .single()

    if (contentError) {
      console.error('Error fetching content item:', contentError)
      throw new Error(`Error fetching content item: ${contentError.message}`)
    }

    const generationType = contentItem.content_channels?.content_generation_type || 'dynamic_image'
    console.log(`📋 Generation type: ${generationType}`)

    // Initialize appropriate gateway
    const useVideoGeneration = generationType === 'video'
    const videoGateway = useVideoGeneration ? new VideoGenerationGateway() : null
    const imageGateway = !useVideoGeneration ? new ImageGenerationGateway() : null

    if (useVideoGeneration) {
      const availableProviders = videoGateway!.getAvailableProviders()
      const config = videoGateway!.getCurrentConfiguration()
      console.log(`📋 Available video providers:`, availableProviders)
      console.log(`⚙️ Current video configuration:`, config)
    } else {
      const availableProviders = imageGateway!.getAvailableProviders()
      console.log(`📋 Available image providers:`, availableProviders)
    }

    // Update content item status
    const { error: updateError } = await supabase
      .from('content_items')
      .update({ 
        generation_stage: useVideoGeneration ? 'video_creation' : 'image_creation',
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

    console.log(`📝 Found ${scenes.length} scenes to generate ${useVideoGeneration ? 'videos' : 'images'} for`)

    let successCount = 0
    let failCount = 0

    // Generate content for each scene
    for (const scene of scenes) {
      try {
        console.log(`🎥 Generating ${useVideoGeneration ? 'video' : 'image'} for scene ${scene.scene_number} (ID: ${scene.id})`)

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
        } else {
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

        let result;
        
        if (useVideoGeneration) {
          // Generate video using the video gateway
          result = await videoGateway!.generateVideo({
            prompt: scene.visual_description,
            duration: scene.end_time_seconds - scene.start_time_seconds,
            aspectRatio: '16:9',
            quality: 'standard'
          })
        } else {
          // Generate dynamic image using the image gateway
          result = await imageGateway!.generateDynamicImage({
            prompt: scene.visual_description,
            aspectRatio: '16:9',
            quality: 'standard'
          })
        }

        console.log(`📊 Generation result for scene ${scene.scene_number}:`, {
          success: result.success,
          hasUrl: !!(result.videoUrl || result.imageUrl),
          providerId: result.providerId,
          error: result.error
        })

        const mediaUrl = result.videoUrl || result.imageUrl;

        if (result.success && mediaUrl) {
          // Update scene video with generated content URL
          const { error: updateVideoError } = await supabase
            .from('content_scene_videos')
            .update({
              video_url: mediaUrl,
              video_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', sceneVideoId)

          if (updateVideoError) {
            console.error(`❌ Error updating scene video for scene ${scene.scene_number}:`, updateVideoError)
            failCount++
          } else {
            console.log(`✅ Successfully updated database for scene ${scene.scene_number}`)
            successCount++
          }
        } else {
          // Update scene video with error
          await supabase
            .from('content_scene_videos')
            .update({
              video_status: 'failed',
              error_message: result.error,
              completed_at: new Date().toISOString()
            })
            .eq('id', sceneVideoId)

          console.error(`❌ Generation failed for scene ${scene.scene_number}: ${result.error}`)
          failCount++
        }

      } catch (sceneError) {
        console.error(`💥 Error processing scene ${scene.scene_number}:`, sceneError)
        failCount++
      }
    }

    // Check final status
    const { data: sceneVideos } = await supabase
      .from('content_scene_videos')
      .select('video_status')
      .in('scene_id', scenes.map(s => s.id))

    const allCompleted = sceneVideos?.every(sv => sv.video_status === 'completed') || false
    const anyFailed = sceneVideos?.some(sv => sv.video_status === 'failed') || false

    // Update content item final status
    const finalVideoStatus = allCompleted ? 'completed' : anyFailed ? 'failed' : 'in_progress'
    const nextStage = allCompleted ? 'music_creation' : (useVideoGeneration ? 'video_creation' : 'image_creation')

    await supabase
      .from('content_items')
      .update({
        video_status: finalVideoStatus,
        generation_stage: nextStage,
        updated_by_system: new Date().toISOString()
      })
      .eq('id', contentItemId)

    console.log(`🎉 Scene generation process completed for content item ${contentItemId}`)

    return new Response(JSON.stringify({ 
      success: true, 
      contentItemId,
      generationType,
      scenesProcessed: scenes.length,
      mediaGenerated: successCount,
      mediaFailed: failCount,
      allCompleted,
      anyFailed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Scene generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
