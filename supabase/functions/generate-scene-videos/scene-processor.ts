
import { ImageGenerationGateway } from './image-gateway.ts';
import { DatabaseOperations } from './database-operations.ts';

export class SceneProcessor {
  private imageGateway: ImageGenerationGateway;
  private dbOps: DatabaseOperations;

  constructor(dbOps: DatabaseOperations) {
    this.dbOps = dbOps;
    this.imageGateway = new ImageGenerationGateway();
  }

  async processScene(scene: any) {
    try {
      console.log(`🎨 Generating image for scene ${scene.scene_number} (ID: ${scene.id})`);

      const sceneVideoId = await this.dbOps.getOrCreateSceneVideo(scene.id);

      // Generate dynamic image using the image gateway
      const result = await this.imageGateway.generateDynamicImage({
        prompt: scene.visual_description,
        aspectRatio: '16:9',
        quality: 'standard'
      });

      console.log(`📊 Generation result for scene ${scene.scene_number}:`, {
        success: result.success,
        hasUrl: !!result.imageUrl,
        providerId: result.providerId,
        error: result.error
      });

      if (result.success && result.imageUrl) {
        await this.dbOps.updateSceneVideo(sceneVideoId, {
          video_url: result.imageUrl,
          video_status: 'completed'
        });

        console.log(`✅ Successfully updated database for scene ${scene.scene_number}`);
        return { success: true };
      } else {
        await this.dbOps.updateSceneVideo(sceneVideoId, {
          video_status: 'failed',
          error_message: result.error
        });

        console.error(`❌ Generation failed for scene ${scene.scene_number}: ${result.error}`);
        return { success: false, error: result.error };
      }

    } catch (sceneError) {
      console.error(`💥 Error processing scene ${scene.scene_number}:`, sceneError);
      return { success: false, error: sceneError.message };
    }
  }

  async processAllScenes(scenes: any[]) {
    console.log(`📝 Found ${scenes.length} scenes to generate images for`);

    let successCount = 0;
    let failCount = 0;

    for (const scene of scenes) {
      const result = await this.processScene(scene);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  }

  getAvailableProviders() {
    return this.imageGateway.getAvailableProviders();
  }
}
