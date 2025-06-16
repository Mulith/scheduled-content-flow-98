
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the user ID
    const error = url.searchParams.get('error')

    if (error) {
      return new Response(JSON.stringify({ error: `OAuth error: ${error}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!code || !state) {
      return new Response(JSON.stringify({ error: 'Missing code or state parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'YouTube credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${url.origin}/auth/callback`,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData)
      return new Response(JSON.stringify({ error: 'Failed to exchange code for tokens' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get channel information
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })

    const channelData = await channelResponse.json()
    if (!channelResponse.ok || !channelData.items?.length) {
      console.error('Channel fetch error:', channelData)
      return new Response(JSON.stringify({ error: 'Failed to fetch channel information' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const channel = channelData.items[0]
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

    // Store channel information in database
    const { error: dbError } = await supabase
      .from('youtube_channels')
      .upsert({
        user_id: state,
        channel_id: channel.id,
        channel_name: channel.snippet.title,
        channel_handle: channel.snippet.customUrl || null,
        thumbnail_url: channel.snippet.thumbnails?.default?.url || null,
        subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
        video_count: parseInt(channel.statistics.videoCount) || 0,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'user_id,channel_id'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(JSON.stringify({ error: 'Failed to save channel information' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      channel: {
        id: channel.id,
        name: channel.snippet.title,
        handle: channel.snippet.customUrl
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('YouTube callback error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
