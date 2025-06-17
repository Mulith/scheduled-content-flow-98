
export interface ContentChannel {
  id: string;
  name: string;
  schedule: string;
  is_active: boolean;
  selected_topics: string[];
  topic_mode: string;
  selected_video_types: string[];
  user_id: string;
}

export interface MonitoringSummary {
  success: boolean;
  channelsChecked: number;
  totalChannelsFound: number;
  timestamp: string;
}

export interface GenerationQueueItem {
  id?: string;
  channel_id: string;
  items_to_generate: number;
  priority: number;
  status: string;
}
