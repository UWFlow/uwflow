@README.md

## Architecture

This file is the canonical entry point for coding agents. `CLAUDE.md` is only an import shim. Read `src/AGENTS.md` plus the relevant guide under `styleguide/` before changing application code.

```text
uwflow Hasura schema -> GraphQL documents -> generated operation types
                                                |
                                                v
route/page container -> feature hook -> presentational composition -> UI primitive
```

Use these boundaries deliberately:

| Path | Responsibility |
| --- | --- |
| `src/pages/<feature>/` | Route-specific orchestration, feature hooks, and product UI |
| `src/components/` | Components reused across features |
| `src/components/ui/` | Product-agnostic visual and interaction primitives; the design-system destination |
| `src/graphql/` | GraphQL documents and fragments |
| `src/generated/graphql.tsx` | Generated GraphQL types; never hand-edit |
| `src/data/` | Existing Redux state; do not add global state without a cross-route requirement |
| `src/hooks/`, `src/utils/` | Shared hooks and pure utilities with more than one consumer |

Architecture and UI guidance:

- `styleguide/frontend-styleguide.md` covers feature boundaries, data flow, state, and testing.
- `styleguide/design-system-styleguide.md` defines component ownership, extraction criteria, token use, and accessibility.
- `src/components/AGENTS.md` is the local checklist for shared UI work.
- `docs/style-guide.md` documents legacy conventions. Where it conflicts, this file and `styleguide/` are authoritative.

## Pre-commit requirement

Before every commit, run `bun run lint-nofix` and confirm it exits clean. This is required by CI/CD — commits that fail it will not pass the pipeline.

## React memoization

Do **not** wrap cheap derived values in `useMemo` / `useCallback` by default.
Plain assignments are preferred for small maps, filters, one-element arrays,
and property reads.

Only memoize when there is a concrete reason, for example:

- the computation is measurably expensive, or
- a stable identity is required to avoid a real over-render / effect loop
  (document why in a short comment).

A new `[]` / `{}` each render is fine unless a dependency array or
`React.memo` child is clearly churning because of it — in that case prefer a
module-level constant empty value over wrapping the whole derivation in
`useMemo`.

## Design tokens (Tailwind)

When writing Tailwind classes, use the named design tokens from
`tailwind.config.js` instead of arbitrary `[Npx]` values. If a value you need
isn't in the scale, snap to the nearest token, or add a new named token to the
config (and document it here) — don't reach for arbitrary values. One-off
structural dimensions (a fixed illustration width, a 7px progress dot) may stay
as `[Npx]`.

- **Spacing** (padding / margin / gap): semantic t-shirt scale —
  `xs` 4px, `sm` 8px, `md` 16px, `lg` 24px, `xl` 32px (plus `page` 32px).
  e.g. `p-md`, `gap-sm`, `mb-lg`.
- **Font size**: `xs` 12, `sm` 14, `md` 16, `lg` 18, `xl` 20, `2xl` 28,
  `3xl` 32, `4xl` 40 (px). e.g. `text-sm`, `text-2xl`.
- **Border radius**: `rounded-card` (4px) for app cards/chips; the standard
  Tailwind `rounded-md` / `lg` / `xl` (6 / 8 / 12px) for larger surfaces.
- **Colors**: mirror `src/constants/GlobalTheme.tsx` (`primary`, `dark1`,
  `light2`, `accent`, …). Keep the two files in sync.
- **Box shadow**: `shadow-box` / `shadow-bottom-box` / `shadow-dark-box` for
  inline surfaces; `shadow-dropdown` for floating overlay panels (dropdown
  menus, popovers).

Note: spacing and font-size both expose `sm`/`md`/`lg` keys with different
pixel values (Tailwind keeps them in separate namespaces). `text-sm` is 14px;
`p-sm` is 8px.

`cn()` (`src/lib/utils.ts`) extends tailwind-merge with the named `spacing` and
`borderRadius` scales, so a call-site `px-3.5` correctly overrides a shared
component's `px-md`. Add any new named scale there too, or overrides against it
will silently keep both classes.

## Skills

This project keeps reusable skills under `.agents/skills/`. Each subdirectory contains a `SKILL.md` describing when and how to use it.

Before starting any non-trivial task, list `.agents/skills/` and read the `SKILL.md` of every skill whose description plausibly matches the task. Multiple skills may apply to one task — read all relevant ones before writing code or files. Treat each `SKILL.md` as authoritative for its domain.
