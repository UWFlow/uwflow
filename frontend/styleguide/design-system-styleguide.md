# Design system style guide

`src/components/ui` is the destination for reusable visual and interaction primitives. The goal is a small coherent system built from existing UWFlow tokens and accessible Radix/native behavior, not a parallel component library.

## Reuse before creation

Before writing UI, search in this order:

1. `src/components/ui/` for a primitive or variant.
2. `src/components/input/`, `display/`, `modal/`, `common/`, and `navigation/` for an existing composition.
3. The owning feature for a local component that can be extended or promoted.

Add a variant to an existing primitive when semantics match. Do not copy a class bundle or create a third implementation of the same control.

## Component layers

| Layer | May know about | Must not know about |
| --- | --- | --- |
| `components/ui` | Native props, Radix state, CVA variants, tokens, focus/keyboard/ARIA behavior | Routes, Apollo, Redux, GraphQL/product types, feature copy |
| `components/<domain>` | Shared product composition and product vocabulary | Route-specific orchestration |
| `pages/<feature>` | Queries, navigation, feature state, route layout | Private internals of primitives |

Call sites own placement and surrounding layout. A primitive owns its internal spacing, typography, interaction states, accessibility, and variants.

## When to extract

Extract a primitive when either condition is true:

- a second real use needs the same semantics and interaction; or
- centralizing accessibility, focus management, keyboard behavior, or state handling prevents likely drift.

Keep one-off product compositions local. Do not build speculative configuration-heavy components. Large files are candidates for decomposition, but split around behavior, data, or visual responsibilities rather than a line-count target.

## Primitive API

- Reusable primitives use semantic variants and sizes (`variant="destructive"`, `size="sm"`) through CVA and `cn()`.
- Do not expose raw color, margin, padding, or pixel props. Consumers can use `className` for exceptional layout, while recurring visual choices become variants.
- Forward refs and native element props so primitives compose with forms, tooltips, focus management, and `asChild` patterns.
- Use named exports for `components/ui` primitives. Keep legacy feature/component export style unchanged unless migrating the component.
- Prefer Radix for overlays, dropdowns, popovers, dialogs, and tabs. Preserve its focus restoration, keyboard navigation, portals, and ARIA wiring.
- Use native semantic elements before building custom keyboard behavior.

## Tokens and styling

- Use Tailwind for all new and modified visual UI. Do not add styled-components.
- Use named tokens from `tailwind.config.js` for color, spacing, type, radius, shadow, motion, and breakpoints. Arbitrary values are reserved for genuinely one-off structural dimensions.
- `tailwind.config.js` colors mirror `src/constants/GlobalTheme.tsx`; update them together during the transition.
- When adding named spacing or radius tokens, also update `src/lib/utils.ts` so `cn()` can resolve conflicting utilities correctly.
- Tailwind preflight is disabled. Primitives must explicitly normalize browser styles they rely on.
- Use named max-width screens; arbitrary max-width variants do not compile reliably in this Webpack 4 setup.
- Base classes should describe the narrow/mobile layout, with min-width variants enhancing wider screens.

## Accessibility and states

Every interactive primitive should provide or preserve:

- a visible keyboard focus state and logical focus order;
- an accessible name, and descriptions/errors when applicable;
- keyboard activation and escape/dismiss behavior appropriate to its role;
- disabled and loading behavior that prevents duplicate actions;
- touch-friendly targets and no hover-only path to required content;
- reduced-motion behavior when animation is nonessential.

Feature compositions explicitly render meaningful loading, empty, error, and success states. Tests select controls by role/label and assert user-visible behavior rather than implementation details.
