
import { ContentGenerationRequest } from './types.ts';
import { getVideoStyleInstructions } from './video-style-instructions.ts';

export function buildPrompt(request: ContentGenerationRequest): string {
  const { channel, usedTopics, targetDuration, uniqueId } = request;
  
  const videoTypes = Array.isArray(channel.selected_video_types) 
    ? channel.selected_video_types 
    : [channel.selected_video_types];

  const topics = Array.isArray(channel.selected_topics) 
    ? channel.selected_topics.join(', ') 
    : channel.selected_topics || 'general productivity and motivation';

  // Include themes from the channel data
  const themes = Array.isArray(channel.selected_themes)
    ? channel.selected_themes.join(', ')
    : channel.selected_themes || '';

  // Create detailed video style instructions
  const videoStyleInstructions = getVideoStyleInstructions(videoTypes);

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

  // Add theme guidance with more detail
  const themeGuidance = themes ? `Visual & Style Theme: Your content should align with these visual and stylistic themes: ${themes}. Let these themes influence your visual descriptions, color palettes, mood, tone, and overall aesthetic approach. Consider how these themes affect lighting, composition, and visual elements in your scene descriptions.` : '';

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

    COMPREHENSIVE VISUAL DESCRIPTION REQUIREMENTS:
    
    **MANDATORY CONSISTENCY ELEMENTS** (Apply to ALL scenes):
    - ORIENTATION: Always portrait orientation (9:16 aspect ratio, taller than wide, mobile-optimized vertical framing)
    - CHARACTER CONSISTENCY: If featuring a person, maintain EXACTLY the same individual throughout ALL scenes:
      * Same age range, ethnicity, gender, and body type
      * Identical hair color, style, length, and texture
      * Same facial features, eye color, skin tone, and facial structure
      * Consistent clothing style and outfit (unless narrative requires a change)
      * Same accessories, jewelry, or distinctive features
      * Maintain same overall appearance and styling choices
    - COLOR GRADING: Use ONE cohesive color palette throughout all scenes:
      * Warm palette: Golden hour lighting, amber tones, soft oranges, honey colors, cream whites
      * Cool palette: Blues, teals, purples, silver grays, crisp whites with blue undertones
      * Neutral palette: Grays, beiges, blacks, whites, earth tones, muted colors
      * Cinematic palette: High contrast, dramatic shadows, selective color emphasis
    - LIGHTING STYLE: Maintain consistent lighting approach across ALL scenes:
      * Soft natural light: Window light, diffused daylight, gentle shadows
      * Dramatic studio lighting: Directional lights, strong shadows, high contrast
      * Golden hour: Warm, glowing, backlit, sunset/sunrise quality
      * Bright clean lighting: Even illumination, minimal shadows, professional setup
    - VISUAL STYLE: Consistent photographic/cinematic approach:
      * Professional photography style with shallow depth of field
      * Cinematic film look with color grading and composition
      * Clean minimalist aesthetic with simple backgrounds
      * Documentary-style realistic and natural appearance
    
    **DETAILED SCENE COMPOSITION** (Required for each scene):
    - CAMERA WORK: Specify exact camera positioning and movement:
      * Camera angle: Eye-level, low angle, high angle, Dutch angle, over-shoulder
      * Shot type: Extreme close-up, close-up, medium close-up, medium shot, medium wide, wide shot
      * Camera movement: Static, slow zoom in/out, pan left/right, tilt up/down, dolly movement
      * Depth of field: Shallow focus with background blur, deep focus, rack focus effects
      * Framing: Rule of thirds, centered composition, off-center dynamic framing
    
    - LIGHTING SETUP: Describe comprehensive lighting details:
      * Primary light source: Window light, studio key light, natural sunlight, artificial lighting
      * Light direction: Front lighting, side lighting, backlighting, rim lighting
      * Light quality: Soft diffused, hard directional, bounced light, filtered light
      * Shadows: Soft shadows, dramatic shadows, no shadows, cast shadows
      * Color temperature: Warm (3200K), neutral (5600K), cool (7000K+), mixed lighting
      * Mood lighting: Atmospheric, moody, bright and airy, dramatic chiaroscuro
    
    - CHARACTER DETAILS: Comprehensive appearance description:
      * Facial expression: Specific emotion, micro-expressions, eye contact direction
      * Body language: Posture, gesture, hand position, stance, movement
      * Clothing: Detailed outfit description, fabric texture, fit, style, colors
      * Hair and makeup: Styling, natural/styled look, makeup level, hair position
      * Props interaction: How they hold, use, or interact with objects
      * Energy level: Calm, animated, focused, relaxed, intense, enthusiastic
    
    - ENVIRONMENT AND SETTING: Rich background and context:
      * Location type: Indoor/outdoor, specific room/space, natural/urban setting
      * Background elements: Furniture, decorations, architectural features, natural elements
      * Props and objects: Specific items, their placement, size, material, condition
      * Spatial relationship: Foreground, midground, background layering
      * Environmental mood: Cozy, professional, energetic, serene, busy, minimal
      * Seasonal/temporal indicators: Time of day, season, weather, atmosphere
    
    - COLOR AND TEXTURE DETAILS: Comprehensive visual palette:
      * Dominant colors: Primary colors in the scene, their saturation and brightness
      * Secondary colors: Supporting colors, accent colors, color harmony
      * Material textures: Fabric, wood, metal, glass, natural textures
      * Surface qualities: Matte, glossy, rough, smooth, weathered, pristine
      * Color relationships: Complementary, analogous, monochromatic schemes
      * Visual weight: How colors and elements balance in the composition
    
    - TECHNICAL SPECIFICATIONS: Professional production details:
      * Image quality: High resolution, sharp focus, professional grade
      * Style references: Photography style, artistic movement, visual inspiration
      * Post-processing: Color correction, contrast, saturation, clarity
      * Aspect ratio confirmation: 9:16 portrait orientation
      * Visual effects: Natural bokeh, lens flares, atmospheric effects
      * Composition rules: Leading lines, symmetry, patterns, visual flow
    
    **CONSISTENCY EXAMPLES AND TEMPLATES**:
    - Character template: "Same [age] [ethnicity] [gender], [hair description], wearing [clothing style], [lighting type] lighting, portrait orientation"
    - Color template: "Consistent [warm/cool/neutral] color grading with [specific colors], [lighting quality] lighting, [mood] atmosphere"
    - Environment template: "[Location type] setting with [background elements], [lighting setup], maintaining [visual style] aesthetic"
    
    **NARRATIVE INTEGRATION**: Ensure visual descriptions support the story:
    - Visual metaphors: Use imagery that reinforces the message
    - Emotional alignment: Visuals match the emotional tone of the narration
    - Progression: Visual elements evolve naturally across scenes
    - Attention direction: Guide viewer focus to support the narrative
    - Brand consistency: Maintain professional, engaging visual identity
    
    ${themes ? `
    **THEME INTEGRATION**: Incorporate selected themes (${themes}) while maintaining visual consistency:
    - Theme-based color palettes that align with selected themes
    - Environmental choices that reflect thematic elements
    - Lighting moods that enhance thematic atmosphere
    - Compositional elements that support thematic messaging
    - Props and styling that reinforce thematic concepts
    ` : ''}

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
      "visual_description": "Detailed visual description matching the video style and themes...",
      "narration_text": "Script text for this scene..."
    }
  ]
}`;
}
