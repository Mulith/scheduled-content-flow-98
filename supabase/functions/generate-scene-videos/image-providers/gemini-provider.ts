
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
      
      console.log(`🎨 Generating image with Gemini Vertex AI: ${request.prompt.substring(0, 100)}...`);

      // Try Vertex AI first if we have service account credentials
      const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY');
      const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID') || 'your-project-id';
      
      if (serviceAccountKey && projectId !== 'your-project-id') {
        try {
          return await this.generateImageWithVertexAI(request, serviceAccountKey, projectId);
        } catch (vertexError) {
          console.error('Vertex AI failed, falling back to Generative Language API:', vertexError);
        }
      } else {
        console.log('⚠️ Vertex AI credentials not configured, using Generative Language API');
      }

      // Fall back to Generative Language API
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
    
    // Get OAuth2 access token
    const accessToken = await this.getVertexAIAccessToken(serviceAccount);
    
    const location = 'us-central1'; // You can make this configurable
    
    const response = await fetch(`https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`, {
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
      console.error(`Vertex AI API error: ${response.status} - ${errorText}`);
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
    // Create JWT for Google OAuth2
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    // Simple JWT encoding (for production, consider using a proper JWT library)
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payloadStr = btoa(JSON.stringify(payload));
    
    // For now, we'll use the API key approach as JWT signing is complex
    // In a real implementation, you'd need to properly sign the JWT with the private key
    throw new Error('Vertex AI OAuth2 not fully implemented - falling back to Generative Language API');
  }

  private async generateImageWithGenerativeAPI(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log(`🎨 Using Generative Language API fallback: ${request.prompt.substring(0, 100)}...`);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          config: {
            aspectRatio: request.aspectRatio || '16:9',
            negativePrompt: 'blurry, low quality, distorted, watermark, text, signature',
            sampleCount: 1,
            mode: 'speedFirst',
            safetyFilterLevel: 'BLOCK_ONLY_HIGH',
            personGeneration: 'ALLOW_ADULT'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Generative Language API error: ${response.status} - ${errorText}`);
        
        if (response.status === 401) {
          throw new Error(`Gemini API authentication failed. Please check your GEMINI_API_KEY`);
        } else if (response.status === 404) {
          throw new Error(`Gemini API endpoint not found. The imagen model may not be available in your region or the API endpoint may have changed`);
        } else {
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.image?.imageUri) {
        const imageUrl = result.candidates[0].image.imageUri;
        console.log(`✅ Generated image URL: ${imageUrl}`);
        
        return {
          success: true,
          imageUrl: imageUrl,
          providerId: this.id
        };
      } else {
        throw new Error('No image URL received from Generative Language API');
      }

    } catch (error) {
      console.error('Generative Language API error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
