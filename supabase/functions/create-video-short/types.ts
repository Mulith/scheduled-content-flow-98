
export interface Scene {
  scene_number: number;
  start_time_seconds: number;
  end_time_seconds: number;
  narration_text: string;
  visual_description: string;
  content_scene_videos?: {
    video_url: string;
    video_status: string;
  }[];
}

export interface ContentItem {
  id: string;
  title: string;
  script: string;
  content_scenes: Scene[];
}

export interface VideoConfig {
  parallaxSpeed: number;
  transitionDuration: number;
  enableAudioSync: boolean;
  totalDuration: number;
  frameRate: number;
}

export interface SceneData {
  imageUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  sceneNumber: number;
  narrationText: string;
}
