
-- Add receipt_url to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url text;

-- Add items JSON to payments (stores what was purchased)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS items jsonb;

-- Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');

-- Allow public read of receipts
CREATE POLICY "Public read receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

-- Create bank_details table for admin-configurable bank info
CREATE TABLE IF NOT EXISTS public.bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  branch text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage bank_details" ON public.bank_details FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read bank_details" ON public.bank_details FOR SELECT USING (is_active = true);
