-- Allow tutors to insert their own recordings
CREATE POLICY "Tutors insert own recordings"
ON public.recordings FOR INSERT TO authenticated
WITH CHECK (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);

-- Allow tutors to update their own recordings
CREATE POLICY "Tutors update own recordings"
ON public.recordings FOR UPDATE TO authenticated
USING (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);