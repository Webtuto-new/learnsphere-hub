
-- Fix search_path for generate_admission_number
CREATE OR REPLACE FUNCTION public.generate_admission_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INT;
  result TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(admission_number FROM 4) AS INT)), 0) + 1
  INTO next_num FROM public.profiles WHERE admission_number IS NOT NULL;
  result := 'WT-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result;
END;
$$;
