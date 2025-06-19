
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
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Gemini image generation response received');

      if (result.candidates && result.candidates[0]?.image?.imageUri) {
        const imageUrl = result.candidates[0].image.imageUri;
        console.log(`✅ Generated image URL: ${imageUrl}`);
        
        return {
          success: true,
          imageUrl: imageUrl,
          providerId: this.id
        };
      } else {
        throw new Error('No image URL received from Gemini API');
      }

    } catch (error) {
      console.error('Gemini image generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
