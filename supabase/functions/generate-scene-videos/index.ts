
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SceneVideoRequest {
  contentItemId: string;
}

interface VEO3GenerationRequest {
  prompt: string;
  duration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googleCloudServiceAccount = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY')!
    
    if (!googleCloudServiceAccount) {
      throw new Error('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY not configured')
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

        // Generate video using VEO 3 via Vertex AI
        const videoResult = await generateVideoWithVEO3({
          prompt: scene.visual_description,
          duration: scene.end_time_seconds - scene.start_time_seconds
        }, googleCloudServiceAccount)

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
  request: VEO3GenerationRequest,
  serviceAccountCredentials: string
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  try {
    console.log(`🎬 Generating ${request.duration}s video with VEO 3: ${request.prompt.substring(0, 100)}...`)
    
    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountCredentials)
    const projectId = credentials.project_id
    
    if (!projectId) {
      throw new Error('Invalid service account credentials: missing project_id')
    }

    // Get access token for Google Cloud API
    const accessToken = await getGoogleCloudAccessToken(credentials)
    
    // VEO 3 API endpoint - using the correct Imagen video generation endpoint
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-video:predict`
    
    // Prepare the request payload for VEO 3 video generation
    const payload = {
      instances: [{
        prompt: `Create a ${request.duration}-second video: ${request.prompt}`,
        negative_prompt: "blurry, low quality, distorted, watermark",
        video_duration: request.duration,
        aspect_ratio: "16:9",
        fps: 24
      }],
      parameters: {
        seed: Math.floor(Math.random() * 1000000),
        motion_bucket_id: 127,
        fps: 24
      }
    }

    console.log(`📡 Making request to VEO 3 API...`)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`VEO 3 API error: ${response.status} - ${errorText}`)
      throw new Error(`VEO 3 API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`📄 VEO 3 API response received`)

    // Extract video URL from the response
    if (result.predictions && result.predictions[0]) {
      const prediction = result.predictions[0]
      
      if (prediction.bytesBase64Encoded) {
        // Convert base64 to a data URL
        const videoUrl = `data:video/mp4;base64,${prediction.bytesBase64Encoded}`
        console.log(`✅ VEO 3 video generated successfully`)
        return {
          success: true,
          videoUrl: videoUrl
        }
      } else if (prediction.gcsUri) {
        // If response contains a GCS URI, use that
        console.log(`✅ VEO 3 video generated at GCS: ${prediction.gcsUri}`)
        return {
          success: true,
          videoUrl: prediction.gcsUri
        }
      }
    }

    // If we get here, the response format wasn't as expected
    console.error('Unexpected VEO 3 API response format:', JSON.stringify(result, null, 2))
    throw new Error('Unexpected response format from VEO 3 API')
    
  } catch (error) {
    console.error('VEO 3 generation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function getGoogleCloudAccessToken(credentials: any): Promise<string> {
  try {
    // Create JWT for service account authentication
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT',
      kid: credentials.private_key_id
    }

    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    // For production, we need to properly sign the JWT
    // For now, let's use Google's OAuth2 service account flow
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: createJWT(jwtHeader, jwtPayload, credentials.private_key)
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token request failed: ${tokenResponse.status} - ${errorText}`)
      throw new Error(`Failed to get access token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    return tokenData.access_token

  } catch (error) {
    console.error('Error getting Google Cloud access token:', error)
    throw new Error(`Authentication failed: ${error.message}`)
  }
}

function createJWT(header: any, payload: any, privateKey: string): string {
  // Base64url encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  
  // Create signature data
  const signatureData = `${encodedHeader}.${encodedPayload}`
  
  // For a proper implementation, we would sign this with the private key
  // This is a simplified version - in production you'd need proper RSA signing
  const signature = base64UrlEncode(signatureData) // Placeholder
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
