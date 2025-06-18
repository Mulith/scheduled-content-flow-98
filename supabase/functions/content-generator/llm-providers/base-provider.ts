
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
      ? channel.selected_video_types 
      : [channel.selected_video_types];

    const topics = Array.isArray(channel.selected_topics) 
      ? channel.selected_topics.join(', ') 
      : channel.selected_topics || 'general productivity and motivation';

    const themes = Array.isArray(channel.selected_themes)
      ? channel.selected_themes.join(', ')
      : channel.selected_themes || '';

    // Create detailed video style instructions
    const videoStyleInstructions = this.getVideoStyleInstructions(videoTypes);

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

    // Add theme guidance
    const themeGuidance = themes ? `Content Theme: Ensure your content aligns with these themes: ${themes}. Let these themes influence your topic selection, tone, and approach.` : '';

    // Add variety and uniqueness instructions
    const varietyInstructions = `
IMPORTANT: Create UNIQUE and DIVERSE content. 
- Use different angles, perspectives, and approaches
- Vary your tone, style, and format within the chosen video style
- Explore different aspects of the topic
- Be creative and original
- Avoid repetitive patterns or formulaic content
- Each piece should feel fresh and distinct
- Don't always use the same examples or scenarios
${uniqueId ? `- Content ID: ${uniqueId}` : ''}
`;

    return `
You are a content creator specializing in creating engaging short-form video content. Create a video script for exactly ${targetDuration} seconds.

Channel Details:
- Video Style: ${videoStyleInstructions}
- Topic Guidance: ${topicGuidance}
${themeGuidance ? `- ${themeGuidance}` : ''}

Avoid these previously used topics and keywords: ${usedTopics.slice(-20).join(', ')}

${varietyInstructions}

CRITICAL REQUIREMENTS:
1. Create an engaging, attention-grabbing title that matches the video style
2. Write a complete script that naturally fits ${targetDuration} seconds of speech
3. Break the script into 3-5 scenes with natural transitions
4. Each scene should be 6-12 seconds long for natural pacing
5. TOTAL duration must equal ${targetDuration} seconds exactly
6. Extract 2-3 topic keywords for the content
7. Make content engaging, actionable, and valuable to viewers
8. STRICTLY follow the chosen video style format and structure

VISUAL DESCRIPTION REQUIREMENTS:
- Be extremely detailed and specific for each scene
- Include camera angles, lighting, composition, colors
- Describe facial expressions, gestures, and body language
- Mention specific props, backgrounds, or settings
- Include movement and action descriptions
- Consider text overlays, graphics, or visual effects
- Be cinematic and visually compelling
- Match the visual style to the content format

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
      "visual_description": "Detailed visual description matching the video style...",
      "narration_text": "Script text for this scene..."
    }
  ]
}`;
  }

  private getVideoStyleInstructions(videoTypes: string[]): string {
    const styleInstructions = {
      'story': `Story Format - Create narrative-driven content with a clear beginning, middle, and end. Tell a compelling story with characters, conflict, and resolution. Use storytelling techniques like hooks, tension, and emotional payoffs. Examples: personal transformation stories, case studies, customer success stories, behind-the-scenes narratives.`,
      
      'top5': `Top 5 Lists - Create countdown and ranking format content. Structure as "Top 5 [Topic]", "5 Best [Things]", or "5 Worst [Mistakes]". Start with #5 and build to #1 for maximum engagement. Each point should be distinct and valuable. Use clear transitions between items.`,
      
      'bestof': `Best of All Time - Create ultimate guides and definitive lists. Position content as the "ultimate", "definitive", or "complete" guide to a topic. Present authoritative information as if it's the final word on the subject. Use superlatives and definitive language.`,
      
      'howto': `How-To Tutorial - Create step-by-step instructional content. Break down complex processes into simple, actionable steps. Use clear, direct language. Number your steps clearly (Step 1, Step 2, etc.). Focus on practical, implementable advice.`,
      
      'reaction': `Reaction & Commentary - Create response and opinion-based content. React to trends, news, or common situations. Share personal opinions and insights. Use phrases like "Here's what I think...", "My take on this is...", "What people don't realize is...". Be conversational and authentic.`,
      
      'quicktips': `Quick Tips - Create short, actionable advice format. Present rapid-fire tips and hacks. Use bullet-point style delivery. Focus on immediate value and quick wins. Start with "Quick tip:", "Pro tip:", or "Here's a hack:". Keep each tip concise and actionable.`
    };

    return videoTypes.map(type => styleInstructions[type] || `${type} format content`).join(' Combined with: ');
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
