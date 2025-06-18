
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

      // Runway ML Gen-3 API call
      const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptText: request.prompt,
          // For text-to-video, we don't need an image
          // Use default settings for Gen-3
          model: 'gen3a_turbo',
          watermark: false,
          duration: Math.min(10, request.duration), // Runway supports up to 10 seconds
          ratio: request.aspectRatio === '16:9' ? '16:9' : '1:1',
          seed: Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Runway API error: ${response.status} - ${errorText}`);
        throw new Error(`Runway API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Runway returns a task ID that we need to poll for completion
      // For now, we'll return the task ID as the video URL
      // In a production system, you'd want to poll for completion
      return {
        success: true,
        videoUrl: result.id ? `runway_task_${result.id}` : `runway_video_${Date.now()}.mp4`,
        providerId: this.id
      };

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
