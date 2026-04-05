-- Allow tutors to read enrollments for their own recordings
CREATE POLICY "Tutors read own recording enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING (
  recording_id IN (
    SELECT r.id FROM recordings r
    JOIN teachers t ON r.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);
