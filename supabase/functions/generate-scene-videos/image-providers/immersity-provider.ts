
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

      // Step 1: Create the disparity map/dynamic image
      const response = await fetch('https://api.immersity.ai/v1/disparity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_image_url: imageUrl,
          output_type: 'leia_image_format', // This creates the dynamic 3D effect
          focus_point: 'auto',
          animation_amplitude: 0.5
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Immersity API error: ${response.status} - ${errorText}`);
        
        // Check if it's an authentication error
        if (response.status === 401) {
          throw new Error('Invalid Immersity API key - please check your authentication');
        }
        
        throw new Error(`Immersity API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Immersity dynamic image generation response received:', result);

      // The API returns a task ID for processing
      if (result.task_id) {
        console.log(`📋 Immersity task created with ID: ${result.task_id}`);
        
        // Poll for completion (with timeout)
        const finalResult = await this.pollForCompletion(result.task_id);
        
        if (finalResult && finalResult.output_url) {
          console.log(`✅ Generated dynamic image URL: ${finalResult.output_url}`);
          
          return {
            success: true,
            imageUrl: finalResult.output_url,
            providerId: this.id
          };
        } else {
          throw new Error('Dynamic image processing failed or timed out');
        }
      } else if (result.output_url) {
        // Direct response with output URL
        console.log(`✅ Generated dynamic image URL: ${result.output_url}`);
        
        return {
          success: true,
          imageUrl: result.output_url,
          providerId: this.id
        };
      } else {
        throw new Error('No task ID or output URL received from Immersity API');
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

  private async pollForCompletion(taskId: string, maxAttempts: number = 30, delayMs: number = 2000): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 Polling Immersity task ${taskId}, attempt ${attempt + 1}/${maxAttempts}`);
        
        const response = await fetch(`https://api.immersity.ai/v1/disparity/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        });

        if (!response.ok) {
          console.error(`Error polling task: ${response.status}`);
          continue;
        }

        const result = await response.json();
        console.log(`📊 Task status:`, result.status);

        if (result.status === 'completed' && result.output_url) {
          return result;
        } else if (result.status === 'failed') {
          throw new Error(`Immersity processing failed: ${result.error || 'Unknown error'}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
      } catch (error) {
        console.error(`Error polling attempt ${attempt + 1}:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }
    
    throw new Error('Immersity processing timed out');
  }

  // Required by base class but not used directly
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Use generateDynamicImage method instead');
  }
}
