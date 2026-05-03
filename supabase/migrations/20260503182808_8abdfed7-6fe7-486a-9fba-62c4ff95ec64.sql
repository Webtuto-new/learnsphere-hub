
CREATE TABLE public.class_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject_id UUID,
  subject_text TEXT,
  grade_id UUID,
  grade_text TEXT,
  curriculum_id UUID,
  class_type TEXT NOT NULL DEFAULT 'individual',
  preferred_language TEXT,
  preferred_date DATE,
  preferred_time TIME,
  budget NUMERIC,
  currency TEXT NOT NULL DEFAULT 'LKR',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  admin_reply TEXT,
  proposed_price NUMERIC,
  assigned_teacher_id UUID,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.class_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own requests"
ON public.class_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users create own requests"
ON public.class_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending requests"
ON public.class_requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage class_requests"
ON public.class_requests FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_class_requests_updated_at
BEFORE UPDATE ON public.class_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_class_requests_user ON public.class_requests(user_id);
CREATE INDEX idx_class_requests_status ON public.class_requests(status);
