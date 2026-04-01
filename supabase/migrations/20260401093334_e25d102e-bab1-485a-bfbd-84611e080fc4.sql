
-- Tutors can manage their own classes
CREATE POLICY "Tutors manage own classes" ON public.classes
FOR ALL TO authenticated
USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
)
WITH CHECK (
  teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
);

-- Tutors can manage sessions for their own classes
CREATE POLICY "Tutors manage own sessions" ON public.class_sessions
FOR ALL TO authenticated
USING (
  class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid()))
)
WITH CHECK (
  class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid()))
);

-- Tutors can read enrollments for their own classes
CREATE POLICY "Tutors read own class enrollments" ON public.enrollments
FOR SELECT TO authenticated
USING (
  class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid()))
);

-- Tutors can read their own payouts
CREATE POLICY "Tutors read own payouts" ON public.teacher_payouts
FOR SELECT TO authenticated
USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
);
