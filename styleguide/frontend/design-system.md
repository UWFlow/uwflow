# Design system style guide

Follow the [frontend guide](react.md) for data and component ownership.
Paths below are relative to `frontend/`.

## Reuse

- Search `src/components/ui/` first, then existing input, display, modal, common, and navigation components.
- Extend an existing variant when semantics match.
- Keep feature-specific compositions in their feature directory.
- Extract a primitive for a second real use or to centralize accessibility and interaction behavior.
- Split components around responsibilities rather than a line-count target.

## Component APIs

- Let call sites own placement and surrounding layout.
- Let primitives own internal spacing, typography, states, and accessibility.
- Expose semantic variants and sizes through CVA and `cn()`.
- Prefer variants for recurring visual choices. Use `className` for exceptional layout.
- Avoid raw color, margin, padding, and pixel props.
- Forward refs and native props so controls compose with forms, tooltips, and focus management.
- Use named exports for UI primitives. Preserve existing feature exports during unrelated work.
- Prefer native elements and Radix behavior for keyboard handling, overlays, portals, and focus restoration.

## Tokens

- Use Tailwind for new and modified UI. Do not add styled-components.
- Use named tokens from `tailwind.config.js`. Reserve arbitrary values for one-off structural dimensions.
- Check existing tokens before adding one. A token should represent a reusable design decision.
- Keep Tailwind colors and `src/constants/GlobalTheme.tsx` aligned during the transition.
- Update `src/lib/utils.ts` when adding spacing or radius tokens so `cn()` resolves conflicts.
- Normalize browser styles explicitly where needed; Tailwind preflight is disabled.
- Start with the phone layout and enhance it at wider breakpoints.
- Use configured max-width screens; arbitrary max-width variants do not compile reliably in this Webpack setup.

## Interaction

- Provide an accessible name, visible focus, and logical focus order.
- Preserve keyboard activation, Escape dismissal, and focus restoration for overlays.
- Make required actions available without hover and provide usable touch targets.
- Prevent duplicate actions while a control is disabled or submitting.
- Use motion to explain a state change. Keep interrupted interactions responsive.
- Respect reduced motion and keep content visible when animation is removed.
- Re-measure content-sized elements when their contents or viewport change.

## Design review

- Render real interactive components for before/after comparisons.
- Group desktop before/after side by side, then phone before/after side by side.
- Show affected examples and essential comparison controls.
- Prefer infinite scrolling for large sets and render only nearby examples.
- Check keyboard behavior, narrow-screen overflow, and scrolling performance.
