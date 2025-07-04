
import { GeneratedContent } from './types.ts';

export function parseResponse(responseText: string): GeneratedContent {
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
