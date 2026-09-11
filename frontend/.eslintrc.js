module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/extensions': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/prefer-default-export': 'off',
    'linebreak-style': ['error', 'unix'],
    'max-len': [0, 80, 2],
    'no-case-declarations': 'off',
    'no-console': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'object-curly-newline': 'off',
    'prefer-spread': 'off',
    'react/display-name': 'off',
    'react/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'simple-import-sort/sort': [
      'error',
      {
        groups: [
          // Packages, `react` related packages come first.
          ['^react', '^@?\\w'],
          // Internal packages
          ['^(@|constants|components|data|graphql|hooks|img|lib|pages|search|types|utils)(/.*|$)'],
          // Side effect imports
          ['^\\u0000'],
          // Parent imports, put `..` last
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports, put same-folder imports and `.` last
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports
          ['^.+\\.s?css$'],
        ],
      },
    ],
    'sort-imports': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    jest: true,
  },
  plugins: ['simple-import-sort', 'import'],
};
