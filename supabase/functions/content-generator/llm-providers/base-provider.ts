
import { ContentGenerationRequest, GeneratedContent, LLMGenerationResponse } from './types.ts';
import { buildPrompt } from './prompt-builder.ts';
import { parseResponse } from './response-parser.ts';

export abstract class BaseLLMProvider {
  abstract readonly providerId: string;
  abstract readonly name: string;
  abstract readonly isAvailable: boolean;

  abstract generateContent(request: ContentGenerationRequest): Promise<LLMGenerationResponse>;

  protected validateRequest(request: ContentGenerationRequest): void {
    if (!request.channel) {
      throw new Error('Channel is required');
    }
    if (!request.targetDuration || request.targetDuration <= 0) {
      throw new Error('Target duration must be greater than 0');
    }
  }

  protected buildPrompt(request: ContentGenerationRequest): string {
    return buildPrompt(request);
  }

  protected parseResponse(responseText: string): GeneratedContent {
    return parseResponse(responseText);
  }
}
