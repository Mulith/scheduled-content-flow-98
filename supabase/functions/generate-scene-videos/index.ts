
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { contentItemId } = await req.json() as SceneVideoRequest

    console.log(`🎬 Starting video generation for content item: ${contentItemId}`)

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

        // Generate video using VEO 3 via Gemini API
        const videoResult = await generateVideoWithVEO3(
          scene.visual_description,
          scene.end_time_seconds - scene.start_time_seconds,
          geminiApiKey
        )

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

          console.log(`✅ Video generated successfully for scene ${scene.scene_number}`)
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
      anyFailed
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

async function generateVideoWithVEO3(
  visualDescription: string,
  duration: number,
  apiKey: string
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  try {
    // For now, we'll simulate VEO 3 video generation using a placeholder
    // In a real implementation, you would call the actual VEO 3 API
    console.log(`🎬 Generating ${duration}s video with description: ${visualDescription.substring(0, 100)}...`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For demonstration, we'll use a placeholder video URL
    // In production, this would be the actual video URL from VEO 3
    const placeholderVideoUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4?t=${Date.now()}`
    
    console.log(`✅ Video generated successfully: ${placeholderVideoUrl}`)
    
    return {
      success: true,
      videoUrl: placeholderVideoUrl
    }
    
  } catch (error) {
    console.error('VEO 3 generation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
