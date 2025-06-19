
export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: '16:9' | '1:1' | '9:16';
  quality?: 'standard' | 'high';
  style?: 'photographic' | 'digital_art' | 'comic_book' | 'fantasy_art' | 'line_art' | 'origami';
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  providerId: string;
}

export abstract class BaseImageProvider {
  protected id: string;
  protected name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract get isAvailable(): boolean;
  abstract generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;

  protected validateRequest(request: ImageGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }
    if (request.prompt.length > 1000) {
      throw new Error('Prompt too long (max 1000 characters)');
    }
  }
}
