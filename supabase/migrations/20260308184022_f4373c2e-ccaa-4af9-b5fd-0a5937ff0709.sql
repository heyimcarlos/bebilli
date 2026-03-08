CREATE OR REPLACE FUNCTION public.notify_goal_proof_submitted()
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
      'goal_completed',
      '🏆 Prova de meta enviada!',
      COALESCE(v_user_name, 'Alguém') || ' enviou uma prova de conclusão no grupo ' || COALESCE(v_group_name, ''),
      jsonb_build_object('group_id', NEW.group_id, 'proof_id', NEW.id, 'submitter_id', NEW.user_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_goal_proof_submitted
  AFTER INSERT ON public.goal_completion_proofs
  FOR EACH ROW EXECUTE FUNCTION public.notify_goal_proof_submitted();