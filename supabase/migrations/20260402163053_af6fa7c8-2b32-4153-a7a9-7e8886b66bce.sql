
-- Allow tutors to read profiles of students enrolled in their classes/recordings
CREATE POLICY "Tutors read enrolled student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT e.user_id FROM public.enrollments e
    JOIN public.classes c ON e.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
  OR
  id IN (
    SELECT e.user_id FROM public.enrollments e
    JOIN public.recordings r ON e.recording_id = r.id
    JOIN public.teachers t ON r.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);
