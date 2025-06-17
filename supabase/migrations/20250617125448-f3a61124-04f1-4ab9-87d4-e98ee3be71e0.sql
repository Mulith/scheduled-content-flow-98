
-- Create content_channels table to store user channels
CREATE TABLE public.content_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok')),
  account_name TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled')),
  schedule TEXT NOT NULL CHECK (schedule IN ('monthly', 'weekly', 'daily', 'twice-daily')),
  selected_video_types TEXT[] NOT NULL,
  selected_voice TEXT NOT NULL,
  topic_mode TEXT NOT NULL,
  selected_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_channels ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own channels
CREATE POLICY "Users can view their own channels" 
  ON public.content_channels 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own channels
CREATE POLICY "Users can create their own channels" 
  ON public.content_channels 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own channels
CREATE POLICY "Users can update their own channels" 
  ON public.content_channels 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own channels
CREATE POLICY "Users can delete their own channels" 
  ON public.content_channels 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_channels_updated_at
  BEFORE UPDATE ON public.content_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_content_channels_updated_at();
