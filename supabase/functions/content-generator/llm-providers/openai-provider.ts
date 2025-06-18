
import { BaseLLMProvider, ContentGenerationRequest, LLMGenerationResponse } from './base-provider.ts';

export class OpenAILLMProvider extends BaseLLMProvider {
  readonly providerId = 'openai';
  readonly name = 'OpenAI GPT';
  readonly isAvailable = true;

  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateContent(request: ContentGenerationRequest): Promise<LLMGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🧠 Generating content with OpenAI for channel: ${request.channel.name}`);

      const prompt = this.buildPrompt(request);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert content creator specializing in engaging short-form video content. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 4096,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No content generated from OpenAI');
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
      console.error('OpenAI content generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.providerId
      };
    }
  }
}
