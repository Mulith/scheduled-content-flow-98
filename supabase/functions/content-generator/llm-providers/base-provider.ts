export interface ContentGenerationRequest {
  channel: any;
  usedTopics: string[];
  targetDuration: number;
  uniqueId?: string; // Add unique identifier for each request
}

export interface GeneratedContent {
  title: string;
  script: string;
  duration_seconds: number;
  topic_keywords: string[];
  scenes: {
    scene_number: number;
    start_time_seconds: number;
    end_time_seconds: number;
    visual_description: string;
    narration_text: string;
  }[];
}

export interface LLMGenerationResponse {
  success: boolean;
  content?: GeneratedContent;
  error?: string;
  providerId?: string;
}

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
    const { channel, usedTopics, targetDuration, uniqueId } = request;
    
    const videoTypes = Array.isArray(channel.selected_video_types) 
      ? channel.selected_video_types.join(', ') 
      : channel.selected_video_types;

    const topics = Array.isArray(channel.selected_topics) 
      ? channel.selected_topics.join(', ') 
      : channel.selected_topics || 'general productivity and motivation';

    // Create topic guidance based on topic mode
    let topicGuidance = '';
    switch (channel.topic_mode) {
      case 'predefined':
        topicGuidance = `You MUST create content strictly about these specific topics: ${topics}. Do not deviate from these topics.`;
        break;
      case 'manual':
        topicGuidance = `Focus primarily on these topics: ${topics}, but you have some flexibility to explore related subtopics if they add value.`;
        break;
      case 'ai-decide':
      default:
        topicGuidance = `You have complete creative freedom to choose engaging topics. These are suggested areas for inspiration: ${topics}, but feel free to explore any relevant and valuable content topics.`;
        break;
    }

    // Add variety and uniqueness instructions
    const varietyInstructions = `
IMPORTANT: Create UNIQUE and DIVERSE content. 
- Use different angles, perspectives, and approaches
- Vary your tone, style, and format
- Explore different aspects of the topic
- Be creative and original
- Avoid repetitive patterns or formulaic content
- Each piece should feel fresh and distinct
${uniqueId ? `- Content ID: ${uniqueId}` : ''}
`;

    return `
You are a content creator specializing in creating engaging short-form video content. Create a video script for exactly ${targetDuration} seconds.

Channel Details:
- Video Types: ${videoTypes}
- Topic Guidance: ${topicGuidance}

Avoid these previously used topics: ${usedTopics.slice(-20).join(', ')}

${varietyInstructions}

CRITICAL REQUIREMENTS:
1. Create an engaging, attention-grabbing title
2. Write a complete script that naturally fits ${targetDuration} seconds of speech
3. Break the script into 3-5 scenes with natural transitions
4. Each scene should be 6-12 seconds long for natural pacing
5. TOTAL duration must equal ${targetDuration} seconds exactly
6. Extract 2-3 topic keywords for the content
7. Make content engaging, actionable, and valuable to viewers

VISUAL DESCRIPTION REQUIREMENTS:
- Be extremely detailed and specific for each scene
- Include camera angles, lighting, composition, colors
- Describe facial expressions, gestures, and body language
- Mention specific props, backgrounds, or settings
- Include movement and action descriptions
- Consider text overlays, graphics, or visual effects
- Be cinematic and visually compelling

TIMING REQUIREMENTS:
- Scene timing must add up to exactly ${targetDuration} seconds
- No scene should be shorter than 6 seconds or longer than 12 seconds
- Ensure natural speech pacing (about 150-180 words per minute)

Return your response as valid JSON in this exact format:
{
  "title": "Video Title",
  "script": "Complete video script...",
  "duration_seconds": ${targetDuration},
  "topic_keywords": ["keyword1", "keyword2"],
  "scenes": [
    {
      "scene_number": 1,
      "start_time_seconds": 0,
      "end_time_seconds": 8,
      "visual_description": "Extreme close-up of confident speaker's face, warm golden hour lighting from the left, sharp focus on eyes with slight background blur. Speaker has a genuine smile, making direct eye contact with camera. Modern minimalist office background with subtle plants. Camera slowly zooms in during speech. Text overlay appears: 'Morning Routine Hack #1'",
      "narration_text": "Here's the one morning habit that changed everything for me..."
    },
    {
      "scene_number": 2,
      "start_time_seconds": 8,
      "end_time_seconds": 16,
      "visual_description": "Medium shot of speaker demonstrating the habit, natural daylight streaming through large windows. Speaker moves with purpose and energy, hands gesturing expressively. Clean, organized space with motivational elements visible. Camera follows the movement with smooth tracking. Subtle motion graphics highlight key actions.",
      "narration_text": "Instead of checking my phone first thing, I do this simple 5-minute routine..."
    }
  ]
}`;
  }

  protected parseResponse(responseText: string): GeneratedContent {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const content = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!content.title || !content.script || !content.scenes || !Array.isArray(content.scenes)) {
        throw new Error('Invalid content structure returned from LLM');
      }

      return content as GeneratedContent;
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error(`Failed to parse generated content: ${parseError.message}`);
    }
  }
}
