
import { BaseVideoProvider, VideoGenerationRequest, VideoGenerationResponse } from './base-provider.ts';

export class RunwayVideoProvider extends BaseVideoProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('runway', 'Runway ML');
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🎬 Generating video with Runway: ${request.prompt.substring(0, 100)}...`);

      // Runway ML Gen-3 API call - updated to use the correct API format
      const response = await fetch('https://api.runwayml.com/v1/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskType: 'gen3a_turbo',
          internal: false,
          options: {
            promptText: request.prompt,
            duration: Math.min(10, Math.max(5, request.duration)), // Runway supports 5-10 seconds
            ratio: request.aspectRatio === '16:9' ? '16:9' : '1:1',
            seed: Math.floor(Math.random() * 1000000),
            watermark: false
          }
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

      console.log('✅ Runway API response:', result);
      
      // Runway returns a task that we need to poll for completion
      // For now, we'll return the task ID - in production you'd poll for completion
      if (result.id) {
        return {
          success: true,
          videoUrl: `runway_task_${result.id}`,
          providerId: this.id
        };
      } else {
        throw new Error('No task ID received from Runway API');
      }

    } catch (error) {
      console.error('Runway video generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
