ALTER TABLE public.profiles ADD COLUMN is_banned boolean NOT NULL DEFAULT false;

-- Allow admins to update any profile (for banning)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));