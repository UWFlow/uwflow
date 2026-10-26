# Shared components

Read the [design system guide](../../../styleguide/frontend/design-system.md)
and the [component workflow](../../.agents/skills/create-component/SKILL.md).
Use the [frontend review](../../../styleguide/frontend/review.md) before opening a PR.

## Existing components

| Path | Role |
| --- | --- |
| `ui/button.tsx` | Button primitive and CVA variant pattern |
| `input/DropdownList.tsx` | Shared dropdown composition |
| `ui/popover.tsx` | Radix popover composition |

Token merging lives in [src/lib/utils.ts](../lib/utils.ts). The legacy color
source is [src/constants/GlobalTheme.tsx](../constants/GlobalTheme.tsx).

Search primitives first, then domain compositions, then the owning feature.
After changing a Radix primitive, run focused interaction tests, lint, and a
production build as described in the root verification guide.
