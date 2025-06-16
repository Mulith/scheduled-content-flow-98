
-- Create table to store YouTube channel connections
CREATE TABLE public.youtube_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_handle TEXT,
  thumbnail_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count BIGINT DEFAULT 0,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- Enable Row Level Security
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;

-- Create policies for youtube_channels
CREATE POLICY "Users can view their own YouTube channels" 
  ON public.youtube_channels 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube channels" 
  ON public.youtube_channels 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube channels" 
  ON public.youtube_channels 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube channels" 
  ON public.youtube_channels 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_youtube_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at field
CREATE TRIGGER update_youtube_channels_updated_at_trigger
  BEFORE UPDATE ON public.youtube_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_channels_updated_at();
