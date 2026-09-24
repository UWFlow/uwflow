module.exports = {
  schema: [
    {
      'http://localhost:8080/v1/graphql': {
        headers: {
          'x-hasura-admin-secret': 'secretinprod',
        },
      },
    },
  ],
  // Exclude the generated output from the documents glob — it re-declares every
  // fragment, so including it causes duplicate-fragment-name errors on re-run.
  documents: ['./src/**/*.tsx', './src/**/*.ts', '!./src/generated/**'],
  overwrite: true,
  generates: {
    './src/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        // Emit a single `import * as Apollo from '@apollo/client'` instead of
        // the legacy split `@apollo/react-common` / `@apollo/react-hooks` imports.
        reactApolloVersion: 3,
        // Import `gql` from `@apollo/client` (which re-exports it) so we don't
        // depend on the separate `graphql-tag` package.
        gqlImport: '@apollo/client#gql',
        skipTypename: false,
        // Hasura custom scalars (bigint, numeric, timestamptz, …) have no GraphQL
        // type mapping. codegen v1 defaulted them to `any`; v4+ defaults to
        // `unknown`, which breaks existing call sites. Keep `any` to preserve
        // prior behavior (the codebase treats these scalars permissively).
        defaultScalarType: 'any',
        // Reference fragment types in operations (e.g. `Array<ReviewUpdateInfoFragment>`)
        // instead of inlining their fields. v3+ defaults to 'inline'; 'combine'
        // keeps the structure the codebase was written against and the previous
        // output used, minimizing churn.
        inlineFragmentTypes: 'combine',
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
  // Format the generated file so it satisfies Prettier and produces clean diffs.
  hooks: {
    afterOneFileWrite: ['prettier --write'],
  },
};
