
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

    // Get channels that need checking and are active
    console.log('Fetching channels to check...')
    const { data: channelsToCheck, error: channelsError } = await supabase
      .from('content_monitoring_queue')
      .select(`
        *,
        content_channels!inner(
          id,
          name,
          schedule,
          is_active,
          selected_topics,
          topic_mode,
          selected_video_types,
          user_id
        )
      `)
      .eq('status', 'active')
      .eq('content_channels.is_active', true)
      .lte('next_check_at', new Date().toISOString())

    if (channelsError) {
      console.error('Error fetching channels to check:', channelsError)
      return new Response(JSON.stringify({ 
        error: channelsError.message,
        details: 'Failed to fetch channels from monitoring queue'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${channelsToCheck?.length || 0} channels to check:`, channelsToCheck?.map(c => c.content_channels?.name))

    let channelsProcessed = 0;

    for (const queueItem of channelsToCheck || []) {
      const channel = queueItem.content_channels
      
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

      // Update next check time based on schedule
      const nextCheckInterval = channel.schedule === 'twice-daily' ? '2 hours' :
                               channel.schedule === 'daily' ? '4 hours' :
                               channel.schedule === 'weekly' ? '12 hours' : '24 hours'

      const nextCheckTime = new Date(Date.now() + getIntervalMs(nextCheckInterval)).toISOString()
      
      console.log(`Updating next check for channel ${channel.name} to: ${nextCheckTime}`)

      const { error: updateError } = await supabase
        .from('content_monitoring_queue')
        .update({
          last_checked_at: new Date().toISOString(),
          next_check_at: nextCheckTime
        })
        .eq('id', queueItem.id)

      if (updateError) {
        console.error(`Error updating monitoring queue for channel ${channel.id}:`, updateError)
      } else {
        console.log(`✅ Updated monitoring queue for channel ${channel.name}`)
      }

      channelsProcessed++
    }

    const summary = {
      success: true, 
      channelsChecked: channelsProcessed,
      totalChannelsFound: channelsToCheck?.length || 0,
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

function getIntervalMs(interval: string): number {
  const [amount, unit] = interval.split(' ')
  const multiplier = unit.includes('hour') ? 3600000 : 
                    unit.includes('minute') ? 60000 : 86400000
  return parseInt(amount) * multiplier
}
