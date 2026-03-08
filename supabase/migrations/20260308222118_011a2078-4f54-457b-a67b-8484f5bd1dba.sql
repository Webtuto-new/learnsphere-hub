
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

CREATE POLICY "Admins can upload thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update thumbnails" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'thumbnails' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
