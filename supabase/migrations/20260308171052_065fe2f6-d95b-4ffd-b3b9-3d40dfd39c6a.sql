
-- Create receipt_validations table to store OCR data alongside contributions
CREATE TABLE IF NOT EXISTS public.receipt_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id uuid REFERENCES public.contributions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  group_id uuid NOT NULL,
  declared_amount numeric NOT NULL,
  extracted_amount numeric,
  extracted_date text,
  extracted_type text,
  extracted_description text,
  receipt_image_url text,
  validation_status text NOT NULL DEFAULT 'pending',
  tolerance_percent numeric NOT NULL DEFAULT 5,
  amount_match boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.receipt_validations ENABLE ROW LEVEL SECURITY;

-- Members can view validations for their groups
CREATE POLICY "Members can view group validations"
  ON public.receipt_validations FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

-- Users can insert their own validations
CREATE POLICY "Users can insert own validations"
  ON public.receipt_validations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Group admins can update validation status
CREATE POLICY "Group admins can update validations"
  ON public.receipt_validations FOR UPDATE
  TO authenticated
  USING (is_group_admin(group_id));
