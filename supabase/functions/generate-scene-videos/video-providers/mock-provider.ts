
import { BaseVideoProvider, VideoGenerationRequest, VideoGenerationResponse } from './base-provider.ts';

export class MockVideoProvider extends BaseVideoProvider {
  constructor() {
    super('mock', 'Mock Provider (Development)');
  }

  get isAvailable(): boolean {
    return true; // Always available for development
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    console.log(`🎬 Mock generating video: ${request.prompt.substring(0, 100)}...`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a working video URL using a public video file
    // Using a sample video from the internet that actually exists
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ];
    
    // Select a random sample video
    const randomIndex = Math.floor(Math.random() * sampleVideos.length);
    const videoUrl = sampleVideos[randomIndex];

    return {
      success: true,
      videoUrl: videoUrl,
      providerId: this.id
    };
  }
}
