
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

      // Using Vertex AI endpoint for Imagen 3
      const projectId = 'your-project-id'; // This should be configured
      const location = 'us-central1'; // or your preferred region
      
      // For now, let's try the direct Vertex AI REST API
      const response = await fetch(`https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
        console.error(`Vertex AI Gemini API error: ${response.status} - ${errorText}`);
        
        // Fall back to the original Generative Language API if Vertex AI fails
        console.log('🔄 Falling back to Generative Language API...');
        return await this.generateImageWithGenerativeAPI(request);
      }

      const result = await response.json();
      console.log('✅ Vertex AI Gemini image generation response received');

      if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
        // Convert base64 to data URL
        const imageData = result.predictions[0].bytesBase64Encoded;
        const imageUrl = `data:image/png;base64,${imageData}`;
        console.log(`✅ Generated image (base64 length: ${imageData.length})`);
        
        return {
          success: true,
          imageUrl: imageUrl,
          providerId: this.id
        };
      } else {
        throw new Error('No image data received from Vertex AI Gemini API');
      }

    } catch (error) {
      console.error('Vertex AI Gemini image generation error:', error);
      console.log('🔄 Falling back to Generative Language API...');
      return await this.generateImageWithGenerativeAPI(request);
    }
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
