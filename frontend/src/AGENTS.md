# Frontend source

## Purpose

React application code, feature routes, shared components, GraphQL operations, state, hooks, and utilities.

## Main boundaries

| Path | Responsibility |
| --- | --- |
| `pages/` | Route-owned feature containers and UI |
| `components/` | Cross-feature components and design-system primitives |
| `graphql/` | Queries, mutations, and reusable fragments |
| `generated/` | Generated GraphQL output; never hand-edit |
| `data/` | Existing Redux actions/reducers |
| `hooks/` | Hooks reused across features |
| `utils/` | Shared pure transformations and helpers |
| `constants/` | Product constants and legacy styled-components theme tokens |

## For AI agents

- Read `../styleguide/frontend-styleguide.md` before changing application architecture or data flow.
- Read `components/AGENTS.md` and `../styleguide/design-system-styleguide.md` before changing UI.
- Preserve dependency direction: pages may import shared layers; shared layers do not import pages.
- Keep remote data in Apollo, local interaction in the component/feature hook, and new global state exceptional.
- Never hand-edit `generated/graphql.tsx`; use `bun run generate` and inspect its diff.
- Tests use Jest/jsdom. Prefer accessible selectors and user-visible outcomes.

<!-- MANUAL: Add durable source-wide notes below this line. -->
