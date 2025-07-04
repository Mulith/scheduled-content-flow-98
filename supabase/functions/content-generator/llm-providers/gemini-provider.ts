
import { BaseLLMProvider } from './base-provider.ts';
import { ContentGenerationRequest, LLMGenerationResponse } from './types.ts';

export class GeminiLLMProvider extends BaseLLMProvider {
  readonly providerId = 'gemini';
  readonly name = 'Google Gemini';
  readonly isAvailable = true;

  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateContent(request: ContentGenerationRequest): Promise<LLMGenerationResponse> {
    try {
      this.validateRequest(request);
      
      console.log(`🧠 Generating content with Gemini for channel: ${request.channel.name}`);

      const prompt = this.buildPrompt(request);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No content generated from Gemini');
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
      console.error('Gemini content generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.providerId
      };
    }
  }
}
