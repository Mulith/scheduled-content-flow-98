
import { BaseImageProvider, ImageGenerationRequest, ImageGenerationResponse } from './base-provider.ts';

export class GeminiImageProvider extends BaseImageProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('gemini', 'Google Gemini');
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🎨 Generating image with Gemini: ${request.prompt.substring(0, 100)}...`);

      // Try Vertex AI first if we have service account credentials
      const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY');
      const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID');
      
      if (serviceAccountKey && projectId) {
        try {
          console.log('🔑 Using Vertex AI with service account credentials');
          return await this.generateImageWithVertexAI(request, serviceAccountKey, projectId);
        } catch (vertexError) {
          console.error('❌ Vertex AI failed, falling back to Generative Language API:', vertexError);
        }
      } else {
        console.log('⚠️ Vertex AI credentials not configured, using Generative Language API');
        console.log('Missing:', { serviceAccount: !serviceAccountKey, projectId: !projectId });
      }

      // Fall back to Generative Language API with corrected endpoint
      return await this.generateImageWithGenerativeAPI(request);

    } catch (error) {
      console.error('Gemini image generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }

  private async generateImageWithVertexAI(request: ImageGenerationRequest, serviceAccountKey: string, projectId: string): Promise<ImageGenerationResponse> {
    // Parse the service account key
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    // Get OAuth2 access token using the correct method
    const accessToken = await this.getVertexAIAccessToken(serviceAccount);
    
    const location = 'us-central1';
    const vertexEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;
    
    console.log(`🌐 Calling Vertex AI endpoint: ${vertexEndpoint}`);
    
    const response = await fetch(vertexEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: request.prompt
          }
        ],
        parameters: {
          aspectRatio: request.aspectRatio || '16:9',
          negativePrompt: 'blurry, low quality, distorted, watermark, text, signature',
          sampleCount: 1,
          mode: 'speed',
          safetyFilterLevel: 'BLOCK_ONLY_HIGH'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Vertex AI API error: ${response.status} - ${errorText}`);
      throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Vertex AI image generation response received');

    if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
      const imageData = result.predictions[0].bytesBase64Encoded;
      const imageUrl = `data:image/png;base64,${imageData}`;
      console.log(`✅ Generated image with Vertex AI (base64 length: ${imageData.length})`);
      
      return {
        success: true,
        imageUrl: imageUrl,
        providerId: this.id
      };
    } else {
      throw new Error('No image data received from Vertex AI');
    }
  }

  private async getVertexAIAccessToken(serviceAccount: any): Promise<string> {
    // Create a proper JWT for Google OAuth2
    const now = Math.floor(Date.now() / 1000);
    
    // Use Google's OAuth2 token endpoint with service account
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await this.createJWT(serviceAccount, now)
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  }

  private async createJWT(serviceAccount: any, now: number): Promise<string> {
    // For simplicity, we'll use a workaround since proper JWT signing is complex in Deno
    // This is a simplified approach - in production, use a proper JWT library
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    // For now, throw an error to force fallback to Generative Language API
    // In production, implement proper RS256 signing
    throw new Error('JWT signing not implemented - using fallback API');
  }

  private async generateImageWithGenerativeAPI(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log(`🎨 Using Generative Language API: ${request.prompt.substring(0, 100)}...`);

      // Updated endpoint - try the correct Gemini API endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${request.prompt}. Make it ${request.aspectRatio || '16:9'} aspect ratio, high quality, detailed, and professional.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Generative Language API error: ${response.status} - ${errorText}`);
        
        if (response.status === 401) {
          throw new Error(`Gemini API authentication failed. Please check your GEMINI_API_KEY`);
        } else if (response.status === 404) {
          throw new Error(`Gemini API endpoint not found. Image generation may not be available with your current API key or region.`);
        } else {
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('📝 Gemini text response received - note: this is text generation, not image generation');
      
      // Since Gemini's text API doesn't generate images, we'll create a placeholder response
      // This indicates we need a different approach for image generation
      throw new Error('Gemini Generative Language API does not support image generation. Please configure Vertex AI properly or use a different image provider.');

    } catch (error) {
      console.error('❌ Generative Language API error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
