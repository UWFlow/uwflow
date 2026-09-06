# Shared components

## Purpose

Cross-feature product components and reusable UI primitives. `ui/` is the design-system destination; the other folders contain legacy and composed components that should migrate incrementally.

## For AI agents

- Read `../../styleguide/design-system-styleguide.md` and `.agents/skills/create-component/SKILL.md` from the repository root before UI work.
- Search existing primitives and components before creating one.
- New or modified visual UI uses Tailwind with named tokens; do not add styled-components.
- `ui/` primitives remain product-agnostic and use named exports, native props, refs, semantic CVA variants, and `cn()`.
- Preserve Radix accessibility and focus behavior. Call sites own placement; primitives own internal visuals and interaction states.
- Promote a feature component only after a second use or when centralized interaction/accessibility behavior clearly warrants it.
- After adding or changing a Radix/shadcn primitive, run focused interaction tests, `bun run lint-nofix`, and `bun run build:vercel`.

## Existing design-system seeds

| File | Role |
| --- | --- |
| `ui/button.tsx` | Destination button primitive and CVA variant pattern |
| `ui/dropdown-menu.tsx` | Radix dropdown composition |
| `ui/popover.tsx` | Radix popover composition |
| `../lib/utils.ts` | Tailwind-aware `cn()` utility (outside this directory) |
| `../constants/GlobalTheme.tsx` | Legacy token source mirrored by Tailwind (outside this directory) |

<!-- MANUAL: Add durable component-specific notes below this line. -->
