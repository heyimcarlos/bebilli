-- Fix: Create secure view for profiles that hides phone from other users
-- Users can only see their own phone number, others just see name and avatar

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  avatar_url,
  country,
  city,
  consistency_days,
  is_premium,
  max_saved,
  created_at,
  updated_at,
  CASE 
    WHEN id = auth.uid() THEN phone 
    ELSE NULL 
  END as phone
FROM public.profiles;

-- Add last_contribution_at column to track streaks
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_contribution_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_contributions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Create function to update streak on contribution
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_date date;
  today date := current_date;
  current_s integer;
  best_s integer;
  total_c integer;
  new_level integer;
BEGIN
  -- Get current user stats
  SELECT 
    last_contribution_at::date,
    COALESCE(current_streak, 0),
    COALESCE(best_streak, 0),
    COALESCE(total_contributions, 0)
  INTO last_date, current_s, best_s, total_c
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Calculate new streak
  IF last_date IS NULL OR last_date < today - 1 THEN
    -- First contribution or streak broken
    current_s := 1;
  ELSIF last_date = today - 1 THEN
    -- Consecutive day!
    current_s := current_s + 1;
  END IF;
  -- If same day, keep current streak

  -- Update best streak
  IF current_s > best_s THEN
    best_s := current_s;
  END IF;

  -- Update total contributions
  total_c := total_c + 1;

  -- Calculate level based on total contributions
  new_level := GREATEST(1, FLOOR(LOG(total_c + 1) * 2) + 1)::integer;

  -- Update profile
  UPDATE public.profiles
  SET 
    last_contribution_at = NOW(),
    current_streak = current_s,
    best_streak = best_s,
    total_contributions = total_c,
    level = new_level,
    consistency_days = current_s
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger for streak updates
DROP TRIGGER IF EXISTS on_contribution_update_streak ON public.contributions;
CREATE TRIGGER on_contribution_update_streak
AFTER INSERT ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_streak();