## Plan: Feed as Home + Share to Feed after Contribution

### Overview

Three changes: (1) make the Feed the default tab after login, (2) default the feed filter to "Following", (3) add a "Share to Feed" modal after every successful contribution in GroupPage.

### Changes

#### 1. `src/pages/Index.tsx` — Default tab to feed

- Change `useState('home')` to `useState('feed')` on line 44

#### 2. `src/pages/TimelinePage.tsx` — Default filter to following

- Change `useState<'all' | 'following'>('all')` to `useState<'all' | 'following'>('following')` on line 24
- Enhance contribution event cards to show the caption from `event_data.caption` when present
- Add Avatar + username header to each card (already partially there, will polish)
- Add a "High Five" (🙌) reaction button using optimistic toggle against `timeline_reactions` table (if it exists, otherwise just local state for now)

#### 3. `src/pages/GroupPage.tsx` — Share to Feed modal after contribution

**New state:**

- `showShareModal: boolean`
- `shareCaption: string`
- `lastContributionData: { amount: number; groupName: string } | null`

**After successful contribution** (line ~297, after `setShowWinModal(true)`):

- Set `lastContributionData` and `showShareModal = true`

**New Dialog (Share to Feed modal):**

- Celebration header: "Contribution Verified! 🚀"
- Question: "Wanna share this milestone with your followers?"
- `Textarea` for optional caption
- "Post to Feed" button: inserts into `timeline_events` with `event_type: 'contribution'`, `event_data: { amount, group_name, caption }`
- "Not now" button: closes modal, no event created
- On post success: show toast "Shared to Feed! 🎉" and close

**Privacy:** The event is only created when the user explicitly clicks "Post to Feed". No automatic posting.

#### 4. `src/components/BottomNav.tsx` — No changes needed

The feed tab already exists.

### Database

No schema changes needed. The `timeline_events` table already supports arbitrary `event_data` jsonb and `event_type` text. The `caption` field will be stored inside `event_data`.

Check if `timeline_reactions` table exists — if it was created in previous approved plan, use it for High Five button. If not, skip reactions for now.

### Files to modify

1. `src/pages/Index.tsx` — default tab
2. `src/pages/TimelinePage.tsx` — default filter + render caption + polish cards
3. `src/pages/GroupPage.tsx` — share modal after contribution

The current homepage which is like the profile introduction of the user should be accessible through a tab in the bottom navigation which the label is the profile picture of the user. there the user should have the introduction with the data like their level and contributions, etc..