
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

    const { action, code, state } = await req.json()

    if (action === 'getAuthUrl') {
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
      const redirectUri = `${req.headers.get('origin')}/app`
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
      authUrl.searchParams.set('client_id', clientId!)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload')
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('state', user.id)

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchangeCode') {
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
      const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')
      const redirectUri = `${req.headers.get('origin')}/app`

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
        throw new Error('Failed to get access token')
      }

      // Get channel info
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        }
      )

      const channelData = await channelResponse.json()
      
      if (!channelData.items || channelData.items.length === 0) {
        throw new Error('No YouTube channel found')
      }

      const channel = channelData.items[0]
      
      // Store or update channel in database
      const { error } = await supabaseClient
        .from('youtube_channels')
        .upsert({
          user_id: user.id,
          channel_id: channel.id,
          channel_name: channel.snippet.title,
          channel_handle: channel.snippet.customUrl || `@${channel.snippet.title.replace(/\s+/g, '').toLowerCase()}`,
          thumbnail_url: channel.snippet.thumbnails?.default?.url,
          subscriber_count: parseInt(channel.statistics.subscriberCount || '0'),
          video_count: parseInt(channel.statistics.videoCount || '0'),
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        })

      if (error) {
        console.error('Database error:', error)
        throw new Error('Failed to save channel data')
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          channel: {
            id: channel.id,
            name: channel.snippet.title,
            handle: channel.snippet.customUrl || `@${channel.snippet.title.replace(/\s+/g, '').toLowerCase()}`,
            thumbnail: channel.snippet.thumbnails?.default?.url,
            subscribers: channel.statistics.subscriberCount,
            videos: channel.statistics.videoCount,
          }
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
