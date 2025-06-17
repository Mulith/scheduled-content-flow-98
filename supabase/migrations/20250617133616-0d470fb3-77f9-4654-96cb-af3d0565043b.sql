
-- Create content_items table to store generated content for channels
CREATE TABLE public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.content_channels(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  script TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'published', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scenes table to store individual scenes for each content item
CREATE TABLE public.content_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
  scene_number INTEGER NOT NULL,
  start_time_seconds DECIMAL(8,2) NOT NULL,
  end_time_seconds DECIMAL(8,2) NOT NULL,
  visual_description TEXT NOT NULL,
  narration_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add is_active column to content_channels table
ALTER TABLE public.content_channels 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_scenes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_items
CREATE POLICY "Users can view content items from their channels" 
  ON public.content_items 
  FOR SELECT 
  USING (
    channel_id IN (
      SELECT id FROM public.content_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create content items for their channels" 
  ON public.content_items 
  FOR INSERT 
  WITH CHECK (
    channel_id IN (
      SELECT id FROM public.content_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update content items from their channels" 
  ON public.content_items 
  FOR UPDATE 
  USING (
    channel_id IN (
      SELECT id FROM public.content_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content items from their channels" 
  ON public.content_items 
  FOR DELETE 
  USING (
    channel_id IN (
      SELECT id FROM public.content_channels WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for content_scenes
CREATE POLICY "Users can view scenes from their content items" 
  ON public.content_scenes 
  FOR SELECT 
  USING (
    content_item_id IN (
      SELECT ci.id FROM public.content_items ci
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scenes for their content items" 
  ON public.content_scenes 
  FOR INSERT 
  WITH CHECK (
    content_item_id IN (
      SELECT ci.id FROM public.content_items ci
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenes from their content items" 
  ON public.content_scenes 
  FOR UPDATE 
  USING (
    content_item_id IN (
      SELECT ci.id FROM public.content_items ci
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenes from their content items" 
  ON public.content_scenes 
  FOR DELETE 
  USING (
    content_item_id IN (
      SELECT ci.id FROM public.content_items ci
      JOIN public.content_channels cc ON ci.channel_id = cc.id
      WHERE cc.user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp for content_items
CREATE OR REPLACE FUNCTION update_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_content_items_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_content_items_channel_id ON public.content_items(channel_id);
CREATE INDEX idx_content_items_status ON public.content_items(status);
CREATE INDEX idx_content_scenes_content_item_id ON public.content_scenes(content_item_id);
CREATE INDEX idx_content_scenes_scene_number ON public.content_scenes(content_item_id, scene_number);
