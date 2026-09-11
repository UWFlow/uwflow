# GraphQL

## TypeScript code generation

TypeScript GraphQL types can be generated in `generated/graphql.tsx` by running `bun run generate`. This command should be run if the Hasura GraphQL schema changes or a new GraphQL query/mutation was added to the frontend. Note that this command requires the Hasura server to be running locally.

## Adding GraphQL queries and mutations

1. Add a new GraphQL query/mutation under the appropriate folder in `graphql`
   - Try to reuse common fragments under `graphql/fragments` or make your own if it can be used in multiple places
2. Generate types for your new fragment/query/mutation with `bun run generate`
3. Make GraphQL requests with Apollo and the generated types
