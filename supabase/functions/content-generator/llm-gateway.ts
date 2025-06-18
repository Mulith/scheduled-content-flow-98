
import { BaseLLMProvider, ContentGenerationRequest, LLMGenerationResponse } from './llm-providers/base-provider.ts';
import { GeminiLLMProvider } from './llm-providers/gemini-provider.ts';
import { OpenAILLMProvider } from './llm-providers/openai-provider.ts';
import { AnthropicLLMProvider } from './llm-providers/anthropic-provider.ts';

export class LLMGateway {
  private providers: BaseLLMProvider[] = [];
  private fallbackOrder: string[] = ['gemini', 'openai', 'anthropic'];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers based on available API keys
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (geminiApiKey) {
      this.providers.push(new GeminiLLMProvider(geminiApiKey));
      console.log('✅ Gemini LLM provider initialized');
    }

    if (openaiApiKey) {
      this.providers.push(new OpenAILLMProvider(openaiApiKey));
      console.log('✅ OpenAI LLM provider initialized');
    }

    if (anthropicApiKey) {
      this.providers.push(new AnthropicLLMProvider(anthropicApiKey));
      console.log('✅ Anthropic LLM provider initialized');
    }

    if (this.providers.length === 0) {
      console.warn('⚠️ No LLM providers available - check API keys');
    }
  }

  async generateContent(request: ContentGenerationRequest): Promise<LLMGenerationResponse> {
    if (this.providers.length === 0) {
      return {
        success: false,
        error: 'No LLM providers available'
      };
    }

    // Add randomization to the request to ensure unique content
    const enhancedRequest = {
      ...request,
      // Add a unique seed/variation to prevent identical content
      uniqueId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Add some randomization to the used topics to encourage variety
      usedTopics: [...request.usedTopics, `variation_${Math.floor(Math.random() * 1000)}`]
    };

    // Try providers in fallback order
    for (const providerId of this.fallbackOrder) {
      const provider = this.providers.find(p => p.providerId === providerId && p.isAvailable);
      
      if (!provider) {
        console.log(`⏭️ Skipping ${providerId} - not available`);
        continue;
      }

      console.log(`🔄 Attempting content generation with ${provider.name}`);
      
      try {
        const result = await provider.generateContent(enhancedRequest);
        
        if (result.success) {
          console.log(`✅ Content generation successful with ${provider.name}`);
          return result;
        } else {
          console.log(`❌ Content generation failed with ${provider.name}: ${result.error}`);
        }
      } catch (error) {
        console.error(`💥 Error with ${provider.name}:`, error);
      }
    }

    return {
      success: false,
      error: 'All LLM providers failed'
    };
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter(p => p.isAvailable)
      .map(p => `${p.name} (${p.providerId})`);
  }
}
