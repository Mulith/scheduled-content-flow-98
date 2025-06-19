
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DatabaseOperations } from './database-operations.ts'
import { SceneProcessor } from './scene-processor.ts'
import { ContentStatusManager } from './content-status-manager.ts'

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
    
    const { contentItemId } = await req.json() as SceneGenerationRequest

    console.log(`🎬 Starting scene generation for content item: ${contentItemId}`)

    // Initialize services
    const dbOps = new DatabaseOperations(supabaseUrl, supabaseServiceKey)
    const sceneProcessor = new SceneProcessor(dbOps)
    const statusManager = new ContentStatusManager(dbOps)

    // Get content item
    const contentItem = await dbOps.getContentItem(contentItemId)

    // Default to dynamic image generation
    const generationType = 'dynamic_image'
    console.log(`📋 Generation type: ${generationType}`)

    const availableProviders = sceneProcessor.getAvailableProviders()
    console.log(`📋 Available image providers:`, availableProviders)

    // Update content item status to in progress
    await dbOps.updateContentItemStatus(contentItemId, {
      generation_stage: 'image_creation',
      video_status: 'in_progress'
    })

    // Get all scenes for this content item
    const scenes = await dbOps.getScenes(contentItemId)

    // Process all scenes
    const { successCount, failCount } = await sceneProcessor.processAllScenes(scenes)

    // Update final status
    const { allCompleted, anyFailed } = await statusManager.updateFinalStatus(
      contentItemId, 
      scenes.map(s => s.id)
    )

    console.log(`🎉 Scene generation process completed for content item ${contentItemId}`)

    return new Response(JSON.stringify({ 
      success: true, 
      contentItemId,
      generationType,
      scenesProcessed: scenes.length,
      imagesGenerated: successCount,
      imagesFailed: failCount,
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
