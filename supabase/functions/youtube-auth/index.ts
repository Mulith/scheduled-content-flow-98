
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, code, state, channelId, enabled } = await req.json()

    if (action === 'getAuthUrl') {
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
      const origin = req.headers.get('origin')
      
      // Use the actual origin from the request as the redirect URI
      const redirectUri = `${origin}/app`
      
      console.log('Redirect URI:', redirectUri)
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
      authUrl.searchParams.set('client_id', clientId!)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      // Updated scopes to request broader access
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl')
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent') // Force consent to get refresh token
      authUrl.searchParams.set('state', user.id)

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateChannelEnabled') {
      const { error } = await supabaseClient
        .from('youtube_channels')
        .update({ enabled: enabled })
        .eq('user_id', user.id)
        .eq('channel_id', channelId)

      if (error) {
        console.error('Database error during channel update:', error)
        throw new Error('Failed to update channel settings')
      }

      console.log(`Updated channel ${channelId} enabled status to: ${enabled}`)

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Channel settings updated successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'disconnect') {
      const { error } = await supabaseClient
        .from('youtube_channels')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Database error during disconnect:', error)
        throw new Error('Failed to disconnect YouTube channels')
      }

      console.log(`Disconnected all YouTube channels for user: ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'YouTube account disconnected successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchangeCode') {
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
      const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')
      const origin = req.headers.get('origin')
      const redirectUri = `${origin}/app`

      console.log('Exchange code redirect URI:', redirectUri)

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenData.access_token) {
        console.error('Token exchange failed:', tokenData)
        throw new Error('Failed to get access token')
      }

      // Try multiple approaches to get all available channels
      const allChannels = []
      
      // Approach 1: Try to get channels the user owns (mine=true)
      console.log('Fetching user\'s own channels...')
      const ownChannelsResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        }
      )

      const ownChannelsData = await ownChannelsResponse.json()
      console.log('Own channels response:', ownChannelsData)
      
      if (ownChannelsData.items && ownChannelsData.items.length > 0) {
        allChannels.push(...ownChannelsData.items)
      }

      // Approach 2: Try to get managed channels (for brand accounts)
      console.log('Attempting to fetch managed channels...')
      try {
        const managedChannelsResponse = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&managedByMe=true&maxResults=50',
          {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          }
        )

        const managedChannelsData = await managedChannelsResponse.json()
        console.log('Managed channels response:', managedChannelsData)
        
        if (managedChannelsData.items && managedChannelsData.items.length > 0) {
          // Add any additional channels that aren't already in the list
          for (const channel of managedChannelsData.items) {
            if (!allChannels.find(existing => existing.id === channel.id)) {
              allChannels.push(channel)
            }
          }
        }
      } catch (managedError) {
        console.log('Managed channels fetch failed (expected for most accounts):', managedError)
      }

      // Approach 3: Try to fetch using channel IDs from subscriptions (broader access)
      console.log('Attempting to fetch via subscriptions...')
      try {
        const subscriptionsResponse = await fetch(
          'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50',
          {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          }
        )
        
        const subscriptionsData = await subscriptionsResponse.json()
        console.log('Subscriptions response (for debugging):', subscriptionsData)
      } catch (subscriptionError) {
        console.log('Subscriptions fetch failed:', subscriptionError)
      }

      if (allChannels.length === 0) {
        throw new Error('No YouTube channels found for this account')
      }

      console.log(`Found ${allChannels.length} total channels`)

      // Store all channels in the database
      const channels = []
      for (const channel of allChannels) {
        const channelRecord = {
          user_id: user.id,
          channel_id: channel.id,
          channel_name: channel.snippet.title,
          channel_handle: channel.snippet.customUrl || `@${channel.snippet.title.replace(/\s+/g, '').toLowerCase()}`,
          thumbnail_url: channel.snippet.thumbnails?.default?.url,
          subscriber_count: parseInt(channel.statistics?.subscriberCount || '0'),
          video_count: parseInt(channel.statistics?.videoCount || '0'),
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null, // Allow null refresh tokens
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          enabled: false, // Default to disabled
        }

        const { error } = await supabaseClient
          .from('youtube_channels')
          .upsert(channelRecord, {
            onConflict: 'user_id,channel_id'
          })

        if (error) {
          console.error('Database error for channel:', channel.id, error)
        } else {
          channels.push({
            id: channel.id,
            name: channel.snippet.title,
            handle: channel.snippet.customUrl || `@${channel.snippet.title.replace(/\s+/g, '').toLowerCase()}`,
            thumbnail: channel.snippet.thumbnails?.default?.url,
            subscribers: channel.statistics?.subscriberCount || '0',
            videos: channel.statistics?.videoCount || '0',
            enabled: false,
          })
        }
      }

      if (channels.length === 0) {
        throw new Error('Failed to save any channel data')
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          channels: channels,
          message: `Successfully connected ${channels.length} channel(s)`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
