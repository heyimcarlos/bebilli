

## Plan: Move Ranking Outside Tabs & Fix Padding/Header Width

### 1. Move Ranking/Leaderboard outside tabs (GroupPage.tsx)

Currently the `AnimatedLeaderboard` is inside `<TabsContent value="ranking">` (line 608-615). Move it **above the Tabs section entirely**, right after the progress/stats card (after line 547). This way the leaderboard is always visible on the group page without needing to click a tab.

- Remove the "ranking" `TabsTrigger` and `TabsContent` from the Tabs
- Render `AnimatedLeaderboard` directly in the page flow between the progress card and the Tabs
- Keep the remaining tabs: consistency, chat, receipts, dream

### 2. Remove excessive bottom padding

- `GroupPage.tsx` line 365: Change `pb-32` → `pb-20` (just enough for BottomNav)
- `ConsistencyRanking.tsx`: Change `pb-24` → `pb-2`

### 3. Fix header width for desktop (Index.tsx)

Line 164: Remove `max-w-md` from the header inner div so the logo and menu stretch to full width on desktop:
```
<div className="flex items-center justify-between px-4 h-14 max-w-screen-xl mx-auto">
```

### Files to modify:
1. **`src/pages/GroupPage.tsx`** — Extract leaderboard above tabs, remove ranking tab, reduce `pb-32` to `pb-20`
2. **`src/components/ConsistencyRanking.tsx`** — Reduce `pb-24` to `pb-2`
3. **`src/pages/Index.tsx`** — Change `max-w-md` to `max-w-screen-xl` in header

