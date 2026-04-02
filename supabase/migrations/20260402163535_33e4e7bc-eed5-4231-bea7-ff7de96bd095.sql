
-- Allow anonymous users to submit tutor applications (user_id will be null)
CREATE POLICY "Anonymous can submit applications"
ON public.tutor_applications
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);
