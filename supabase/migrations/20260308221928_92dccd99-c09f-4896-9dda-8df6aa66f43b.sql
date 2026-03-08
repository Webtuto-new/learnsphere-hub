
CREATE TABLE public.recording_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  episode_number INTEGER,
  duration_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recording_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage recording_videos" ON public.recording_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read recording_videos" ON public.recording_videos FOR SELECT TO authenticated USING (true);
