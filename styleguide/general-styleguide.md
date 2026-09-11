# General style guide

## Change discipline

- Read the owning package and its callers before editing. Follow established local shapes unless there is evidence they are causing the problem.
- Prefer deletion, reuse, or extension before adding another helper or abstraction.
- Keep refactors separate from behavior changes when practical. A review should be able to identify the intended behavior from the diff.
- Do not upgrade unrelated dependencies, rewrite configuration, or reorganize directories opportunistically.
- Preserve uncommitted user work and generated-file ownership.

## Naming and comments

- Use idiomatic Go names: short lower-case package names, PascalCase exported identifiers, and concise lowerCamelCase local names. Follow the existing lower-case or underscore-separated filename convention; TypeScript filename rules from the Rec monorepo do not apply here.
- Name code so that it does not need narration. Comments explain a hidden constraint, invariant, external protocol, or surprising decision.
- Keep comments plain and concise. Do not describe what the next line already says or record temporary implementation history.
- Preserve useful protocol and data-preservation explanations, especially around calendar formats, SQL, auth, and concurrency.

## Errors, logs, and secrets

- Wrap errors with operation context using `%w` so callers retain the cause.
- Return stable public status/enum information through `api/serde`; never expose raw database or internal error text.
- Log enough context to identify the operation, never access tokens, credentials, private user payloads, or full auth requests.
- Reserve `panic`, `log.Fatal`, and process exit for unrecoverable startup or top-level binary failures.

## Definition of done

- The change lives at the narrowest correct architectural boundary.
- New behavior has a focused test or an explicit explanation of why automated coverage is impractical.
- Changed Go is formatted and the affected package builds.
- Public contracts and downstream consumers were checked.
- Risky commands, generated files, and secrets were handled deliberately.
