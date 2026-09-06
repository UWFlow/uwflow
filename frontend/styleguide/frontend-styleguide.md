# Frontend architecture style guide

## Where work belongs

```text
Route-specific behavior or layout?        -> src/pages/<feature>/
Used across multiple product features?    -> src/components/<domain>/
Generic visual/interaction primitive?     -> src/components/ui/
Remote data contract?                     -> src/graphql/ + generated types
Feature orchestration with side effects?  -> colocated useFeature hook
Pure logic with a second consumer?        -> src/utils/ or a feature utility
```

Keep route/page modules as connected containers. They may coordinate Apollo, routing, authentication, and feature state, but substantial pure rendering should move into presentational components. A small component with one simple query or navigation action does not need an artificial wrapper.

Shared layers must not import from `src/pages`. UI primitives must not import Apollo, Redux, the router, GraphQL types, product constants, or feature modules.

## Data flow and state

- Postgres/Hasura migrations in `../uwflow` define the source GraphQL contract. Documents live under `src/graphql/`; reuse fragments where fields represent the same entity view.
- Run `bun run generate` after document/schema changes and import types from `src/generated/graphql.tsx`. Never declare a parallel handwritten operation type or edit the generated file.
- Inspect every generated diff. Local codegen reads the running Hasura schema and can include unrelated backend changes.
- Apollo owns remote server state. Component state owns local interaction. A focused context may own one cross-tree concern.
- Treat Redux as legacy global application state. Add to it only when state is truly shared across routes and cannot live in the URL, Apollo cache, a feature hook, or a focused context.
- Add Apollo `typePolicies` when a Hasura entity has a composite/nonstandard identity, and cover the policy in `src/graphql/__tests__/cache.test.ts`.
- Keep network sequencing, optimistic behavior, and race handling inside a hook rather than scattering them through rendered markup.

## React and TypeScript

- Use functional components and hooks. Type props and public hook results; avoid `any` and unsafe casts.
- Use PascalCase component filenames and names. Hooks and variables use lowerCamelCase. Existing `components/ui` primitives use lower-case shadcn-style filenames and named exports; preserve that convention there.
- Prefer explicit variant unions for behavior that changes required props.
- Do not add `useMemo` or `useCallback` for cheap derivations. Memoize only measured work or identities that otherwise cause a real effect/render problem.
- Put tests beside feature code or in the existing adjacent `__tests__` folder. Extract pure transformations from components so they can be tested without rendering.
- Use absolute imports rooted at `src`, matching the current TypeScript configuration and import-order lint rules.

## Testing and verification

| Change | Checks |
| --- | --- |
| TypeScript/logic | Focused Jest test, then `bun run lint-nofix` |
| GraphQL document/schema | `bun run generate`, inspect generated diff, focused test, lint |
| UI primitive or Radix dependency | Interaction test, lint, `bun run build:vercel` |
| Visual/responsive UI | Above, plus narrow and wide viewport inspection and keyboard focus |
| Docs only | `git diff --check` and validate referenced paths |

Use `bun run build:vercel` for a local production build without Sentry upload. The full `bun run build` includes external sourcemap upload and should only run with the intended credentials/environment.

Tests should assert behavior through accessible roles, labels, and visible outcomes. Add a regression test for bug fixes when the affected boundary is testable. Cover loading, empty, error, disabled, and success states where they are meaningful.

## Cross-repository contract checklist

For a backend-dependent change, inspect `../uwflow` and confirm:

- migration and Hasura metadata/permissions exist for GraphQL fields;
- operation types were regenerated from the intended schema;
- authentication and anonymous-role behavior match the screen;
- cache identity remains stable;
- API route, JSON, calendar, and error semantics are backward-compatible or updated together.
