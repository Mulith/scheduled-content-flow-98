
import { BaseVideoProvider, VideoGenerationRequest, VideoGenerationResponse } from './base-provider.ts';

export class VEO2VideoProvider extends BaseVideoProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('veo2', 'Google VEO2');
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🎬 Generating video with VEO2: ${request.prompt.substring(0, 100)}...`);

      // Google Vertex AI VEO2 API call
      const response = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/video-generation/locations/us-central1/publishers/google/models/veo-2:generateContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: request.prompt
            }]
          }],
          generationConfig: {
            responseModalities: ["VIDEO"],
            videoDuration: `${Math.min(10, Math.max(5, request.duration))}s`,
            videoAspectRatio: request.aspectRatio === '16:9' ? '16:9' : '1:1'
          }
        })
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`VEO2 API error: ${response.status} - ${responseText}`);
        throw new Error(`VEO2 API error: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse VEO2 response:', responseText);
        throw new Error(`Invalid JSON response from VEO2: ${responseText}`);
      }

      console.log('✅ VEO2 API response:', result);
      
      // VEO2 returns the video content in the response
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.videoMetadata) {
        const videoUrl = result.candidates[0].content.parts[0].videoMetadata.videoUrl || 
                        result.candidates[0].content.parts[0].fileData?.fileUri;
        
        if (videoUrl) {
          return {
            success: true,
            videoUrl: videoUrl,
            providerId: this.id
          };
        }
      }
      
      throw new Error('No video URL received from VEO2 API');

    } catch (error) {
      console.error('VEO2 video generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
