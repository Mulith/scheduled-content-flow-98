
import { BaseImageProvider } from './base-provider.ts';

export class RunwayImageProvider extends BaseImageProvider {
  apiKey;

  constructor(apiKey) {
    super('runway', 'Runway ML');
    this.apiKey = apiKey;
  }

  get isAvailable() {
    return !!this.apiKey;
  }

  async generateImage(request) {
    try {
      this.validateRequest(request);
      console.log(`🎨 Kicking off Runway image generation: ${request.prompt.substring(0, 100)}...`);

      // Step 1: Start the generation task
      const startResponse = await fetch('https://api.dev.runwayml.com/v1/text_to_image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06'
        },
        body: JSON.stringify({
          model: 'gen4_image',
          promptText: request.prompt,
          ratio: request.aspectRatio === '16:9' ? '1280:720' : '1024:1024'
        })
      });

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        console.error(`Runway API error on task creation: ${startResponse.status} - ${errorText}`);
        throw new Error(`Runway API error: ${startResponse.status} - ${errorText}`);
      }

      const startResult = await startResponse.json();
      const taskId = startResult.id;

      if (!taskId) {
        console.error('Runway did not return a task ID.', startResult);
        throw new Error('Runway did not return a task ID.');
      }

      console.log(`✅ Runway task started with ID: ${taskId}`);

      // Step 2: Poll for the result
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const maxAttempts = 60;
      const pollInterval = 5000; // 5 seconds

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Polling Runway task ${taskId}, attempt ${attempt}...`);

        const pollResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Runway-Version': '2024-11-06'
          }
        });

        if (!pollResponse.ok) {
          // Don't throw immediately, maybe a temporary server issue
          console.warn(`Runway task polling failed with status ${pollResponse.status}. Retrying...`);
          await sleep(pollInterval);
          continue;
        }

        const pollResult = await pollResponse.json();

        if (pollResult.status === 'SUCCEEDED') {
          if (pollResult.output && Array.isArray(pollResult.output) && pollResult.output.length > 0 && typeof pollResult.output[0] === 'string') {
            const imageUrl = pollResult.output[0];
            console.log(`✅ Runway task ${taskId} succeeded! Image URL: ${imageUrl}`);
            return {
              success: true,
              imageUrl: imageUrl,
              providerId: this.id
            };
          } else {
            console.error('Runway task succeeded but the output format is unexpected.', pollResult);
            throw new Error('Runway task succeeded but the output format is unexpected.');
          }
        } else if (pollResult.status === 'FAILED') {
          const errorMessage = pollResult.error || 'Unknown error';
          console.error(`❌ Runway task ${taskId} failed:`, errorMessage);
          throw new Error(`Runway task failed: ${errorMessage}`);
        }

        // If status is PENDING or RUNNING, wait and poll again
        await sleep(pollInterval);
      }

      throw new Error(`Runway task ${taskId} timed out after ${maxAttempts * pollInterval / 1000} seconds.`);

    } catch (error) {
      console.error('Runway image generation error:', error);
      return {
        success: false,
        error: error.message,
        providerId: this.id
      };
    }
  }
}
