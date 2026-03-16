
CREATE TABLE public.student_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL, -- 'recording_view', 'note_download', 'session_join'
  resource_id text, -- recording_id, session_id, etc.
  resource_title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage student_activity" ON public.student_activity FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users insert own activity" ON public.student_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own activity" ON public.student_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
