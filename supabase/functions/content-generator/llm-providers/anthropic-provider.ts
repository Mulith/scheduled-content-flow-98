
import { BaseLLMProvider } from './base-provider.ts';
import { ContentGenerationRequest, LLMGenerationResponse } from './types.ts';

export class AnthropicLLMProvider extends BaseLLMProvider {
  readonly providerId = 'anthropic';
  readonly name = 'Anthropic Claude';
  readonly isAvailable = true;

  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateContent(request: ContentGenerationRequest): Promise<LLMGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🧠 Generating content with Anthropic for channel: ${request.channel.name}`);

      const prompt = this.buildPrompt(request);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'x-api-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4096,
          temperature: 0.8,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.content?.[0]?.text;

      if (!generatedText) {
        throw new Error('No content generated from Anthropic');
      }

      const content = this.parseResponse(generatedText);
      
      // Ensure duration is correct
      content.duration_seconds = request.targetDuration;

      return {
        success: true,
        content,
        providerId: this.providerId
      };

    } catch (error) {
      console.error('Anthropic content generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.providerId
      };
    }
  }
}
