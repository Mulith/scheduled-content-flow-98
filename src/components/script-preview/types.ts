
export interface ContentScene {
  scene_number: number;
  start_time_seconds: number;
  end_time_seconds: number;
  visual_description: string;
  narration_text: string;
  content_scene_videos?: {
    id: string;
    video_url: string;
    video_status: string;
    error_message?: string;
  }[];
}

export interface ContentItem {
  id: string;
  title: string;
  theme: string;
  scheduledFor: string;
  status: string;
  engagement: string;
  channel: string;
  script: string;
  duration?: number;
  duration_seconds?: number;
  scenes?: ContentScene[];
  generation_stage?: string;
  script_status?: string;
  video_status?: string;
  music_status?: string;
  post_status?: string;
  video_file_path?: string;
}

export interface Scene {
  id: number;
  timestamp: string;
  text: string;
  visual: string;
  voiceNote: string;
}

export interface StoryboardItem {
  scene: number;
  description: string;
  videoUrl?: string;
  videoStatus: string;
  errorMessage?: string;
}
