# Frontend source

Read the [React guide](../../styleguide/frontend/react.md) for architecture
and data flow. For UI work, also read [components/AGENTS.md](components/AGENTS.md)
and the [design system guide](../../styleguide/frontend/design-system.md).

| Path | Owner |
| --- | --- |
| `pages/` | Route containers, feature hooks, and product UI |
| `components/` | Shared product components and UI primitives |
| `graphql/` | Queries, mutations, and fragments |
| `generated/` | Generated operation types; never hand-edit |
| `data/` | Existing Redux actions and reducers |
| `hooks/`, `utils/` | Hooks and pure logic shared across features |
| `constants/` | Product constants and legacy theme tokens |

Use `bun run generate` from `frontend/` for GraphQL output and inspect its diff.
Tests use Jest/jsdom. Follow the [frontend review](../../styleguide/frontend/review.md).
