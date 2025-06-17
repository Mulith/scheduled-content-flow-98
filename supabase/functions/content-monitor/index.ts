
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Get channels that need checking and are active
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
      return new Response(JSON.stringify({ error: channelsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${channelsToCheck?.length || 0} channels to check`)

    for (const queueItem of channelsToCheck || []) {
      const channel = queueItem.content_channels
      
      // Count existing content items with status 'ready' or 'published'
      const { count: contentCount, error: countError } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', channel.id)
        .in('status', ['ready', 'published'])

      if (countError) {
        console.error(`Error counting content for channel ${channel.id}:`, countError)
        continue
      }

      // Get content requirements based on schedule
      const { data: requirementData, error: reqError } = await supabase
        .rpc('get_content_requirements', { schedule_type: channel.schedule })

      if (reqError) {
        console.error(`Error getting requirements for channel ${channel.id}:`, reqError)
        continue
      }

      const requiredCount = requirementData
      const currentCount = contentCount || 0
      
      console.log(`Channel ${channel.name}: has ${currentCount}, needs ${requiredCount}`)

      // If we need more content, add to generation queue
      if (currentCount < requiredCount) {
        const itemsToGenerate = requiredCount - currentCount

        // Check if there's already a pending generation request
        const { data: existingGeneration, error: existingError } = await supabase
          .from('content_generation_queue')
          .select('*')
          .eq('channel_id', channel.id)
          .eq('status', 'pending')
          .single()

        if (!existingError && !existingGeneration) {
          // Add to generation queue
          const { error: insertError } = await supabase
            .from('content_generation_queue')
            .insert({
              channel_id: channel.id,
              items_to_generate: itemsToGenerate,
              priority: channel.schedule === 'twice-daily' ? 3 : 
                       channel.schedule === 'daily' ? 2 : 1
            })

          if (insertError) {
            console.error(`Error adding to generation queue for channel ${channel.id}:`, insertError)
          } else {
            console.log(`Added ${itemsToGenerate} items to generation queue for channel ${channel.name}`)
          }
        }
      }

      // Update next check time based on schedule
      const nextCheckInterval = channel.schedule === 'twice-daily' ? '2 hours' :
                               channel.schedule === 'daily' ? '4 hours' :
                               channel.schedule === 'weekly' ? '12 hours' : '24 hours'

      await supabase
        .from('content_monitoring_queue')
        .update({
          last_checked_at: new Date().toISOString(),
          next_check_at: new Date(Date.now() + getIntervalMs(nextCheckInterval)).toISOString()
        })
        .eq('id', queueItem.id)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      channelsChecked: channelsToCheck?.length || 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Content monitor error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
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
