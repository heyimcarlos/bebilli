
-- Create timeline_events table for social feed
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Everyone can view timeline events (public feed)
CREATE POLICY "Anyone can view timeline events"
  ON public.timeline_events FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON public.timeline_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for timeline
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;

-- Create trigger to auto-generate timeline events on contributions
CREATE OR REPLACE FUNCTION public.generate_timeline_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_profile RECORD;
  v_streak integer;
  v_total integer;
  v_level integer;
BEGIN
  -- Get user profile
  SELECT current_streak, total_contributions, level, name
  INTO v_profile
  FROM public.profiles
  WHERE id = NEW.user_id;

  v_streak := COALESCE(v_profile.current_streak, 0);
  v_total := COALESCE(v_profile.total_contributions, 0);
  v_level := COALESCE(v_profile.level, 1);

  -- Streak milestones (7, 30, 100 days)
  IF v_streak IN (7, 30, 100) THEN
    INSERT INTO public.timeline_events (user_id, event_type, event_data, is_anonymous)
    VALUES (NEW.user_id, 'streak_milestone', jsonb_build_object('days', v_streak), false);
  END IF;

  -- Check-in milestones (every 50 contributions)
  IF v_total > 0 AND v_total % 50 = 0 THEN
    INSERT INTO public.timeline_events (user_id, event_type, event_data, is_anonymous)
    VALUES (NEW.user_id, 'check_in_milestone', jsonb_build_object('count', v_total), false);
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_contribution_timeline
  AFTER INSERT ON public.contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_timeline_event();
