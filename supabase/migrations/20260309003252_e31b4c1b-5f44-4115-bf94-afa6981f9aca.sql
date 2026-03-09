-- Allow authenticated users to create their own payment records
CREATE POLICY "Users can create own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to create their own enrollments
CREATE POLICY "Users can create own enrollments"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);