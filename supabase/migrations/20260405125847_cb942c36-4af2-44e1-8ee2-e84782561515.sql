-- Allow tutors to insert enrollments for their own classes or recordings
CREATE POLICY "Tutors enroll students in own resources"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (
  (class_id IN (
    SELECT c.id FROM classes c
    JOIN teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  ))
  OR
  (recording_id IN (
    SELECT r.id FROM recordings r
    JOIN teachers t ON r.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  ))
);
