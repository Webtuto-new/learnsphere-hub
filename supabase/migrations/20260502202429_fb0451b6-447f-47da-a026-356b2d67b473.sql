-- Shared timestamp helper (create if missing)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Lesson Modules
CREATE TABLE public.lesson_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NULL,
  recording_id UUID NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT lesson_modules_parent_check CHECK (
    (class_id IS NOT NULL AND recording_id IS NULL) OR
    (class_id IS NULL AND recording_id IS NOT NULL)
  )
);

CREATE INDEX idx_lesson_modules_class ON public.lesson_modules(class_id);
CREATE INDEX idx_lesson_modules_recording ON public.lesson_modules(recording_id);

ALTER TABLE public.lesson_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read lesson_modules" ON public.lesson_modules
  FOR SELECT USING (true);

CREATE POLICY "Admins manage lesson_modules" ON public.lesson_modules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors manage own lesson_modules" ON public.lesson_modules
  FOR ALL TO authenticated
  USING (
    (class_id IN (SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = auth.uid()))
    OR
    (recording_id IN (SELECT r.id FROM recordings r JOIN teachers t ON r.teacher_id = t.id WHERE t.user_id = auth.uid()))
  )
  WITH CHECK (
    (class_id IN (SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = auth.uid()))
    OR
    (recording_id IN (SELECT r.id FROM recordings r JOIN teachers t ON r.teacher_id = t.id WHERE t.user_id = auth.uid()))
  );

CREATE TRIGGER update_lesson_modules_updated_at
BEFORE UPDATE ON public.lesson_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lesson Videos
CREATE TABLE public.lesson_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.lesson_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_videos_module ON public.lesson_videos(module_id);

ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read lesson_videos" ON public.lesson_videos
  FOR SELECT USING (true);

CREATE POLICY "Admins manage lesson_videos" ON public.lesson_videos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors manage own lesson_videos" ON public.lesson_videos
  FOR ALL TO authenticated
  USING (module_id IN (
    SELECT lm.id FROM lesson_modules lm
    LEFT JOIN classes c ON lm.class_id = c.id
    LEFT JOIN recordings r ON lm.recording_id = r.id
    LEFT JOIN teachers tc ON c.teacher_id = tc.id
    LEFT JOIN teachers tr ON r.teacher_id = tr.id
    WHERE tc.user_id = auth.uid() OR tr.user_id = auth.uid()
  ))
  WITH CHECK (module_id IN (
    SELECT lm.id FROM lesson_modules lm
    LEFT JOIN classes c ON lm.class_id = c.id
    LEFT JOIN recordings r ON lm.recording_id = r.id
    LEFT JOIN teachers tc ON c.teacher_id = tc.id
    LEFT JOIN teachers tr ON r.teacher_id = tr.id
    WHERE tc.user_id = auth.uid() OR tr.user_id = auth.uid()
  ));

-- Lesson Documents
CREATE TABLE public.lesson_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.lesson_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NULL DEFAULT 'pdf',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_documents_module ON public.lesson_documents(module_id);

ALTER TABLE public.lesson_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read lesson_documents" ON public.lesson_documents
  FOR SELECT USING (true);

CREATE POLICY "Admins manage lesson_documents" ON public.lesson_documents
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors manage own lesson_documents" ON public.lesson_documents
  FOR ALL TO authenticated
  USING (module_id IN (
    SELECT lm.id FROM lesson_modules lm
    LEFT JOIN classes c ON lm.class_id = c.id
    LEFT JOIN recordings r ON lm.recording_id = r.id
    LEFT JOIN teachers tc ON c.teacher_id = tc.id
    LEFT JOIN teachers tr ON r.teacher_id = tr.id
    WHERE tc.user_id = auth.uid() OR tr.user_id = auth.uid()
  ))
  WITH CHECK (module_id IN (
    SELECT lm.id FROM lesson_modules lm
    LEFT JOIN classes c ON lm.class_id = c.id
    LEFT JOIN recordings r ON lm.recording_id = r.id
    LEFT JOIN teachers tc ON c.teacher_id = tc.id
    LEFT JOIN teachers tr ON r.teacher_id = tr.id
    WHERE tc.user_id = auth.uid() OR tr.user_id = auth.uid()
  ));

-- Documents storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read documents bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated upload to documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated update documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated delete documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents');