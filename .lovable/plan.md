

## Plan: Peer-to-Peer Receipt Approval Flow

### 1. Database Migration — New RLS policy on `receipt_validations`

Add a policy allowing any group member (except the receipt owner) to update validations:

```sql
CREATE POLICY "Group members can update validation status"
ON public.receipt_validations
FOR UPDATE
TO authenticated
USING (is_group_member(group_id) AND user_id != auth.uid())
WITH CHECK (is_group_member(group_id) AND user_id != auth.uid());
```

Keep the existing admin policy as an override (admins can approve their own if needed).

### 2. Update `ReceiptValidationHistory.tsx`

- Import `Check`, `X`, `XCircle` from lucide-react, `Button` from shadcn/ui
- Add `rejected` badge case (red, XCircle icon)
- Add `handleUpdateStatus(id: string, newStatus: 'approved' | 'rejected')`:
  - Optimistically update local `validations` state
  - Call `supabase.from('receipt_validations').update({ validation_status: newStatus }).eq('id', id)`
  - Revert on error, show toast
- For each card where `validation_status` is `'pending'` or `'flagged'` AND `v.user_id !== user?.id`, render:
  - Green "Approve" button (Check icon)
  - Red/ghost "Reject" button (X icon)

### 3. Filter contributions by receipt status in `useGroups.ts`

In the `fetchGroups` callback, after fetching contributions (line 145):

- Also fetch `receipt_validations` for the group: `select('contribution_id, validation_status').eq('group_id', group.id)`
- Build a `Set<string>` of contribution IDs that have a validation record with `validation_status !== 'approved'` (i.e., pending/flagged/rejected contributions)
- When summing `contributionsByUser`, skip contributions whose `id` is in that set
- Separately compute `pendingByUser` for contributions with pending/flagged status
- Add `user_pending: number` to `GroupWithDetails` interface

### 4. Pending indicator in `GroupPage.tsx`

After the "Your Contribution" line (around line 541-542), add:

```tsx
{group.user_pending > 0 && (
  <div className="flex items-center justify-between text-xs mt-1">
    <span className="text-amber-500 flex items-center gap-1">
      <Clock className="w-3 h-3" /> Pending Verification
    </span>
    <span className="text-amber-500">{formatCurrency(group.user_pending)}</span>
  </div>
)}
```

### Files to modify
1. **Migration** — New RLS policy
2. **`src/components/ReceiptValidationHistory.tsx`** — Approve/Reject UI + optimistic updates + rejected badge
3. **`src/hooks/useGroups.ts`** — Filter by receipt status, add `user_pending`, update contribution ID in select
4. **`src/pages/GroupPage.tsx`** — Pending verification indicator

