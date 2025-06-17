
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeneratedContent {
  title: string;
  script: string;
  duration_seconds: number;
  topic_keywords: string[];
  scenes: {
    scene_number: number;
    start_time_seconds: number;
    end_time_seconds: number;
    visual_description: string;
    narration_text: string;
  }[];
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
          const generatedContent = await generateContentWithGemini(
            channel,
            usedTopics,
            geminiApiKey
          )

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

          console.log(`Generated content: "${generatedContent.title}" for channel ${channel.name}`)
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

async function generateContentWithGemini(
  channel: any, 
  usedTopics: string[], 
  apiKey: string
): Promise<GeneratedContent> {
  const videoTypes = Array.isArray(channel.selected_video_types) 
    ? channel.selected_video_types.join(', ') 
    : channel.selected_video_types

  const topics = Array.isArray(channel.selected_topics) 
    ? channel.selected_topics.join(', ') 
    : channel.selected_topics || 'general productivity and motivation'

  // Create topic guidance based on topic mode
  let topicGuidance = '';
  switch (channel.topic_mode) {
    case 'predefined':
      topicGuidance = `You MUST create content strictly about these specific topics: ${topics}. Do not deviate from these topics.`;
      break;
    case 'manual':
      topicGuidance = `Focus primarily on these topics: ${topics}, but you have some flexibility to explore related subtopics if they add value.`;
      break;
    case 'ai-decide':
    default:
      topicGuidance = `You have complete creative freedom to choose engaging topics. These are suggested areas for inspiration: ${topics}, but feel free to explore any relevant and valuable content topics.`;
      break;
  }

  const prompt = `
You are a content creator specializing in creating engaging short-form video content. Create a video script under 30 seconds.

Channel Details:
- Video Types: ${videoTypes}
- Topic Guidance: ${topicGuidance}

Avoid these previously used topics: ${usedTopics.slice(-20).join(', ')}

Requirements:
1. Create an engaging, attention-grabbing title
2. Write a complete script with natural speech patterns that can be delivered in under 30 seconds
3. Break the script into 2-4 scenes with specific visual descriptions
4. Include precise timing for each scene (total duration should be 20-30 seconds)
5. Extract 3-5 topic keywords for the content
6. Make content engaging, actionable, and valuable to viewers
7. Ensure scenes flow naturally and timing adds up to the total duration

Return your response as valid JSON in this exact format:
{
  "title": "Video Title",
  "script": "Complete video script...",
  "duration_seconds": 25,
  "topic_keywords": ["keyword1", "keyword2", "keyword3"],
  "scenes": [
    {
      "scene_number": 1,
      "start_time_seconds": 0,
      "end_time_seconds": 8,
      "visual_description": "Detailed description of what should be shown visually",
      "narration_text": "Exact text to be spoken during this scene"
    }
  ]
}
`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error('No content generated from Gemini')
  }

  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const content = JSON.parse(jsonMatch[0])
    
    // Validate the structure
    if (!content.title || !content.script || !content.scenes || !Array.isArray(content.scenes)) {
      throw new Error('Invalid content structure returned from Gemini')
    }

    return content as GeneratedContent

  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError)
    console.error('Raw response:', generatedText)
    throw new Error(`Failed to parse generated content: ${parseError.message}`)
  }
}

function getDurationFromSchedule(schedule: string): number {
  // Set all durations to under 30 seconds by default
  switch (schedule) {
    case 'twice-daily':
      return 20 // Shorter for frequent posting
    case 'daily':
      return 25 // Standard short-form content
    case 'weekly':
      return 30 // Slightly longer for weekly content
    case 'monthly':
      return 30 // Consistent with weekly
    default:
      return 25
  }
}
