
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

      // Runway gen4_image API call with correct endpoint  
      const response = await fetch('https://api.runwayml.com/v1/text_to_image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06'
        },
        body: JSON.stringify({
          model: 'gen4_image',
          promptText: request.prompt,
          ratio: request.aspectRatio === '16:9' ? '1344:768' : '1024:1024'
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
      
      // Check for the correct response format from Runway
      if (result.data && result.data.length > 0 && result.data[0].url) {
        const imageUrl = result.data[0].url;
        console.log(`🖼️ Generated image URL: ${imageUrl}`);
        
        return {
          success: true,
          imageUrl: imageUrl,
          providerId: this.id
        };
      } else if (result.url) {
        // Alternative response format
        console.log(`🖼️ Generated image URL: ${result.url}`);
        
        return {
          success: true,
          imageUrl: result.url,
          providerId: this.id
        };
      } else {
        console.error('Unexpected Runway response format:', result);
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
