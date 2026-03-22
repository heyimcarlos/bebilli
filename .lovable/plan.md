

## Social Proof Counter on Login/Signup Page

### What we're building
A real-time badge below the hero title on the login page showing "Join [X] active saving groups worldwide right now." The number updates live via Supabase Realtime and animates with a ticker/odometer effect.

### Implementation

**1. New component: `src/components/SocialProofCounter.tsx`**
- On mount, query `groups` table count via `supabase.from('groups').select('*', { count: 'exact', head: true })` using the `groups_public` view (no RLS restriction).
- Subscribe to Supabase Realtime on `public.groups` table for `INSERT` events; increment count on each new group.
- Use the existing `AnimatedCounter` component for the odometer/ticker animation on the number.
- Styling: glassmorphism badge (`backdrop-blur-md bg-white/70 dark:bg-card/70 border border-primary/20 rounded-full px-5 py-2`), number in bold orange (`text-[#FF5F00] font-bold`), rest in muted foreground.
- Pulsing dot indicator to signal "live" status.

**2. Database: Enable Realtime on `groups` table**
- Migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;`

**3. Integrate into `LoginPage.tsx`**
- Import `SocialProofCounter` and place it between the hero `<h1>` title (line 326) and the subtitle `<p>` (line 327).

### Technical details
- `groups_public` is an unprotected view — use it for the count query so unauthenticated users can see it.
- Realtime channel subscribes to `postgres_changes` on `public.groups` INSERT events.
- Cleanup: unsubscribe from channel on unmount.
- `AnimatedCounter` already has easeOutQuart animation built in — reuse it for the odometer effect.

