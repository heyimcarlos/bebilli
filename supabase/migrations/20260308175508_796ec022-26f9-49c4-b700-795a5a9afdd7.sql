-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read, created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert (via triggers with SECURITY DEFINER)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify on follow accept
CREATE OR REPLACE FUNCTION public.notify_follow_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_follower_name text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT name INTO v_follower_name FROM public.profiles WHERE id = NEW.follower_id;
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.follower_id,
      'follow_accepted',
      '🤝 Follow aceito!',
      COALESCE(v_follower_name, 'Alguém') || ' aceitou seu pedido de follow.',
      jsonb_build_object('following_id', NEW.following_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_follow_accepted
AFTER UPDATE ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION public.notify_follow_accepted();

-- Trigger: notify group members on new contribution
CREATE OR REPLACE FUNCTION public.notify_contribution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_name text;
  v_group_name text;
  v_member record;
BEGIN
  SELECT name INTO v_user_name FROM public.profiles WHERE id = NEW.user_id;
  SELECT name INTO v_group_name FROM public.groups WHERE id = NEW.group_id;

  FOR v_member IN
    SELECT user_id FROM public.group_memberships WHERE group_id = NEW.group_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_member.user_id,
      'contribution',
      '💰 Novo aporte em ' || COALESCE(v_group_name, 'grupo'),
      COALESCE(v_user_name, 'Alguém') || ' adicionou $' || NEW.amount,
      jsonb_build_object('group_id', NEW.group_id, 'amount', NEW.amount, 'contributor_id', NEW.user_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_contribution
AFTER INSERT ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.notify_contribution();

-- Trigger: notify on streak/level milestones (piggyback on existing update_user_streak)
CREATE OR REPLACE FUNCTION public.notify_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Level up
  IF NEW.level IS DISTINCT FROM OLD.level AND NEW.level > COALESCE(OLD.level, 0) THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (NEW.id, 'level_up', '⭐ Nível ' || NEW.level || '!', 'Parabéns! Você subiu para o nível ' || NEW.level || '.', jsonb_build_object('level', NEW.level));
  END IF;

  -- Streak milestones
  IF NEW.current_streak IN (7, 30, 60, 90, 180, 365) AND (OLD.current_streak IS NULL OR NEW.current_streak != OLD.current_streak) THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (NEW.id, 'milestone', '🔥 ' || NEW.current_streak || ' dias de streak!', 'Incrível! Você manteve ' || NEW.current_streak || ' dias consecutivos.', jsonb_build_object('streak', NEW.current_streak));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_milestone
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_milestone();

-- Trigger: notify on new follow request
CREATE OR REPLACE FUNCTION public.notify_follow_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_follower_name text;
BEGIN
  SELECT name INTO v_follower_name FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.following_id,
    'follow_request',
    '👤 Novo pedido de follow',
    COALESCE(v_follower_name, 'Alguém') || ' quer te seguir.',
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_follow_request
AFTER INSERT ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION public.notify_follow_request();

-- Trigger: notify on group join
CREATE OR REPLACE FUNCTION public.notify_group_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_name text;
  v_group_name text;
  v_member record;
BEGIN
  SELECT name INTO v_user_name FROM public.profiles WHERE id = NEW.user_id;
  SELECT name INTO v_group_name FROM public.groups WHERE id = NEW.group_id;

  FOR v_member IN
    SELECT user_id FROM public.group_memberships WHERE group_id = NEW.group_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_member.user_id,
      'group_join',
      '👋 Novo membro!',
      COALESCE(v_user_name, 'Alguém') || ' entrou no grupo ' || COALESCE(v_group_name, ''),
      jsonb_build_object('group_id', NEW.group_id, 'new_member_id', NEW.user_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_group_join
AFTER INSERT ON public.group_memberships
FOR EACH ROW
EXECUTE FUNCTION public.notify_group_join();