module.exports = {
  schema: [
    {
      'http://localhost:8080/v1/graphql': {
        headers: { 'x-hasura-admin-secret': 'secretinprod' },
      },
    },
  ],
  documents: ['./src/**/*.{ts,tsx}', '!./src/generated/**'],
  overwrite: true,
  generates: {
    './src/generated/graphql.tsx': {
      plugins: ['typescript-operations'],
      config: {
        defaultScalarType: 'any',
        inlineFragmentTypes: 'combine',
      },
    },
  },
  hooks: { afterOneFileWrite: ['prettier --write'] },
};
