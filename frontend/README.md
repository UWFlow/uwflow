# UW Flow 2.0 Frontend

[![CircleCI](https://circleci.com/gh/UWFlow/uwflow_frontend.svg?style=svg)](https://circleci.com/gh/UWFlow/uwflow_frontend.svg?style=svg)

## ⚙️ Frontend Setup ⚙

1. `bun install` to install dependencies
2. `bun run start` to run the server locally at [localhost:3000](localhost:3000)

## 🎬 Building for Production 🎬

1. `bun run lint` to check that there are no linter errors, otherwise the site will not compile
2. `bun run build` to create a new production build in the `build` folder

## 🌐 Interacting with the Backend 🌐

Clone the [backend repository](https://github.com/UWFlow/uwflow) and follow its [README](https://github.com/UWFlow/uwflow/blob/main/README.md)

## 📚 Documentation 📚

- [Code style guide](docs/style-guide.md)
- [GraphQL and TypeScript code generation](docs/graphql.md)
- [Using and creating modals](docs/modals.md)
- [Creating new pages](docs/pages.md)
- [Explanation of client-side search](docs/search.md)
- [Analytics (PostHog)](docs/analytics.md)

#### Important External Docs

- [React](https://reactjs.org/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [TypeScript](https://www.typescriptlang.org/index.html)
