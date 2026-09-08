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

### Two Vercel previews per PR

Connect two Vercel projects to `UWFlow/uwflow_frontend`, both using the repository
root and the build settings in `vercel.json`:

| Vercel project | `REACT_APP_BACKEND_PATH` (Preview environment) |
| --- | --- |
| `uwflow-frontend` (existing) | `/prod` |
| `uwflow-frontend-staging` (new) | `/staging` |

Import the same repository again in Vercel to create the staging project. Set
each value for **all Preview branches**, and remove any branch-specific overrides
that would select a different backend. Leave `REACT_APP_BACKEND_ENDPOINT` and
`REACT_APP_GRAPHQL_ENDPOINT` unset in Preview, since they override this setting.
If the new project's main-branch deployment should also use staging, set
`REACT_APP_BACKEND_PATH=/staging` in its Production environment too.

Every PR branch push will build both projects. Vercel's GitHub integration lists
both deployments and preview links on the PR; no GitHub Actions or labels are
needed. See [Vercel's multiple-project Git integration](https://vercel.com/docs/monorepos).
Redeploy existing previews after changing environment variables.

Both previews make same-origin requests: `vercel.json` proxies `/prod/api/...`
and `/prod/graphql` to `https://uwflow.com`, and `/staging/api/...` and
`/staging/graphql` to `https://jerryzhou.ca/staging`. Production-backed previews
read and write live production data.

Leave the setting unset for the production site behind its existing reverse
proxy. Local development continues to use localhost endpoints.

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
