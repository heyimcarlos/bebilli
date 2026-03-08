

## Plan: Fix GroupPage Overlapping Issues

### Problem Analysis
1. **Action buttons** (Withdraw/Add Contribution) are `fixed bottom-24 z-40` (line 740), but the main container only has `pb-20` (line 365) — not enough padding for content to scroll past them.
2. **Leaderboard + ConsistencyRanking** are stacked vertically (leaderboard at line 598, consistency in TabsContent at line 617) — they should flow normally without overlap. The leaderboard's framer-motion animations may cause stacking context issues.

### Changes

**File: `src/pages/GroupPage.tsx`**

1. **Line 365**: Change `pb-20` → `pb-44` on the main container. The fixed buttons sit at `bottom-24` (~6rem) and are `h-14` (~3.5rem) tall, so we need ~`pb-44` (11rem) to ensure content scrolls fully past both the buttons and the BottomNav.

2. **Line 598**: Wrap the leaderboard section in `relative z-0` to establish a clean stacking context and prevent any animation frames from overlapping the tabs:
   ```
   <div className="px-6 mb-4 relative z-0">
   ```

3. **Line 608**: Give the tabs container a proper stacking context with `relative z-10` so tabs always render above the leaderboard:
   ```
   <div className="px-6 relative z-10">
   ```

**File: `src/components/ConsistencyRanking.tsx`** — Already has `pb-2`, no change needed.

### Summary
- Increase bottom padding to `pb-44` so scrollable content clears the fixed action buttons + BottomNav
- Add `relative z-0` to leaderboard wrapper and `relative z-10` to tabs wrapper to fix stacking order

