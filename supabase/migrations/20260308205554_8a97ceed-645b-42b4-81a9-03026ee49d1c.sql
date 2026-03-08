CREATE POLICY "Group members can update validation status"
ON public.receipt_validations
FOR UPDATE
TO authenticated
USING (is_group_member(group_id) AND user_id != auth.uid())
WITH CHECK (is_group_member(group_id) AND user_id != auth.uid());