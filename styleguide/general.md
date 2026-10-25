# General style guide

## Scope

- Read this guide for shared rules, then the [backend](backend/go.md), [frontend](frontend/react.md), or [design system](frontend/design-system.md) guide for the area you change.
- Keep each rule in one guide. Link to its owner instead of copying it into another guide or `AGENTS.md`.
- Describe the tools and patterns Flow actually uses. Check paths and commands when changing guidance.

## Changes

- Read the owning code and its callers before editing.
- Search for an existing helper, type, constant, or component before adding one.
- Fix the cause at the narrowest responsible layer.
- Extract shared code when a second caller needs it or when it centralizes a correctness or accessibility constraint.
- Remove unused branches, options, exports, and comments introduced by the change.
- Keep unrelated refactors and dependency upgrades out of the diff.
- Preserve uncommitted work and generated-file ownership.

## Writing

- Use short sentences, ordinary words, and active voice.
- Put one rule in each bullet. Remove repetition and explanations that do not change a decision.
- Name code so its purpose is clear without a comment.
- Keep comments for hidden constraints, invariants, workarounds, and external API behavior.
- Remove comments that narrate steps, repeat a signature, or record conversation history.
- Apply these rules to styleguides, agent instructions, tests, and PR descriptions.

## Tests

- Search existing tests before adding a case. Extend the suite that owns the behavior.
- Exercise the real subject and stub its dependencies.
- Assert returned values, persisted changes, rendered output, or effects at an external boundary.
- Keep expected values independent of the calculation under test.
- Use inputs that distinguish the intended behavior from plausible mistakes.
- For a regression, verify that the test fails with the bug and passes with the fix.
- Control time, randomness, locale, and network responses when they affect the result.
- Avoid tests that only check imports, duplicate implementation logic, or inspect source text for style rules.

## Verification

| Change | Checks |
| --- | --- |
| Frontend logic | Focused test, then `make frontend-check` |
| Frontend build or runtime | `make frontend-check` and `make frontend-build` |
| Go behavior | `gofmt`, focused tests, `go test ./...`, and `go build ./...` from `flow/` |
| Docker configuration | `make docker-build-test` and build the changed targets |
| Build/deploy scripts | `make migration-test` and the relevant build or smoke test |
| Schema or permissions | Apply and roll back locally; check metadata and queries under affected roles |
| Docs only | `git diff --check`; validate referenced paths and commands |

Use `make frontend-build` for a build without Sentry upload. The frontend's
`bun run build` uploads sourcemaps and requires the intended environment.
Run `bun run lint-nofix` from `frontend/` before every commit, as required by
`frontend/AGENTS.md`. Report checks that could not run and their limitations.
