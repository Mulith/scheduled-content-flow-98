export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      content_channels: {
        Row: {
          account_name: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          platform: string
          schedule: string
          selected_topics: string[] | null
          selected_video_types: string[]
          selected_voice: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          subscription_status: string | null
          topic_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          platform: string
          schedule: string
          selected_topics?: string[] | null
          selected_video_types: string[]
          selected_voice: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          subscription_status?: string | null
          topic_mode: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          platform?: string
          schedule?: string
          selected_topics?: string[] | null
          selected_video_types?: string[]
          selected_voice?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          subscription_status?: string | null
          topic_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_generation_queue: {
        Row: {
          channel_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          items_to_generate: number
          priority: number
          scheduled_for: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          items_to_generate?: number
          priority?: number
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          items_to_generate?: number
          priority?: number
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_generation_queue_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "content_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          channel_id: string
          created_at: string
          duration_seconds: number | null
          generation_stage: string
          id: string
          music_status: string
          post_status: string
          script: string
          script_status: string
          status: string
          title: string
          topic_keywords: string[] | null
          updated_at: string
          updated_by_system: string | null
          video_file_path: string | null
          video_status: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          duration_seconds?: number | null
          generation_stage?: string
          id?: string
          music_status?: string
          post_status?: string
          script: string
          script_status?: string
          status?: string
          title: string
          topic_keywords?: string[] | null
          updated_at?: string
          updated_by_system?: string | null
          video_file_path?: string | null
          video_status?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          duration_seconds?: number | null
          generation_stage?: string
          id?: string
          music_status?: string
          post_status?: string
          script?: string
          script_status?: string
          status?: string
          title?: string
          topic_keywords?: string[] | null
          updated_at?: string
          updated_by_system?: string | null
          video_file_path?: string | null
          video_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "content_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      content_monitoring_queue: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          last_checked_at: string
          next_check_at: string
          status: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          last_checked_at?: string
          next_check_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          last_checked_at?: string
          next_check_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_monitoring_queue_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "content_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      content_scene_videos: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          generation_request_id: string | null
          id: string
          scene_id: string
          video_status: string
          video_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generation_request_id?: string | null
          id?: string
          scene_id: string
          video_status?: string
          video_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generation_request_id?: string | null
          id?: string
          scene_id?: string
          video_status?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_scene_videos_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "content_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      content_scenes: {
        Row: {
          content_item_id: string
          created_at: string
          end_time_seconds: number
          id: string
          narration_text: string
          scene_number: number
          start_time_seconds: number
          visual_description: string
        }
        Insert: {
          content_item_id: string
          created_at?: string
          end_time_seconds: number
          id?: string
          narration_text: string
          scene_number: number
          start_time_seconds: number
          visual_description: string
        }
        Update: {
          content_item_id?: string
          created_at?: string
          end_time_seconds?: number
          id?: string
          narration_text?: string
          scene_number?: number
          start_time_seconds?: number
          visual_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_scenes_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_channels: {
        Row: {
          access_token: string
          channel_handle: string | null
          channel_id: string
          channel_name: string
          connected_at: string
          enabled: boolean
          id: string
          refresh_token: string
          subscriber_count: number | null
          thumbnail_url: string | null
          token_expires_at: string
          updated_at: string
          user_id: string
          video_count: number | null
        }
        Insert: {
          access_token: string
          channel_handle?: string | null
          channel_id: string
          channel_name: string
          connected_at?: string
          enabled?: boolean
          id?: string
          refresh_token: string
          subscriber_count?: number | null
          thumbnail_url?: string | null
          token_expires_at: string
          updated_at?: string
          user_id: string
          video_count?: number | null
        }
        Update: {
          access_token?: string
          channel_handle?: string | null
          channel_id?: string
          channel_name?: string
          connected_at?: string
          enabled?: boolean
          id?: string
          refresh_token?: string
          subscriber_count?: number | null
          thumbnail_url?: string | null
          token_expires_at?: string
          updated_at?: string
          user_id?: string
          video_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_content_requirements: {
        Args: { schedule_type: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
