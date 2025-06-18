
import { BaseVideoProvider, VideoGenerationRequest, VideoGenerationResponse } from './base-provider.ts';

export class RunwayVideoProvider extends BaseVideoProvider {
  readonly providerId = 'runway';
  readonly name = 'Runway ML';
  readonly isAvailable = true;

  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🎬 Generating video with Runway: ${request.prompt.substring(0, 100)}...`);

      // Runway ML API call
      const response = await fetch('https://api.runwayml.com/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          model: 'gen3',
          duration: Math.min(10, request.duration), // Runway typically supports up to 10s
          resolution: '1280x768',
          seed: Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        videoUrl: result.video_url || `runway_video_${Date.now()}.mp4`,
        providerId: this.providerId
      };

    } catch (error) {
      console.error('Runway video generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.providerId
      };
    }
  }
}
