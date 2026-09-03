<!-- Generated: 2026-09-02 | Updated: 2026-09-02 -->

# UWFlow backend

This file is the canonical guide for coding agents working in this repository. `CLAUDE.md` is only an import shim. Read the relevant local `AGENTS.md` and linked style guide before changing a subsystem.

UWFlow is a small collection of services around one Postgres schema:

```text
Hasura migrations + metadata -> Postgres/GraphQL contract -> uwflow_frontend
                                      ^
                                      |
                 Go API + UW importer + email worker
                                      ^
                                      |
                           flow/common primitives
```

Changes on the left can affect every consumer to the right. Search the frontend repository when changing GraphQL fields, permissions, API routes or JSON, JWT claims, error codes, calendar output, or product-visible links.

## Repository map

| Path | Responsibility | Read before editing | Verify |
| --- | --- | --- | --- |
| `flow/api/` | Chi HTTP service for auth, parsing, calendar, and other non-CRUD operations | `flow/AGENTS.md`, `styleguide/backend-styleguide.md` | Focused `go test`, then `go test ./...` and `go build ./...` |
| `flow/importer/uw/` | UW API ingestion: fetch, convert, stage, insert, and vacuum | `flow/AGENTS.md`, `styleguide/backend-styleguide.md` | Focused conversion tests; use mutation commands only with approval |
| `flow/email/` | Database queue consumer, templates, and SMTP boundary | `flow/AGENTS.md`, `styleguide/backend-styleguide.md` | Focused tests plus build |
| `flow/common/` | Infrastructure and utilities shared by multiple binaries | `flow/AGENTS.md` | Test every affected consumer |
| `hasura/` | Schema migrations, relationships, permissions, and GraphQL metadata | `hasura/AGENTS.md`, `styleguide/backend-styleguide.md` | Apply up/down locally and inspect metadata |
| `script/`, `nginx/`, `staging/` | Build, deployment, proxy, and Terraform operations | `styleguide/general-styleguide.md` | Inspect exact diff; never run destructive operations implicitly |

## Core decisions

- Ordinary data CRUD belongs in Hasura. Use the Go API for workflows, parsing, auth, calendar responses, or behavior Hasura cannot express cleanly.
- Keep the current package-oriented architecture. Do not introduce repository/service/controller layers unless a concrete boundary is shared or independently testable.
- Keep transport, transformation, and persistence separable. Handlers decode and validate, pure helpers transform, and database functions persist.
- Put feature behavior in its owning package. Move code to `flow/common` only after at least two binaries need it and the abstraction contains no service-specific policy.
- Preserve transaction ownership at the operation boundary. Leaf helpers accept `*db.Tx`; they do not begin or commit hidden transactions.
- Treat Hasura permissions and metadata as security-critical application code.
- Prefer the smallest complete change. Do not mix dependency, infrastructure, or architecture modernization into feature work.

## Shared primitives

This repository has no visual design system. Its equivalent reusable layer is semantic:

- request/transaction adapters and public error mapping in `flow/api/serde/`;
- context-aware database access in `flow/common/db/`;
- shared runtime configuration in `flow/common/env/` and `flow/common/state/`;
- repeatable migration and permission patterns in `hasura/`;
- reusable email layout in `flow/email/format/`.

Extend these when behavior is genuinely cross-cutting. Do not centralize endpoint-specific validation, importer policy, or presentation strings merely to remove a small amount of duplication.

## Verification

Run the narrowest useful check first, then the package or repository gate:

| Change | Required checks |
| --- | --- |
| Go formatting or behavior | `gofmt` changed files; focused `go test`; `go test ./...`; `go build ./...` |
| API contract | Above, plus search `../uwflow_frontend` for consumers |
| Migration or metadata | Apply the migration locally, inspect metadata/permissions, test rollback, then check frontend codegen impact |
| Import conversion | Table-driven tests with representative upstream fixtures |
| Docker/build files | `make docker-build-test` when Docker is available |
| Docs only | `git diff --check` and validate all referenced paths/commands |

`make test` and `make build-test` run the Go checks inside the active API container. Direct commands run from `flow/` when Go is installed. Do not claim the legacy `regtest/` suite as a gate without first confirming its imports still match the current package layout.

## Operational safety

- Never commit `.env`, database dumps, `.ssl`, private keys, Terraform state, or credential-bearing output.
- `make clean`, `make setup`, and `make setup-contrib` delete or replace local database/container state. Run them only when the user explicitly requests that outcome.
- Import and vacuum commands mutate substantial data. Confirm the target environment and scope first.
- Never run ad hoc tests against production. Staging replacement can destroy its database; review Terraform changes accordingly.
- Existing migrations are immutable history. Add a new timestamped migration instead of editing an applied one.

## Style guides

- `styleguide/general-styleguide.md` — universal writing, change-scope, and safety conventions.
- `styleguide/backend-styleguide.md` — Go, HTTP, database, Hasura, importer, and email patterns.
- `flow/AGENTS.md` — Go module map and local rules.
- `hasura/AGENTS.md` — schema and GraphQL contract checklist.

@README.md
