# UWFlow

This monorepo contains the React frontend, Go services, Hasura schema, and
deployment configuration. Read [README.md](README.md) for setup and commands.
`CLAUDE.md` imports this file.

## Start here

Read [general guidance](styleguide/general.md), then the local agent file and
area guide for the code you change. The [styleguide index](styleguide/index.md)
lists all guides. Apply [general review](styleguide/review.md) and the relevant
area review before opening a PR.

| Area | Entry point |
| --- | --- |
| React and frontend tooling | [frontend/AGENTS.md](frontend/AGENTS.md) |
| API, importer, email, shared Go | [flow/AGENTS.md](flow/AGENTS.md) |
| Schema and GraphQL permissions | [hasura/AGENTS.md](hasura/AGENTS.md) |
| Build, deploy, nginx, staging | [General guide](styleguide/general.md), [runtime review](styleguide/review.md#runtime-and-deployment) |

## Architecture

- Hasura owns ordinary authorized CRUD and relationship queries.
- Go owns custom HTTP, authentication, parsing, calendar, import, and email workflows.
- Schema and public API changes must account for consumers in `frontend/`.
- Keep transaction ownership at the operation boundary.

## Working safely

- Preserve uncommitted work. Never commit credentials, `.env`, database dumps, private keys, or Terraform state.
- `make clean`, `make setup`, and `make setup-contrib` replace or delete local state. Run them only when the user requests that outcome.
- Confirm the target and scope before import, vacuum, or staging replacement operations.
- Do not run ad hoc tests against production.
- Use disposable databases and containers for upgrade tests where possible.
- Keep browser checks lightweight and reuse a tab. Test performance when changing interactive behavior.

## Verification and PRs

Follow the [verification table](styleguide/general.md#verification). Frontend
commands run from `frontend/` or through root `make frontend-*` targets. The
`make test` and `make build-test` commands use the active API container; direct
Go commands run from `flow/`. Check the legacy `regtest/` imports before treating
that suite as a gate.

Create draft PRs with [bullet-only descriptions](styleguide/review.md#pr-descriptions).
For UI evidence, use the optional [browser tools](styleguide/frontend/browser-review.md). Do not install hooks or alter shared Git settings without considering
other worktrees.
