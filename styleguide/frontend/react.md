# Frontend style guide

Follow the [general guide](../general.md) for writing,
tests, and verification, and the [design system guide](design-system.md)
for visual primitives. Paths below are relative to `frontend/`.

## Ownership

| Work | Owner |
| --- | --- |
| Route behavior and layout | `src/pages/<feature>/` |
| Product composition shared across features | `src/components/<domain>/` |
| Visual and interaction primitives | `src/components/ui/` |
| GraphQL documents and generated types | `src/graphql/` and `src/generated/graphql.tsx` |
| Feature effects and sequencing | Colocated feature hook |
| Pure logic shared by consumers | Feature utility or `src/utils/` |

- Keep page containers responsible for queries, routing, authentication, and feature state.
- Extract substantial rendering into presentational components. A small component with one query does not need an extra wrapper.
- Keep shared components independent of `src/pages`.
- Keep primitives independent of Apollo, Redux, routing, GraphQL types, and product constants.

## Data and state

- Treat `../hasura` as the GraphQL schema and permissions source.
- Reuse fragments for the same entity view.
- Run `bun run generate` after schema or document changes. Import operation types from the generated file.
- Inspect generated diffs for unrelated changes from the local Hasura schema.
- Use Apollo for remote state and component state for local interaction.
- Use the URL for state that should survive navigation or be shareable.
- Use a focused context for cross-tree concerns. Add Redux state only when an existing global concern requires it.
- Define Apollo cache identity for composite or nonstandard keys and cover it in `src/graphql/__tests__/cache.test.ts`.
- Keep sequencing, optimistic updates, and race handling in the owning hook.

## React and TypeScript

- Use functional components and typed props and hook results.
- Prefer guards and narrowing over `any`, unsafe casts, or non-null assertions.
- Use discriminated unions when a mode changes which fields are required. Keep independent facts as booleans.
- Use `??` when only null or undefined should trigger a fallback; preserve valid `0`, `false`, and empty strings.
- Preserve PascalCase component filenames and lowerCamelCase hooks. Keep lower-case filenames and named exports for existing UI primitives.
- Use absolute imports rooted at `src` and follow the configured import ordering.
- Avoid memoizing cheap derivations. Use memoization for measured work or identities needed to prevent an effect or render problem.
- Extract pure transformations so they can be tested independently of rendering.

## Tests

- Put tests beside feature code or in its existing `__tests__` directory.
- Assert behavior through user actions, accessible roles, labels, and visible results.
- Cover meaningful loading, empty, error, disabled, and success states.
- Inspect phone and desktop layouts, keyboard focus, and changed interactions.
- Measure responsiveness when changing rendering, scrolling, or interaction behavior.
