
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { LLMGateway } from './llm-gateway.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize LLM Gateway
    const llmGateway = new LLMGateway();
    console.log('🧠 Available LLM providers:', llmGateway.getAvailableProviders());

    // Get pending generation requests
    const { data: pendingGenerations, error: generationError } = await supabase
      .from('content_generation_queue')
      .select(`
        *,
        content_channels!inner(
          id,
          name,
          schedule,
          selected_topics,
          topic_mode,
          selected_video_types,
          selected_voice
        )
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5) // Process 5 at a time

    if (generationError) {
      throw new Error(`Error fetching pending generations: ${generationError.message}`)
    }

    console.log(`Found ${pendingGenerations?.length || 0} pending generations`)

    for (const generation of pendingGenerations || []) {
      const channel = generation.content_channels

      try {
        // Mark as processing
        await supabase
          .from('content_generation_queue')
          .update({ 
            status: 'processing', 
            started_at: new Date().toISOString() 
          })
          .eq('id', generation.id)

        // Get existing topics to avoid repetition
        const { data: existingContent } = await supabase
          .from('content_items')
          .select('topic_keywords')
          .eq('channel_id', channel.id)
          .not('topic_keywords', 'is', null)

        const usedTopics = existingContent?.flatMap(item => item.topic_keywords || []) || []

        // Generate content for each item requested
        for (let i = 0; i < generation.items_to_generate; i++) {
          const targetDuration = getDurationFromSchedule(channel.schedule);
          
          const generationResult = await llmGateway.generateContent({
            channel,
            usedTopics,
            targetDuration
          });

          if (!generationResult.success || !generationResult.content) {
            throw new Error(`Content generation failed: ${generationResult.error}`);
          }

          const generatedContent = generationResult.content;

          // Insert content item
          const { data: contentItem, error: contentError } = await supabase
            .from('content_items')
            .insert({
              channel_id: channel.id,
              title: generatedContent.title,
              script: generatedContent.script,
              status: 'ready',
              topic_keywords: generatedContent.topic_keywords,
              duration_seconds: generatedContent.duration_seconds
            })
            .select()
            .single()

          if (contentError) {
            throw new Error(`Error inserting content item: ${contentError.message}`)
          }

          // Insert scenes
          const scenesWithContentId = generatedContent.scenes.map(scene => ({
            ...scene,
            content_item_id: contentItem.id
          }))

          const { error: scenesError } = await supabase
            .from('content_scenes')
            .insert(scenesWithContentId)

          if (scenesError) {
            throw new Error(`Error inserting scenes: ${scenesError.message}`)
          }

          console.log(`Generated content: "${generatedContent.title}" for channel ${channel.name} using ${generationResult.providerId}`)
        }

        // Mark as completed
        await supabase
          .from('content_generation_queue')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString() 
          })
          .eq('id', generation.id)

      } catch (error) {
        console.error(`Error generating content for channel ${channel.id}:`, error)
        
        await supabase
          .from('content_generation_queue')
          .update({ 
            status: 'failed', 
            error_message: error.message,
            completed_at: new Date().toISOString() 
          })
          .eq('id', generation.id)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: pendingGenerations?.length || 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Content generator error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function getDurationFromSchedule(schedule: string): number {
  // Updated durations for better, more natural content
  switch (schedule) {
    case 'twice-daily':
      return 20 // Shorter for frequent posting
    case 'daily':
      return 30 // Standard short-form content
    case 'weekly':
      return 45 // Longer for less frequent but higher quality
    case 'monthly':
      return 60 // Maximum for premium content
    default:
      return 30
  }
}
