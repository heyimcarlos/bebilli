
## Plan: Standardize Brand Asset to New 3D Logo

### Overview
We will replace the existing logo across the entire application with the newly provided 3D tactile 'puff-style' interlocking 'L' and 'B' asset. The primary method will be replacing the source file used in the central `<BilliLogo />` component, which propagates the update to headers, login, splash screens, and the Admin Portal. We will also update the app icons and favicon to match the new branding.

### Implementation Steps

#### 1. Copy the new logo into the codebase
- Move `user-uploads://Logo_3D.png` to `src/assets/billi-logo-3d.png`.
- Copy the same asset to the `public/` directory to replace the PWA icons and favicon:
  - `public/billi-icon-192.png`
  - `public/billi-icon-512.png`
  - `public/favicon.ico` (Will convert/use as PNG in index.html)

#### 2. Update the central `<BilliLogo />` component
- Modify `src/components/BilliLogo.tsx` to import the new `billi-logo-3d.png`.
- Adjust image styling (like `borderRadius`) if needed, ensuring the 3D 'puff' style with its beveled border is not cut off.
- Verify `size` scaling logic remains intact so it functions correctly in small headers and large splash screens.

#### 3. Standardize stray references
- We will perform a scan across the codebase for any direct `<img>` tags referencing older assets (e.g., `billi-logo-full.png`, `billi-b-icon.png`, `billi-logo-new.png`) and replace them with the standard `<BilliLogo />` component to ensure a single source of truth.
- Update `index.html` to ensure the `<link rel="icon">` references the new asset properly.

#### 4. UI Validation (No logic changes)
- Contrast constraint: The `<BilliLogo />` component already supports a `variant` prop (`'default'` | `'white'`) for text, but the 3D graphic itself has a glossy white border that provides excellent legibility on both dark and light backgrounds. The asset will be displayed as-is without CSS color-filters.
- No modifications will be made to layout, logic, routing, or data fetching.

### Files to Modify
- `src/components/BilliLogo.tsx`
- `index.html`
- Asset file additions/replacements in `src/assets/` and `public/`
- Any individual pages (like Login, Splash) if they bypass the `BilliLogo` component.
