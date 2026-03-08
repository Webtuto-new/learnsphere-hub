
-- Create a dedicated videos storage bucket for larger uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('videos', 'videos', true, 524288000) 
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');

-- Allow public read of videos  
CREATE POLICY "Public read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
