
import { BaseImageProvider, ImageGenerationRequest, ImageGenerationResponse } from './base-provider.ts';

export class RunwayImageProvider extends BaseImageProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('runway', 'Runway ML');
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🎨 Generating image with Runway gen4_image: ${request.prompt.substring(0, 100)}...`);

      // Runway gen4_image API call
      const response = await fetch('https://api.runwayml.com/v1/image/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gen4_image',
          prompt: request.prompt,
          width: request.aspectRatio === '16:9' ? 1344 : 1024,
          height: request.aspectRatio === '16:9' ? 768 : 1024,
          num_images: 1,
          guidance_scale: 7.5,
          inference_steps: 25
        })
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Runway API error: ${response.status} - ${responseText}`);
        throw new Error(`Runway API error: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Runway response:', responseText);
        throw new Error(`Invalid JSON response from Runway: ${responseText}`);
      }

      console.log('✅ Runway gen4_image API response received');
      
      // Runway gen4_image returns images directly in the response
      if (result.images && result.images.length > 0) {
        const imageUrl = result.images[0].url;
        console.log(`🖼️ Generated image URL: ${imageUrl}`);
        
        return {
          success: true,
          imageUrl: imageUrl,
          providerId: this.id
        };
      } else {
        throw new Error('No images returned from Runway gen4_image API');
      }

    } catch (error) {
      console.error('Runway image generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
