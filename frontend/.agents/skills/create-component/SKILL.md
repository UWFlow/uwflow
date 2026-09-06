---
name: create-component
description: How to create or modify a React UI component in the uwflow frontend — file layout, TypeScript conventions, and the Tailwind-first styling rules (use the tailwind.config.js design tokens; do not add new styled-components).
---

# Creating a Component

Follow this when adding a new React component or changing existing UI.

## 1. File layout & conventions

- Put components under `src/components/<feature>/ComponentName.tsx` (PascalCase
  filename = component name).
- Write a functional component with hooks and a `default export`.
- Type props with a TypeScript `interface` / `type`; avoid `any`.
- Icons come from `react-feather` (e.g. `import { GitHub } from 'react-feather'`).
  In-app navigation uses `Link` from `react-router-dom`.

```tsx
import React from 'react';

interface Props {
  label: string;
}

const MyThing = ({ label }: Props) => <div className="...">{label}</div>;

export default MyThing;
```

## 2. Styling: Tailwind, not styled-components

**Use Tailwind utility classes for all new and modified UI. Do NOT add new
`styled-components`.** The many existing styled-components files may remain;
migrate them to Tailwind opportunistically when you touch the file
(`src/components/navigation/Footer.tsx` is an example migration: its old
`styles/Footer.tsx` was deleted and the styles became utility classes).

Always use the named design tokens defined in `tailwind.config.js` instead of
arbitrary `[Npx]` values:

| Kind | Tokens |
|---|---|
| Colors | `primary`, `primaryDark`, `primaryExtraDark`, `dark1`–`dark3`, `light1`–`light4`, `accent`, `red`, … — mirror `src/constants/GlobalTheme.tsx`, keep the two in sync |
| Font size | `text-xs` 12 / `text-sm` 14 / `text-md` 16 / `text-lg` 18 / `text-xl` 20 / `text-2xl` 28 / `text-3xl` 32 / `text-4xl` 40 (px) |
| Font family | `font-inter`, `font-anderson` |
| Font weight | `font-light` 300 / `font-regular` 400 / `font-semibold` 600 / `font-extrabold` 800 |
| Typography | `text-body` (Inter / 16px / 400) — a config `addUtilities` class; prefer it over repeating `font-inter text-md font-regular` |
| Radius | `rounded-card` (4px) for cards/chips |
| Spacing | t-shirt scale: `xs` 4 / `sm` 8 / `md` 16 / `lg` 24 / `xl` 32 (px), plus `page` 32 — e.g. `p-md`, `gap-sm`, `mr-xl` (not `p-4`, `gap-2`, `mr-8`) |
| Hover | `brightness-hover` (0.85), `duration-hover` (100ms), `ease-hover` (ease-in) — e.g. `transition-all duration-hover ease-hover hover:brightness-hover` |
| Breakpoints (min) | `mobileLarge` 600, `tablet` 800, `desktop` 1200 |
| Breakpoints (max) | `tabletDown` (max 800), `mobileDown` (max 500) |

Bundle repeated typography into one config-defined utility instead of repeating
the same `font-family` / `text-size` / `font-weight` trio across elements: use
`text-body`, and when you need another recurring text style add a similar named
utility to the config's `addUtilities` plugin.

If a value you need isn't in the scale, snap to the nearest token or add a new
named token to `tailwind.config.js` (and document it) — don't reach for
arbitrary values. Before writing an arbitrary `[value]` (a brightness, a
duration, an easing, a size), grep `tailwind.config.js` for an existing
semantic token first. One-off structural dimensions (a fixed illustration
width, a 7px progress dot) may stay as `[Npx]`.

Notes:

- Tailwind's preflight is disabled (the app ships its own reset in
  `public/index.css`), so set any resets you rely on explicitly.
- Arbitrary max-width responsive variants like `max-[500px]:flex-col` do NOT
  compile in this project — they silently emit no CSS. Use a named max-width
  screen instead (`mobileDown:flex-col`, `tabletDown:...`). If you need another
  max-width breakpoint, add a named screen to `tailwind.config.js` and use it.

## 3. Before committing

Run `bun run lint-nofix` and confirm it exits clean — this is required by CI.
