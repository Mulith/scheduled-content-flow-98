
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

    if (replicateKey) {
      this.providers.set('replicate', new ReplicateVideoProvider(replicateKey));
    }

    if (runwayKey) {
      this.providers.set('runway', new RunwayVideoProvider(runwayKey));
    }

    if (pikaKey) {
      this.providers.set('pika', new PikaVideoProvider(pikaKey));
    }

    // Always have mock provider for development/testing
    this.providers.set('mock', new MockVideoProvider());
  }

  private determinePrimaryProvider(): string {
    // Priority order: Runway > Replicate > Pika > Mock
    const priorityOrder = ['runway', 'replicate', 'pika', 'mock'];
    
    for (const providerId of priorityOrder) {
      if (this.providers.has(providerId)) {
        return providerId;
      }
    }
    
    return 'mock'; // Fallback to mock
  }

  private determineFallbackProviders(): string[] {
    const allProviders = Array.from(this.providers.keys());
    return allProviders.filter(id => id !== this.primaryProvider);
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    console.log(`🎬 Video Gateway: Starting generation with primary provider: ${this.primaryProvider}`);
    
    // Try primary provider first
    const primaryResult = await this.tryProvider(this.primaryProvider, request);
    if (primaryResult.success) {
      console.log(`✅ Video generated successfully with ${this.primaryProvider}`);
      return primaryResult;
    }

    console.log(`❌ Primary provider ${this.primaryProvider} failed: ${primaryResult.error}`);

    // Try fallback providers
    for (const fallbackId of this.fallbackProviders) {
      console.log(`🔄 Trying fallback provider: ${fallbackId}`);
      
      const fallbackResult = await this.tryProvider(fallbackId, request);
      if (fallbackResult.success) {
        console.log(`✅ Video generated successfully with fallback provider: ${fallbackId}`);
        return fallbackResult;
      }
      
      console.log(`❌ Fallback provider ${fallbackId} failed: ${fallbackResult.error}`);
    }

    // All providers failed
    return {
      success: false,
      error: 'All video generation providers failed',
      providerId: 'gateway'
    };
  }

  private async tryProvider(providerId: string, request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerId} not available`,
        providerId
      };
    }

    if (!provider.isAvailable) {
      return {
        success: false,
        error: `Provider ${providerId} is not available`,
        providerId
      };
    }

    try {
      return await provider.generateVideo(request);
    } catch (error) {
      return {
        success: false,
        error: `Provider ${providerId} error: ${error.message}`,
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
