# UW Flow 2.0 Frontend

[![CircleCI](https://circleci.com/gh/UWFlow/uwflow.svg?style=svg)](https://circleci.com/gh/UWFlow/uwflow.svg?style=svg)

## ⚙️ Frontend Setup ⚙

From the monorepo root, run `make frontend-install`, `make hooks`, then
`make frontend-start`. Alternatively, run `bun install --frozen-lockfile` and
`bun run start` from this `frontend/` directory. The server runs at
[localhost:3000](http://localhost:3000).

Use Bun `1.3.14` and Node `22.20.0` (`.nvmrc`). Copy `.env.sample` to `.env.local`
for browser configuration overrides. Backend credentials belong in the root
`.env` and are not needed for frontend-only commands.

## 🎬 Building for Production 🎬

1. `bun run lint-nofix` and `bun run typecheck` to validate the application.
2. `bun run test -- --runInBand` to run unit tests.
3. `bun run build:vercel` to create a production build in `build` without uploading
   source maps. `bun run build` also uploads source maps and needs the intended
   Sentry credentials.

Vercel's project Root Directory is `frontend`; `vercel.json` defines its frozen
install, build, output, API/GraphQL rewrites, and SPA fallback. See the
[cutover runbook](../docs/monorepo-migration.md).

## 🌐 Interacting with the Backend 🌐

The backend is in the same repository. Follow the [root README](../README.md)
to start it. Schema and metadata live in `../hasura`; Go services live in `../flow`.

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
