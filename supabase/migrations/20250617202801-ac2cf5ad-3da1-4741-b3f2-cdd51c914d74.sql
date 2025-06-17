
-- Add new columns to content_items table for detailed status tracking
ALTER TABLE public.content_items 
ADD COLUMN generation_stage TEXT NOT NULL DEFAULT 'script_generation',
ADD COLUMN script_status TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN video_status TEXT NOT NULL DEFAULT 'not_started', 
ADD COLUMN music_status TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN post_status TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN updated_by_system TIMESTAMPTZ DEFAULT now();

-- Add check constraints for valid status values
ALTER TABLE public.content_items 
ADD CONSTRAINT check_generation_stage 
CHECK (generation_stage IN ('script_generation', 'video_creation', 'music_creation', 'post_generation', 'completed'));

ALTER TABLE public.content_items 
ADD CONSTRAINT check_script_status 
CHECK (script_status IN ('not_started', 'in_progress', 'completed', 'failed'));

ALTER TABLE public.content_items 
ADD CONSTRAINT check_video_status 
CHECK (video_status IN ('not_started', 'in_progress', 'completed', 'failed'));

ALTER TABLE public.content_items 
ADD CONSTRAINT check_music_status 
CHECK (music_status IN ('not_started', 'in_progress', 'completed', 'failed'));

ALTER TABLE public.content_items 
ADD CONSTRAINT check_post_status 
CHECK (post_status IN ('not_started', 'in_progress', 'completed', 'failed'));

-- Add a table to store generated videos for each scene
CREATE TABLE public.content_scene_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES public.content_scenes(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT,
  video_status TEXT NOT NULL DEFAULT 'generating' CHECK (video_status IN ('generating', 'completed', 'failed')),
  generation_request_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS for the new table
ALTER TABLE public.content_scene_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_scene_videos
CREATE POLICY "Users can view scene videos from their content" 
  ON public.content_scene_videos 
  FOR SELECT 
  USING (
    scene_id IN (
      SELECT cs.id FROM public.content_scenes cs
      JOIN public.content_items ci ON cs.content_item_id = ci.id
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scene videos for their content" 
  ON public.content_scene_videos 
  FOR INSERT 
  WITH CHECK (
    scene_id IN (
      SELECT cs.id FROM public.content_scenes cs
      JOIN public.content_items ci ON cs.content_item_id = ci.id
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scene videos from their content" 
  ON public.content_scene_videos 
  FOR UPDATE 
  USING (
    scene_id IN (
      SELECT cs.id FROM public.content_scenes cs
      JOIN public.content_items ci ON cs.content_item_id = ci.id
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_content_scene_videos_scene_id ON public.content_scene_videos(scene_id);
CREATE INDEX idx_content_scene_videos_status ON public.content_scene_videos(video_status);
CREATE INDEX idx_content_items_generation_stage ON public.content_items(generation_stage);

-- Update existing content items to have script generation completed
UPDATE public.content_items 
SET 
  script_status = 'completed', 
  generation_stage = 'video_creation',
  updated_by_system = now()
WHERE status = 'ready';
