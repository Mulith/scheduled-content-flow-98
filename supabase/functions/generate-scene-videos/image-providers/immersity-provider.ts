
import { BaseImageProvider, ImageGenerationRequest, ImageGenerationResponse } from './base-provider.ts';

export class ImmersityProvider extends BaseImageProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('immersity', 'Immersity.ai');
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateDynamicImage(imageUrl: string): Promise<ImageGenerationResponse> {
    try {
      console.log(`🌟 Creating dynamic image with Immersity: ${imageUrl}`);

      const response = await fetch('https://api.immersity.ai/v1/disparity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_image_url: imageUrl,
          output_type: 'wiggle_gif',
          focus_point: 'auto',
          animation_amplitude: 0.5,
          animation_speed: 1.0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Immersity API error: ${response.status} - ${errorText}`);
        throw new Error(`Immersity API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Immersity dynamic image generation response received');

      if (result.output_url) {
        console.log(`✅ Generated dynamic image URL: ${result.output_url}`);
        
        return {
          success: true,
          imageUrl: result.output_url,
          providerId: this.id
        };
      } else {
        throw new Error('No dynamic image URL received from Immersity API');
      }

    } catch (error) {
      console.error('Immersity dynamic image generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }

  // Required by base class but not used directly
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Use generateDynamicImage method instead');
  }
}
