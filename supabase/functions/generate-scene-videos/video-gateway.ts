
import { BaseVideoProvider, VideoGenerationRequest, VideoGenerationResponse } from './video-providers/base-provider.ts';
import { ReplicateVideoProvider } from './video-providers/replicate-provider.ts';
import { RunwayVideoProvider } from './video-providers/runway-provider.ts';
import { PikaVideoProvider } from './video-providers/pika-provider.ts';
import { MockVideoProvider } from './video-providers/mock-provider.ts';

export class VideoGenerationGateway {
  private providers: Map<string, BaseVideoProvider> = new Map();
  private primaryProvider: string;
  private fallbackProviders: string[];

  constructor() {
    this.initializeProviders();
    this.primaryProvider = this.determinePrimaryProvider();
    this.fallbackProviders = this.determineFallbackProviders();
  }

  private initializeProviders() {
    // Initialize providers based on available API keys
    const replicateKey = Deno.env.get('REPLICATE_API_KEY');
    const runwayKey = Deno.env.get('RUNWAY_API_KEY');
    const pikaKey = Deno.env.get('PIKA_API_KEY');

    console.log('🔑 Checking API keys:', {
      replicate: !!replicateKey,
      runway: !!runwayKey,
      pika: !!pikaKey
    });

    if (replicateKey) {
      this.providers.set('replicate', new ReplicateVideoProvider(replicateKey));
      console.log('✅ Replicate provider initialized');
    }

    if (runwayKey) {
      this.providers.set('runway', new RunwayVideoProvider(runwayKey));
      console.log('✅ Runway provider initialized');
    }

    if (pikaKey) {
      this.providers.set('pika', new PikaVideoProvider(pikaKey));
      console.log('✅ Pika provider initialized');
    }

    // Always have mock provider for development/testing
    this.providers.set('mock', new MockVideoProvider());
    console.log('✅ Mock provider initialized');
  }

  private determinePrimaryProvider(): string {
    // Priority order: Runway > Replicate > Pika > Mock
    const priorityOrder = ['runway', 'replicate', 'pika', 'mock'];
    
    for (const providerId of priorityOrder) {
      const provider = this.providers.get(providerId);
      if (provider && provider.isAvailable) {
        console.log(`🎯 Selected primary provider: ${providerId}`);
        return providerId;
      }
    }
    
    console.log('⚠️ Falling back to mock provider');
    return 'mock'; // Fallback to mock
  }

  private determineFallbackProviders(): string[] {
    const allProviders = Array.from(this.providers.keys());
    const fallbacks = allProviders.filter(id => {
      const provider = this.providers.get(id);
      return id !== this.primaryProvider && provider && provider.isAvailable;
    });
    
    console.log(`📋 Fallback providers: ${fallbacks.join(', ')}`);
    return fallbacks;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    console.log(`🎬 Video Gateway: Starting generation with primary provider: ${this.primaryProvider}`);
    console.log(`📝 Request details:`, {
      prompt: request.prompt.substring(0, 100) + '...',
      duration: request.duration,
      aspectRatio: request.aspectRatio
    });
    
    // Try primary provider first
    const primaryResult = await this.tryProvider(this.primaryProvider, request);
    if (primaryResult.success) {
      console.log(`✅ Video generated successfully with ${this.primaryProvider}`);
      console.log(`🔗 Generated URL: ${primaryResult.videoUrl}`);
      return primaryResult;
    }

    console.log(`❌ Primary provider ${this.primaryProvider} failed: ${primaryResult.error}`);

    // Try fallback providers
    for (const fallbackId of this.fallbackProviders) {
      console.log(`🔄 Trying fallback provider: ${fallbackId}`);
      
      const fallbackResult = await this.tryProvider(fallbackId, request);
      if (fallbackResult.success) {
        console.log(`✅ Video generated successfully with fallback provider: ${fallbackId}`);
        console.log(`🔗 Generated URL: ${fallbackResult.videoUrl}`);
        return fallbackResult;
      }
      
      console.log(`❌ Fallback provider ${fallbackId} failed: ${fallbackResult.error}`);
    }

    // All providers failed
    console.log('💥 All video generation providers failed');
    return {
      success: false,
      error: 'All video generation providers failed',
      providerId: 'gateway'
    };
  }

  private async tryProvider(providerId: string, request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      const error = `Provider ${providerId} not available`;
      console.log(`❌ ${error}`);
      return {
        success: false,
        error,
        providerId
      };
    }

    if (!provider.isAvailable) {
      const error = `Provider ${providerId} is not available (missing API key)`;
      console.log(`❌ ${error}`);
      return {
        success: false,
        error,
        providerId
      };
    }

    try {
      console.log(`🚀 Calling ${providerId} provider...`);
      const result = await provider.generateVideo(request);
      console.log(`📊 ${providerId} provider result:`, {
        success: result.success,
        hasUrl: !!result.videoUrl,
        error: result.error
      });
      return result;
    } catch (error) {
      const errorMessage = `Provider ${providerId} error: ${error.message}`;
      console.error(`💥 ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
        providerId
      };
    }
  }

  getAvailableProviders(): Array<{id: string, name: string, isAvailable: boolean}> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
      isAvailable: provider.isAvailable
    }));
  }

  getCurrentConfiguration(): {primary: string, fallbacks: string[]} {
    return {
      primary: this.primaryProvider,
      fallbacks: this.fallbackProviders
    };
  }
}
