
import { BaseVideoProvider, VideoGenerationRequest, VideoGenerationResponse } from './base-provider.ts';

export class MockVideoProvider extends BaseVideoProvider {
  readonly providerId = 'mock';
  readonly name = 'Mock Provider (Development)';
  readonly isAvailable = true;

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🎬 Mock generating video: ${request.prompt.substring(0, 100)}...`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate some failures for testing
      if (Math.random() < 0.1) {
        throw new Error('Mock generation failure for testing');
      }
      
      return {
        success: true,
        videoUrl: `https://example.com/mock_video_${Date.now()}.mp4`,
        providerId: this.providerId
      };

    } catch (error) {
      console.error('Mock video generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.providerId
      };
    }
  }
}
