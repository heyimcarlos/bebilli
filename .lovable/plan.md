

## Plan: Unanimous Receipt Approval with Vote Tracking

### Database Change

Add an `approved_by` column (text array) to `receipt_validations`:

```sql
ALTER TABLE public.receipt_validations 
ADD COLUMN approved_by text[] NOT NULL DEFAULT '{}';
```

No new RLS policies needed — existing UPDATE policies already cover group members.

### Component Changes — `src/components/ReceiptValidationHistory.tsx`

**1. Props update**: Add `memberCount: number` prop (passed from GroupPage) so the component knows how many votes are needed.

**2. Interface update**: Add `approved_by: string[]` to `ReceiptValidation`.

**3. Rewrite `handleUpdateStatus`**:
- **Approve click**: 
  - Compute new `approved_by` = `[...current, user.id]`
  - Required votes = `memberCount - 1`
  - If `approved_by.length === required`: update DB with `validation_status: 'approved'` + `approved_by`
  - Otherwise: update DB with `approved_by` only (status stays pending)
- **Reject click**: Immediately set `validation_status: 'rejected'`

**4. UI changes in detail dialog**:
- Show approval progress: `"Approvals: 2 / 4"` with a small progress bar for pending/flagged receipts
- If current user already in `approved_by`: show "✓ You approved this" instead of buttons
- If user is the uploader: no buttons (existing logic)
- Disable buttons while updating (existing logic)

**5. Compact list row**: Add small `"2/4"` vote count badge for pending items.

### `src/pages/GroupPage.tsx`

Pass `memberCount={group.members.length}` to `<ReceiptValidationHistory>`.

### Files to modify
1. **Database migration** — add `approved_by text[]` column
2. **`src/components/ReceiptValidationHistory.tsx`** — vote logic + UI
3. **`src/pages/GroupPage.tsx`** — pass `memberCount` prop

