
export interface VideoGenerationRequest {
  prompt: string;
  duration: number;
  aspectRatio?: string;
  quality?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  providerId?: string;
}

export abstract class BaseVideoProvider {
  abstract readonly providerId: string;
  abstract readonly name: string;
  abstract readonly isAvailable: boolean;

  abstract generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;

  protected validateRequest(request: VideoGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }
    if (!request.duration || request.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
  }
}
