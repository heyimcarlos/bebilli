

## Plan: Feed as Home tab + Remove filter toggle

### Changes

#### 1. `src/components/BottomNav.tsx`
- Change the first tab from `{ id: 'feed', icon: Activity, label: 'Feed' }` to `{ id: 'feed', icon: Home, label: t('home') || 'Home' }`
- Import `Home` from lucide-react instead of `Activity`

#### 2. `src/pages/TimelinePage.tsx`
- Remove the `filter` state entirely — always fetch "following" mode
- Remove the filter toggle UI (lines 185-196, the "Following" / "Everyone" buttons)
- Hardcode `followingIds` logic to always run (no `filter` check)
- Update empty state text to remove filter-specific messaging — just show "Follow people to see their updates here!"

#### 3. `src/pages/Index.tsx`
- No changes needed — `activeTab` already defaults to `'feed'`

### Files to modify
1. `src/components/BottomNav.tsx` — icon + label
2. `src/pages/TimelinePage.tsx` — remove filter state/UI, always use following mode

