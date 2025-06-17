
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Content monitor function started')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      throw new Error('Missing Supabase configuration')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase client created successfully')

    // Get all active channels directly from content_channels table
    console.log('Fetching active channels...')
    const { data: activeChannels, error: channelsError } = await supabase
      .from('content_channels')
      .select(`
        id,
        name,
        schedule,
        is_active,
        selected_topics,
        topic_mode,
        selected_video_types,
        user_id
      `)
      .eq('is_active', true)

    if (channelsError) {
      console.error('Error fetching active channels:', channelsError)
      return new Response(JSON.stringify({ 
        error: channelsError.message,
        details: 'Failed to fetch active channels'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${activeChannels?.length || 0} active channels:`, activeChannels?.map(c => c.name))

    let channelsProcessed = 0;

    for (const channel of activeChannels || []) {
      console.log(`Processing channel: ${channel.name} (ID: ${channel.id})`)
      
      // Count existing content items with status 'ready' or 'published'
      console.log(`Counting content for channel ${channel.id}...`)
      const { count: contentCount, error: countError } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', channel.id)
        .in('status', ['ready', 'published'])

      if (countError) {
        console.error(`Error counting content for channel ${channel.id}:`, countError)
        continue
      }

      console.log(`Channel ${channel.name} currently has ${contentCount || 0} content items`)

      // Get content requirements based on schedule
      console.log(`Getting requirements for schedule: ${channel.schedule}`)
      const { data: requirementData, error: reqError } = await supabase
        .rpc('get_content_requirements', { schedule_type: channel.schedule })

      if (reqError) {
        console.error(`Error getting requirements for channel ${channel.id}:`, reqError)
        continue
      }

      const requiredCount = requirementData
      const currentCount = contentCount || 0
      
      console.log(`Channel ${channel.name}: has ${currentCount} content items, needs ${requiredCount} (schedule: ${channel.schedule})`)

      // If we need more content, add to generation queue
      if (currentCount < requiredCount) {
        const itemsToGenerate = requiredCount - currentCount

        console.log(`Channel ${channel.name} needs ${itemsToGenerate} more content items`)

        // Check if there's already a pending or processing generation request
        const { data: existingGeneration, error: existingError } = await supabase
          .from('content_generation_queue')
          .select('*')
          .eq('channel_id', channel.id)
          .in('status', ['pending', 'processing'])
          .maybeSingle()

        if (existingError) {
          console.error(`Error checking existing generation queue for channel ${channel.id}:`, existingError)
          continue
        }

        if (!existingGeneration) {
          console.log(`Adding ${itemsToGenerate} items to generation queue for channel ${channel.name}`)
          // Add to generation queue
          const { error: insertError } = await supabase
            .from('content_generation_queue')
            .insert({
              channel_id: channel.id,
              items_to_generate: itemsToGenerate,
              priority: channel.schedule === 'twice-daily' ? 3 : 
                       channel.schedule === 'daily' ? 2 : 1,
              status: 'pending'
            })

          if (insertError) {
            console.error(`Error adding to generation queue for channel ${channel.id}:`, insertError)
          } else {
            console.log(`✅ Successfully added ${itemsToGenerate} items to generation queue for channel ${channel.name}`)
          }
        } else {
          console.log(`Channel ${channel.name} already has a ${existingGeneration.status} generation request for ${existingGeneration.items_to_generate} items`)
        }
      } else {
        console.log(`✅ Channel ${channel.name} has sufficient content (${currentCount}/${requiredCount})`)
      }

      channelsProcessed++
    }

    const summary = {
      success: true, 
      channelsChecked: channelsProcessed,
      totalChannelsFound: activeChannels?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('Content monitoring completed successfully:', summary)

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Content monitor error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
