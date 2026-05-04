
-- Templates
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- login, payment_reminder, class_reminder, recording_available, course_access, subscription_expired, custom
  body TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage whatsapp_templates"
ON public.whatsapp_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_whatsapp_templates_updated_at
BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Message history
CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- recipient student (nullable in case of ad-hoc number)
  phone TEXT NOT NULL,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, manual_sent
  context JSONB, -- e.g. { class_id, recording_id, payment_id, ... }
  wa_link TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_messages_user ON public.whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage whatsapp_messages"
ON public.whatsapp_messages FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users read own whatsapp_messages"
ON public.whatsapp_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_whatsapp_messages_updated_at
BEFORE UPDATE ON public.whatsapp_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Settings (single row pattern)
CREATE TABLE public.whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_phone TEXT,
  support_phone TEXT,
  login_link TEXT DEFAULT 'https://edu.webtuto.lk/login',
  payment_instructions TEXT,
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  enabled_types JSONB NOT NULL DEFAULT '{"login":true,"payment_reminder":true,"class_reminder":true,"recording_available":true,"course_access":true,"subscription_expired":true,"custom":true}'::jsonb,
  provider TEXT NOT NULL DEFAULT 'manual', -- manual, cloud_api, twilio, etc. (future)
  provider_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage whatsapp_settings"
ON public.whatsapp_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_whatsapp_settings_updated_at
BEFORE UPDATE ON public.whatsapp_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed one settings row + default templates
INSERT INTO public.whatsapp_settings (admin_phone, support_phone, payment_instructions)
VALUES ('0728028444', '0728028444', 'Please transfer to our bank account and upload the receipt in your dashboard.');

INSERT INTO public.whatsapp_templates (name, type, body, description) VALUES
('Welcome / Login Details', 'login',
'Hi {{student_name}},

Welcome to Webtuto Academy! 🎓

Your login details:
Email: {{login_email}}
Password: {{temp_password}}

Login here: {{login_link}}

For help, contact us: {{admin_phone}}', 'Sent when a student account is created'),

('Payment Reminder', 'payment_reminder',
'Hi {{student_name}},

This is a reminder for your course "{{course_name}}".
Amount due: LKR {{amount_due}}
Expiry date: {{expiry_date}}

{{payment_instructions}}

Need help? Contact: {{admin_phone}}', 'Subscription expiring / payment due'),

('Class Reminder', 'class_reminder',
'Hi {{student_name}},

Reminder for your class:
📚 {{course_name}}
👨‍🏫 {{teacher_name}}
📅 {{class_date}} at {{class_time}}

Join here: {{zoom_link}}
WhatsApp group: {{whatsapp_group_link}}

See you in class!', 'Sent before a live class'),

('Recording Available', 'recording_available',
'Hi {{student_name}},

A new recording is available! 🎬
Course: {{course_name}}
Chapter: {{chapter_name}}
Lesson: {{lesson_name}}

Watch now: {{login_link}}', 'New lesson recording uploaded'),

('Course Access Granted', 'course_access',
'Hi {{student_name}},

You now have access to "{{course_name}}" 🎉
Access starts: {{access_start_date}}
Access expires: {{expiry_date}}

Login: {{login_link}}
Support: {{admin_phone}}', 'Sent when admin gives course access'),

('Subscription Expired', 'subscription_expired',
'Hi {{student_name}},

Your access to "{{course_name}}" has expired.
To renew, please contact admin: {{admin_phone}}

Login: {{login_link}}', 'Sent when subscription expires');
