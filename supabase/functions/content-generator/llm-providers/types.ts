
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
