
-- Waitlist table
CREATE TABLE public.waitlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, class_id)
);
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waitlist" ON public.waitlists FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage waitlists" ON public.waitlists FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Teacher payouts table
CREATE TABLE public.teacher_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LKR',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payouts" ON public.teacher_payouts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url TEXT
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own certificates" ON public.certificates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Resources/notes per session
CREATE TABLE public.session_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.session_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resources" ON public.session_resources FOR SELECT USING (true);
CREATE POLICY "Admins manage resources" ON public.session_resources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Free trial tracking
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS has_free_trial BOOLEAN DEFAULT false;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS free_trial_duration_minutes INT DEFAULT 30;
