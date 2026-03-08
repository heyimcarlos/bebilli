CREATE TABLE public.goal_completion_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.goal_proof_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id uuid NOT NULL REFERENCES public.goal_completion_proofs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  approved boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proof_id, user_id)
);

ALTER TABLE public.goal_completion_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_proof_votes ENABLE ROW LEVEL SECURITY;

-- Proofs: members can view proofs for their groups
CREATE POLICY "Members can view group proofs" ON public.goal_completion_proofs
  FOR SELECT TO authenticated
  USING (is_group_member(group_id));

-- Proofs: members can insert their own proof
CREATE POLICY "Members can submit proof" ON public.goal_completion_proofs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_group_member(group_id));

-- Proofs: allow status update (for trigger/system)
CREATE POLICY "System can update proof status" ON public.goal_completion_proofs
  FOR UPDATE TO authenticated
  USING (is_group_member(group_id));

-- Votes: members can view votes
CREATE POLICY "Members can view votes" ON public.goal_proof_votes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.goal_completion_proofs p 
    WHERE p.id = proof_id AND is_group_member(p.group_id)
  ));

-- Votes: members can cast vote (not the proof owner)
CREATE POLICY "Members can vote" ON public.goal_proof_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.goal_completion_proofs p 
      WHERE p.id = proof_id AND is_group_member(p.group_id) AND p.user_id != auth.uid()
    )
  );

-- Function to auto-approve when all members voted
CREATE OR REPLACE FUNCTION public.check_proof_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_proof RECORD;
  v_total_members integer;
  v_total_approvals integer;
  v_total_rejections integer;
BEGIN
  SELECT * INTO v_proof FROM goal_completion_proofs WHERE id = NEW.proof_id;
  
  SELECT COUNT(*) INTO v_total_members 
  FROM group_memberships WHERE group_id = v_proof.group_id AND user_id != v_proof.user_id;
  
  SELECT 
    COUNT(*) FILTER (WHERE approved = true),
    COUNT(*) FILTER (WHERE approved = false)
  INTO v_total_approvals, v_total_rejections
  FROM goal_proof_votes WHERE proof_id = NEW.proof_id;
  
  -- If all non-owner members approved
  IF v_total_approvals >= v_total_members THEN
    UPDATE goal_completion_proofs SET status = 'approved' WHERE id = NEW.proof_id;
  -- If majority rejected
  ELSIF v_total_rejections > v_total_members / 2 THEN
    UPDATE goal_completion_proofs SET status = 'rejected' WHERE id = NEW.proof_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_proof_vote_check_approval
  AFTER INSERT ON public.goal_proof_votes
  FOR EACH ROW EXECUTE FUNCTION public.check_proof_approval();