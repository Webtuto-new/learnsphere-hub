
-- Create recording_notes table for multiple notes per recording
CREATE TABLE public.recording_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id uuid NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'pdf',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.recording_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage recording_notes"
ON public.recording_notes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors manage own recording notes"
ON public.recording_notes FOR ALL TO authenticated
USING (recording_id IN (
  SELECT r.id FROM recordings r
  JOIN teachers t ON r.teacher_id = t.id
  WHERE t.user_id = auth.uid()
))
WITH CHECK (recording_id IN (
  SELECT r.id FROM recordings r
  JOIN teachers t ON r.teacher_id = t.id
  WHERE t.user_id = auth.uid()
));

CREATE POLICY "Public read recording_notes"
ON public.recording_notes FOR SELECT TO public
USING (true);

-- Add custom type label to recordings
ALTER TABLE public.recordings ADD COLUMN IF NOT EXISTS recording_type text;
