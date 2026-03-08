

## Plan: Multi-Currency Display in ReceiptValidationHistory

This is a UI-only change to `ReceiptValidationHistory.tsx`. The three new DB columns (`extracted_currency`, `converted_amount`, `exchange_rate`) need to be added via migration first, then the component updated.

### 1. Database Migration

Add three nullable columns to `receipt_validations`:

```sql
ALTER TABLE public.receipt_validations
  ADD COLUMN extracted_currency text DEFAULT NULL,
  ADD COLUMN converted_amount numeric DEFAULT NULL,
  ADD COLUMN exchange_rate numeric DEFAULT NULL;
```

### 2. Update `ReceiptValidationHistory.tsx`

**Interface**: Add three optional fields:
- `extracted_currency?: string | null`
- `converted_amount?: number | null`
- `exchange_rate?: number | null`

**Imports**: Add `ArrowRightLeft` from lucide-react. Get `currency` from `useApp()`.

**Extracted amount display** (lines 180-185): Replace the simple extracted amount with conditional logic:

- If `v.extracted_currency` exists AND differs from `currency` (user's app currency):
  - Show original amount with currency badge (e.g., "US$ 50.00")
  - Show converted amount below with `ArrowRightLeft` icon, formatted in user's currency
  - Show exchange rate in 9px muted text
  - Apply match coloring to converted amount (not raw)

- Otherwise: keep current display unchanged.

**Match color logic**: Derive the effective comparison amount as `v.converted_amount ?? v.extracted_amount`. Apply green/amber based on whether this matches the declared amount (use existing `amount_match` field, which the backend already computes against the converted amount).

**Layout**: Use `flex flex-col gap-0.5` inside the extracted column to stack values vertically without overflow on mobile.

### Files to modify
1. **Migration** -- Add 3 columns
2. **`src/components/ReceiptValidationHistory.tsx`** -- Interface update, multi-currency display, ArrowRightLeft icon

