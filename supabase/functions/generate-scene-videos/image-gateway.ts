
import { BaseImageProvider, ImageGenerationRequest, ImageGenerationResponse } from './image-providers/base-provider.ts';
import { GeminiImageProvider } from './image-providers/gemini-provider.ts';
import { ImmersityProvider } from './image-providers/immersity-provider.ts';

export class ImageGenerationGateway {
  private providers: Map<string, BaseImageProvider> = new Map();
  private immersityProvider: ImmersityProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const immersityKey = Deno.env.get('IMMERSITY_API_KEY');

    console.log('🔑 Checking image generation API keys:', {
      gemini: !!geminiKey,
      immersity: !!immersityKey
    });

    if (geminiKey) {
      this.providers.set('gemini', new GeminiImageProvider(geminiKey));
      console.log('✅ Gemini image provider initialized');
    }

    if (immersityKey) {
      this.immersityProvider = new ImmersityProvider(immersityKey);
      console.log('✅ Immersity provider initialized');
    }

    if (this.providers.size === 0) {
      console.warn('⚠️ No image providers available - check API keys');
    }
  }

  async generateDynamicImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.log(`🎨 Image Gateway: Starting dynamic image generation`);
    console.log(`📝 Request prompt: ${request.prompt.substring(0, 100)}...`);

    // Step 1: Generate base image with Gemini
    const geminiProvider = this.providers.get('gemini');
    if (!geminiProvider || !geminiProvider.isAvailable) {
      return {
        success: false,
        error: 'Gemini image provider not available - please check your GEMINI_API_KEY',
        providerId: 'gateway'
      };
    }

    console.log('🎨 Generating base image with Gemini...');
    const baseImageResult = await geminiProvider.generateImage(request);
    
    if (!baseImageResult.success || !baseImageResult.imageUrl) {
      console.error('❌ Base image generation failed:', baseImageResult.error);
      return {
        success: false,
        error: `Base image generation failed: ${baseImageResult.error}`,
        providerId: 'gateway'
      };
    }

    console.log('✅ Base image generated successfully:', baseImageResult.imageUrl);

    // Step 2: Create dynamic image with Immersity (if available)
    if (this.immersityProvider && this.immersityProvider.isAvailable) {
      console.log('🌟 Creating dynamic image with Immersity...');
      
      try {
        const dynamicResult = await this.immersityProvider.generateDynamicImage(baseImageResult.imageUrl);
        
        if (dynamicResult.success && dynamicResult.imageUrl) {
          console.log('✅ Dynamic image generated successfully:', dynamicResult.imageUrl);
          return dynamicResult;
        } else {
          console.log('⚠️ Dynamic image generation failed, returning base image:', dynamicResult.error);
          // Return base image if dynamic generation fails
          return baseImageResult;
        }
      } catch (error) {
        console.error('💥 Immersity processing error:', error);
        console.log('⚠️ Falling back to base image');
        return baseImageResult;
      }
    } else {
      console.log('⚠️ Immersity provider not available, returning base image');
      console.log('💡 To enable dynamic images, please add your IMMERSITY_API_KEY');
      return baseImageResult;
    }
  }

  getAvailableProviders(): Array<{id: string, name: string, isAvailable: boolean}> {
    const providers = Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name || id,
      isAvailable: provider.isAvailable
    }));

    if (this.immersityProvider) {
      providers.push({
        id: 'immersity',
        name: 'Immersity.ai',
        isAvailable: this.immersityProvider.isAvailable
      });
    }

    return providers;
  }
}
