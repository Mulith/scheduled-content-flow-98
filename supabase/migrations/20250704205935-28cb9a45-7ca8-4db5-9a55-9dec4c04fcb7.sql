
-- Create storage bucket for generated videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-videos', 'generated-videos', true);

-- Create storage policies for the generated-videos bucket
CREATE POLICY "Users can view generated videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'generated-videos');

CREATE POLICY "System can upload generated videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'generated-videos');

CREATE POLICY "System can update generated videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'generated-videos');

-- Add a column to store the actual video file path in storage
ALTER TABLE public.content_items 
ADD COLUMN video_file_path TEXT;
