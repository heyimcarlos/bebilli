

## Plan: Global UI Harmonization — Softer, Rounder Containers

### What
Increase the global border-radius of all container elements (cards, form boxes, modals, buttons) to create deeply rounded, puff-like containers that harmonize with the sculptural 3D logo. No features, data, or logic will be modified.

### Changes

#### 1. `src/index.css` — Increase global `--radius` variable
- Change `--radius: 1rem` to `--radius: 1.25rem` (both light and dark themes)
- Update `.glass-card` from `rounded-2xl` to `rounded-3xl`

#### 2. `src/components/ui/card.tsx` — Softer card containers
- Change default class from `rounded-lg` to `rounded-3xl` so every Card in the app gets deeply rounded corners

#### 3. `src/components/ui/dialog.tsx` — Softer dialog/modal containers
- Update the dialog content panel from `rounded-lg` to `rounded-3xl`

#### 4. `src/components/ui/sheet.tsx` — Softer sheet/drawer
- Update sheet content rounding to use `rounded-3xl` on the visible edge

#### 5. `src/components/ui/button.tsx` — Softer buttons
- Ensure default button variant uses the `--radius` variable (already does via `rounded-md`), but increase the base to `rounded-xl` for a puffier feel

#### 6. `src/components/BilliLogo.tsx` — No changes needed
- The logo `<img>` has no container box; it renders the asset directly with `object-contain`. No modification required.

### Files to modify
1. `src/index.css`
2. `src/components/ui/card.tsx`
3. `src/components/ui/dialog.tsx`
4. `src/components/ui/sheet.tsx`
5. `src/components/ui/button.tsx`

