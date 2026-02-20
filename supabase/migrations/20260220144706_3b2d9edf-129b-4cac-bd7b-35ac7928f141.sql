
-- Update the trigger to track max_saved as the highest single contribution amount
CREATE OR REPLACE FUNCTION public.update_user_streak()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  last_date date;
  today date := current_date;
  current_s integer;
  best_s integer;
  total_c integer;
  new_level integer;
  current_max numeric;
BEGIN
  -- Get current user stats
  SELECT 
    last_contribution_at::date,
    COALESCE(current_streak, 0),
    COALESCE(best_streak, 0),
    COALESCE(total_contributions, 0),
    COALESCE(max_saved, 0)
  INTO last_date, current_s, best_s, total_c, current_max
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Calculate new streak
  IF last_date IS NULL OR last_date < today - 1 THEN
    current_s := 1;
  ELSIF last_date = today - 1 THEN
    current_s := current_s + 1;
  END IF;

  -- Update best streak
  IF current_s > best_s THEN
    best_s := current_s;
  END IF;

  -- Update total contributions
  total_c := total_c + 1;

  -- Update max_saved if this single contribution is the highest ever
  IF NEW.type = 'deposit' AND NEW.amount > current_max THEN
    current_max := NEW.amount;
  END IF;

  -- Calculate level
  new_level := GREATEST(1, FLOOR(LOG(total_c + 1) * 2) + 1)::integer;

  -- Update profile
  UPDATE public.profiles
  SET 
    last_contribution_at = NOW(),
    current_streak = current_s,
    best_streak = best_s,
    total_contributions = total_c,
    level = new_level,
    consistency_days = current_s,
    max_saved = current_max
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;
