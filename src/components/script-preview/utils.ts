
import { ContentItem, ContentScene, Scene } from "./types";

// Utility function to format duration
export const formatDuration = (duration?: number) => {
  if (!duration) return "Unknown";
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export const getVoiceDirection = (sceneNumber: number, totalScenes: number) => {
  if (sceneNumber === 1) return "Enthusiastic opening tone";
  if (sceneNumber === totalScenes) return "Strong concluding tone";
  return "Clear and engaging delivery";
};

export const getScenes = (contentItem: ContentItem): Scene[] => {
  if (contentItem.scenes && contentItem.scenes.length > 0) {
    // Use actual scene data from database
    return contentItem.scenes.map(scene => ({
      id: scene.scene_number,
      timestamp: `${Math.floor(scene.start_time_seconds / 60)}:${String(scene.start_time_seconds % 60).padStart(2, '0')}-${Math.floor(scene.end_time_seconds / 60)}:${String(scene.end_time_seconds % 60).padStart(2, '0')}`,
      text: scene.narration_text,
      visual: scene.visual_description,
      voiceNote: getVoiceDirection(scene.scene_number, contentItem.scenes!.length)
    }));
  } else {
    // Fallback: parse script to create scenes (for backward compatibility)
    const sentences = contentItem.script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sceneDuration = (contentItem.duration || 60) / Math.max(sentences.length, 1);
    
    return sentences.map((sentence, index) => ({
      id: index + 1,
      timestamp: `${Math.floor(index * sceneDuration / 60)}:${String(Math.floor(index * sceneDuration) % 60).padStart(2, '0')}-${Math.floor((index + 1) * sceneDuration / 60)}:${String(Math.floor((index + 1) * sceneDuration) % 60).padStart(2, '0')}`,
      text: sentence.trim(),
      visual: `Visual description for scene ${index + 1}: Supporting imagery for "${sentence.trim().substring(0, 30)}..."`,
      voiceNote: getVoiceDirection(index + 1, sentences.length)
    }));
  }
};
