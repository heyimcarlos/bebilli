

## Plan: Premium Gamified Leaderboard Styling

### Changes to `src/components/animations/AnimatedLeaderboard.tsx`

**1. Import Card from shadcn/ui** — Add `Card` import at top.

**2. Wrap entire return in a Card** with premium styling:
```
<Card className="p-5 mt-2 border-border/50 shadow-sm rounded-2xl overflow-hidden">
```

**3. Add title area** before the competition badge:
```
<div className="flex items-center gap-2 mb-5">
  <Trophy className="w-5 h-5 text-yellow-500" />
  <h3 className="text-lg font-bold tracking-tight">
    {t("leaderboard") || "Leaderboard"}
  </h3>
</div>
```

**4. Restyle the "rest" list rows** (lines 188-230) — replace `glass-card` with cleaner styling and add top-3-style tinting for rows 4+:
- Base: `rounded-xl p-3 flex items-center gap-3 transition-colors hover:bg-muted/50 border border-transparent`
- Current user highlight: `border-primary/30 bg-primary/5`

**5. Add a contribution progress bar** to each row showing relative contribution (member amount / max amount):
- After the name/sub-value section, add a small bar:
```
<div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-1">
  <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
       style={{ width: `${(member.total_contribution / maxContribution) * 100}%` }} />
</div>
```
- Compute `maxContribution` as `Math.max(...members.map(m => m.total_contribution), 1)` at the top of the component.

**6. Enhance podium section** — add a subtle divider line (`<Separator />`) between the podium and the rest list.

### Changes to `src/pages/GroupPage.tsx`

**Line 598**: Remove `px-6` from the leaderboard wrapper since the Card now handles its own padding:
```
<div className="px-4 mb-4 relative z-0">
```

### Files to modify:
1. **`src/components/animations/AnimatedLeaderboard.tsx`** — Card wrapper, title, row styling, progress bars
2. **`src/pages/GroupPage.tsx`** — Adjust wrapper padding

