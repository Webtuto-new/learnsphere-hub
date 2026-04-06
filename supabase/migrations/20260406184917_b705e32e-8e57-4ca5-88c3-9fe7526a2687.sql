-- Add delivery mode to classes
ALTER TABLE public.classes 
ADD COLUMN delivery_mode text NOT NULL DEFAULT 'live',
ADD COLUMN access_duration_days integer DEFAULT 365;

-- Class lessons (videos for recorded/hybrid classes)
CREATE TABLE public.class_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text NOT NULL,
  lesson_number integer,
  duration_minutes integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage class_lessons" ON public.class_lessons FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors manage own class_lessons" ON public.class_lessons FOR ALL TO authenticated
  USING (class_id IN (SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = auth.uid()))
  WITH CHECK (class_id IN (SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = auth.uid()));

CREATE POLICY "Public read class_lessons" ON public.class_lessons FOR SELECT TO public USING (true);

-- Class materials (notes/files for classes)
CREATE TABLE public.class_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'pdf',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage class_materials" ON public.class_materials FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors manage own class_materials" ON public.class_materials FOR ALL TO authenticated
  USING (class_id IN (SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = auth.uid()))
  WITH CHECK (class_id IN (SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = auth.uid()));

CREATE POLICY "Public read class_materials" ON public.class_materials FOR SELECT TO public USING (true);