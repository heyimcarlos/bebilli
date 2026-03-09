

## Plan: Exclusive Logo Container Harmonization

### What
The `BilliLogo` component's `<img>` element currently has no `border-radius`, so any background or container edge appears sharp and geometric. The fix is entirely within `src/components/BilliLogo.tsx` — applying a deeply rounded `border-radius` to the `<img>` element itself. Since every usage across the app (Header, Login, HomePage, Profile, Admin, ShareProgress, Terms, Privacy) goes through this single component, one change propagates everywhere.

### Single File Change

**`src/components/BilliLogo.tsx`** — Add `rounded-[30%]` to the `<img>` className. This gives a deeply soft, amorphic rounding that mirrors the sculptural puff shape of the logo at any size, without affecting any other UI elements.

The `30%` value creates a curvature that harmonizes with the organic L/B shape — softer than a square but not a full circle, matching the beveled border aesthetic. The `object-contain` class ensures the image itself is never clipped.

No other files need modification. No features, logic, or layout changes.

