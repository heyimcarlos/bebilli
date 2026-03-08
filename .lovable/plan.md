

## Plan: Compact Receipt List View + Fixed-Height Scrollable Tabs

### Problem
1. Receipt cards are tall and the list grows unbounded, making the receipts tab too long
2. All four tabs have different content heights, causing the footer buttons to shift around
3. Need a compact list → detail pattern for receipts

### Changes

#### 1. Fixed-Height Scrollable Tabs in `GroupPage.tsx` (lines 616-744)

Wrap each `TabsContent` in a fixed-height scrollable container. Use `h-[60vh]` (roughly 60% of viewport) so the tabs area is generous but consistent across all tabs. Each tab's inner content scrolls independently.

```
TabsContent → div with h-[60vh] overflow-y-auto + padding
```

This ensures the floating contribute/withdraw buttons at the bottom stay in a fixed position regardless of which tab is active.

#### 2. Redesign `ReceiptValidationHistory.tsx` — Compact List + Detail Dialog

Replace the current tall card-per-receipt layout with:

**List view**: Each receipt is a single compact row showing:
- Status badge (colored dot or small icon)
- Declared amount
- Date
- Small chevron or tap indicator

Clicking a row opens a **detail dialog** that shows the full receipt info (declared vs extracted amounts, currency conversion, receipt image, flagged warning) plus the Approve/Reject buttons.

This keeps the list compact (each item ~44px tall) and moves all detail into an on-demand modal.

**Component structure**:
- `ReceiptValidationHistory` renders a flat list of clickable rows
- New state: `selectedValidation: ReceiptValidation | null`
- A `Dialog` opens when a row is clicked, showing all the current card content + approve/reject buttons
- The image viewer dialog remains as a sub-dialog from the detail dialog

#### 3. Files to modify

1. **`src/pages/GroupPage.tsx`** — Add fixed `h-[60vh] overflow-y-auto` wrapper to each `TabsContent`
2. **`src/components/ReceiptValidationHistory.tsx`** — Refactor to compact list + detail dialog pattern

No database changes needed.

