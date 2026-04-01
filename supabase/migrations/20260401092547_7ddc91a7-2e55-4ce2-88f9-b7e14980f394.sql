
CREATE POLICY "Authenticated users can update application files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'applications')
WITH CHECK (bucket_id = 'applications');

CREATE POLICY "Authenticated users can delete application files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'applications');
