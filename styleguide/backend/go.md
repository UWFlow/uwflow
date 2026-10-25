# Backend style guide

Follow the [general guide](../general.md) for writing, tests, and verification.
Paths below are relative to the repository root.

## Ownership

| Work | Owner |
| --- | --- |
| Authorized CRUD and relationship queries | Hasura |
| HTTP, auth, parsing, and calendar workflows | `flow/api/<feature>/` |
| UW source synchronization | `flow/importer/uw/` |
| Queued email rendering and delivery | `flow/email/` |
| Policy-free infrastructure shared by binaries | `flow/common/` |

- Keep parsing and normalization independent of database writes.
- Keep transport formatting out of persistence helpers.
- Use Hasura directly for ordinary GraphQL CRUD.

## Go and HTTP

- Use short lower-case package names, PascalCase exported names, and lowerCamelCase locals. Preserve existing Go filename conventions.
- Pass the request or job's `context.Context` into database and network work.
- Register routes in `flow/api/main.go` and keep handlers in the feature package.
- Use `serde.WithDbResponse` or `serde.WithDbNoResponse` for transactional JSON operations.
- Use `serde.WithDbDirect` when the handler must own a non-JSON response or its transaction lifecycle.
- Decode and validate input before mutation.
- Wrap errors with operation context using `%w`.
- Return stable public errors through `api/serde`. Do not expose database or internal error text.
- Search callers before changing an error value, response field, or route.
- Reserve panic and process exit for unrecoverable startup failures.

## Transactions and concurrency

- Begin, commit, and roll back at the operation boundary. A helper receiving `*db.Tx` joins its caller's transaction.
- Keep a dependent check and write in the same transaction. Use constraints or locking when concurrent requests can invalidate the check.
- Use parameterized SQL. Close or fully consume rows and check iteration errors.
- Keep transactions short. Review retry and visibility behavior before adding network or SMTP calls inside one.
- Preserve idempotency and ordering in importer and email jobs.
- Keep shared state immutable after initialization or explicitly concurrency-safe.

## Hasura and Postgres

- Add migrations under `hasura/migrations/default/<timestamp>_<name>/` with `up.sql` and a meaningful `down.sql`.
- Leave applied migrations unchanged.
- Update table registration, relationships, and permissions with each schema change.
- Preserve constraints, indexes, triggers, functions, and dependent views in both migration directions.
- Review the full dependency chain when changing a materialized view.
- Enforce durable invariants with database constraints.
- Test affected roles, including anonymous access. An admin query does not verify permissions.
- Keep metadata declarative and compatible with the next Hasura export.

## Importer and email

- Preserve the importer's fetch, convert, stage/copy, and merge boundaries.
- Test decoding and normalization without a database; pass normalized values into persistence code.
- Preserve merge and vacuum rules that protect manual or authoritative rows.
- Use per-entity transactions where the importer already supports partial progress. Report failures without hiding individual outcomes.
- Keep email queue scanning, message data, HTML rendering, and SMTP delivery in their existing packages.
- Review retry behavior when changing when a queue item is marked processed.
- Escape untrusted HTML content and test formatting without live SMTP delivery.

## Tests

- Place `*_test.go` beside its subject. Preserve existing sibling test packages during unrelated work.
- Use table-driven cases for parsing, conversion, validation, and error mapping.
- Use `go-cmp` for structural results and `testdata/` for large source documents.
