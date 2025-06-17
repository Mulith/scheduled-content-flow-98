
-- Create content generation queue table
CREATE TABLE public.content_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.content_channels(id) ON DELETE CASCADE NOT NULL,
  items_to_generate INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER NOT NULL DEFAULT 0, -- Higher number = higher priority
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content monitoring queue table to track which channels need monitoring
CREATE TABLE public.content_monitoring_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.content_channels(id) ON DELETE CASCADE NOT NULL,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_check_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '5 minutes',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id)
);

-- Add topic history tracking to content_items
ALTER TABLE public.content_items 
ADD COLUMN topic_keywords TEXT[],
ADD COLUMN duration_seconds INTEGER;

-- Enable RLS for queue tables
ALTER TABLE public.content_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_monitoring_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_generation_queue
CREATE POLICY "Users can view generation queue for their channels" 
  ON public.content_generation_queue 
  FOR SELECT 
  USING (
    channel_id IN (
      SELECT id FROM public.content_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage generation queue" 
  ON public.content_generation_queue 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- RLS policies for content_monitoring_queue
CREATE POLICY "Users can view monitoring queue for their channels" 
  ON public.content_monitoring_queue 
  FOR SELECT 
  USING (
    channel_id IN (
      SELECT id FROM public.content_channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage monitoring queue" 
  ON public.content_monitoring_queue 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create function to automatically add new channels to monitoring queue
CREATE OR REPLACE FUNCTION add_channel_to_monitoring_queue()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.content_monitoring_queue (channel_id, next_check_at)
  VALUES (NEW.id, now() + INTERVAL '1 minute')
  ON CONFLICT (channel_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-add channels to monitoring queue
CREATE TRIGGER trigger_add_channel_to_monitoring_queue
  AFTER INSERT ON public.content_channels
  FOR EACH ROW
  EXECUTE FUNCTION add_channel_to_monitoring_queue();

-- Create function to get content requirements by schedule
CREATE OR REPLACE FUNCTION get_content_requirements(schedule_type TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE schedule_type
    WHEN 'twice-daily' THEN RETURN 6;
    WHEN 'daily' THEN RETURN 3;
    WHEN 'weekly' THEN RETURN 2;
    WHEN 'monthly' THEN RETURN 1;
    ELSE RETURN 1;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_content_generation_queue_status ON public.content_generation_queue(status);
CREATE INDEX idx_content_generation_queue_scheduled_for ON public.content_generation_queue(scheduled_for);
CREATE INDEX idx_content_monitoring_queue_next_check ON public.content_monitoring_queue(next_check_at);
CREATE INDEX idx_content_monitoring_queue_status ON public.content_monitoring_queue(status);
CREATE INDEX idx_content_items_topic_keywords ON public.content_items USING GIN(topic_keywords);

-- Update triggers for timestamp management
CREATE OR REPLACE FUNCTION update_content_generation_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_generation_queue_updated_at
  BEFORE UPDATE ON public.content_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_content_generation_queue_updated_at();

CREATE OR REPLACE FUNCTION update_content_monitoring_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_monitoring_queue_updated_at
  BEFORE UPDATE ON public.content_monitoring_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_content_monitoring_queue_updated_at();
