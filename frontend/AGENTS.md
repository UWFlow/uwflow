# Frontend

Read [README.md](README.md) for setup and [src/AGENTS.md](src/AGENTS.md) for source
ownership. `CLAUDE.md` imports this file.

## Guides

- [General](../styleguide/general.md): shared writing, testing, and verification.
- [React](../styleguide/frontend/react.md): components, state, and GraphQL contracts.
- [Design system](../styleguide/frontend/design-system.md): primitives, tokens, accessibility, and design review.
- [Frontend review](../styleguide/frontend/review.md): checks before opening a PR.

[docs/style-guide.md](docs/style-guide.md) describes legacy styled-components
code. The root styleguides govern new and modified UI.

## Commands

Use the Bun version in `.bun-version`. Run commands from this directory, or use
`make frontend-*` from the repo root. Before every commit, run
`bun run lint-nofix` and confirm it exits clean.

Use `bun run build:vercel` for a build without sourcemap upload. Regenerate
GraphQL output with `bun run generate` against the intended local schema.

## Skills

Before non-trivial work, list `.agents/skills/` and read skills whose descriptions
match the task. Keep implementation rules in the root styleguides; skills own
step-by-step workflows.
