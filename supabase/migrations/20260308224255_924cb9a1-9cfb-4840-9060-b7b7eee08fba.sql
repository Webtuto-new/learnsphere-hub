-- Create storage bucket for tutor application files
INSERT INTO storage.buckets (id, name, public) VALUES ('applications', 'applications', true);

-- Allow authenticated users to upload to applications bucket
CREATE POLICY "Authenticated users can upload application files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'applications');

-- Allow public read access
CREATE POLICY "Public can read application files"
ON storage.objects FOR SELECT
USING (bucket_id = 'applications');