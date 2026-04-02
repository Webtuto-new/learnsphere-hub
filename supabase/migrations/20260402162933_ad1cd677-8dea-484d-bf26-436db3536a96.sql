
-- Add approval_status to classes (default 'approved' so existing + admin-created classes are auto-approved)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';

-- Tutors should be able to read their own recordings
CREATE POLICY "Tutors read own recordings"
ON public.recordings
FOR SELECT
TO authenticated
USING (teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid()));
