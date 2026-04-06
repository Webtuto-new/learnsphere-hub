-- Allow tutors to manage recording_videos for their own recordings
CREATE POLICY "Tutors manage own recording videos"
ON public.recording_videos FOR ALL TO authenticated
USING (
  recording_id IN (
    SELECT r.id FROM recordings r
    JOIN teachers t ON r.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
)
WITH CHECK (
  recording_id IN (
    SELECT r.id FROM recordings r
    JOIN teachers t ON r.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);