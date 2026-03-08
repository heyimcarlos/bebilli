ALTER TABLE public.receipt_validations
  ADD COLUMN IF NOT EXISTS extracted_currency text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS converted_amount numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT NULL;