# Go services

## Purpose

One Go module builds the API, UW importer, email worker, and Slack data bot. `common/` provides infrastructure shared by those binaries.

## Directory map

| Directory | Responsibility |
| --- | --- |
| `api/` | Chi routes, auth, parsing, calendar/data endpoints, middleware, and response adapters |
| `importer/uw/` | UW API client, schedule, conversion, staging, merge, and vacuum jobs |
| `email/` | Queue processing, rendering, and SMTP delivery |
| `slackbot/` | Slack Socket Mode bot that answers data questions with Claude and read-only SQL; see its README |
| `common/db/` | Context-aware pgx pool and transaction wrappers |
| `common/env/` | Environment loading shared across binaries |
| `common/state/` | Process-level immutable/concurrency-safe dependencies |
| `common/util/` | Small utilities with broad reuse |

## For AI agents

- Read `../styleguide/backend/go.md` before changing Go behavior.
- Keep feature policy out of `common/`; shared code must serve more than one binary and remain policy-neutral.
- Adding a field to the shared environment affects every consumer. Update `.env.sample` and compose configuration together.
- `api/parse/pdf/pdftotext.cc` is a native CGO bridge with Poppler build/runtime requirements. Verify changes in Docker.
- Run commands from this directory: `gofmt` changed files, focused `go test`, then `go test ./...` and `go build ./...`.

Review changes with [backend review](../styleguide/backend/review.md).
