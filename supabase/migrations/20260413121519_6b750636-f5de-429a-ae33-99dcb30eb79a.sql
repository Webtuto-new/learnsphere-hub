
-- Fix: Allow uploads to applications bucket
CREATE POLICY "Anyone can upload to applications"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'applications');

CREATE POLICY "Anyone can read applications files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'applications');

-- Add chapter and session date to recording_videos
ALTER TABLE public.recording_videos
ADD COLUMN chapter_name text DEFAULT NULL,
ADD COLUMN session_date date DEFAULT NULL;
