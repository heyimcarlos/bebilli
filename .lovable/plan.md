

## Plan: Refactor Header, SideDrawer, and Fix Mobile Responsiveness

### 1. Refactor Header (Index.tsx)

Remove the separate `LanguageCurrencyBar` fixed bar and the floating notification/hamburger buttons. Replace with a clean fixed header bar containing:
- App logo on the left
- Notification bell + hamburger menu on the right, using shadcn `Button variant="ghost" size="icon"`
- Adjust `pt-[60px]` to match new header height (~`pt-14`)

### 2. Convert SideDrawer to shadcn Sheet (SideDrawer.tsx)

Replace the custom framer-motion drawer with shadcn `Sheet` (side="right"):
- Move language and currency selectors from `LanguageCurrencyBar` into the Sheet content (below menu items or in a collapsible section)
- Use `SheetHeader`, `SheetContent`, `SheetTitle` for structure
- Keep existing menu items but style with shadcn `Button variant="ghost"`
- Remove `LanguageCurrencyBar` component import from Index.tsx

### 3. Fix Mobile Responsiveness (Multiple files)

- **BottomNav.tsx**: Confirm `z-50` and add `bg-card` (not `bg-card/90`) for solid background
- **ConsistencyRanking.tsx**: Add `pb-24` to the wrapper to prevent content hiding behind BottomNav
- **GroupPage.tsx**: Ensure main scrollable content areas have `pb-24`
- **Index.tsx**: Add `pb-20` to the main content wrapper div

### Files to modify:
1. **`src/pages/Index.tsx`** — Remove LanguageCurrencyBar, refactor header to single bar with ghost icon buttons
2. **`src/components/SideDrawer.tsx`** — Rewrite using shadcn Sheet, embed language/currency selectors
3. **`src/components/BottomNav.tsx`** — Ensure solid bg and proper z-index
4. **`src/components/ConsistencyRanking.tsx`** — Add bottom padding
5. **`src/components/LanguageCurrencyBar.tsx`** — Keep file but no longer rendered standalone; its logic moves into SideDrawer

