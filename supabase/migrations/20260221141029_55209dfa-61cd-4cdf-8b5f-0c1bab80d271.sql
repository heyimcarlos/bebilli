
-- PHASE 4: Daily check-ins table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  is_offline boolean NOT NULL DEFAULT false,
  note text,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id, checkin_date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_group_member(group_id));

CREATE POLICY "Members can view group checkins"
  ON public.daily_checkins FOR SELECT
  USING (is_group_member(group_id));
