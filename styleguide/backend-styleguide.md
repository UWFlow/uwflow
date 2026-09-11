# Backend style guide

## Choose the owning layer

```text
Simple authorized CRUD or relationship query? -> Hasura
Custom HTTP/auth/parsing/calendar workflow?    -> flow/api/<feature>
UW source synchronization?                     -> flow/importer/uw
Queued email composition or delivery?          -> flow/email
Used by two or more Go binaries without policy? -> flow/common
```

Do not make the Go API a proxy for GraphQL CRUD. Do not put database mutation in parsing helpers or transport formatting in persistence helpers.

## Go and HTTP

- Pass `context.Context` from the request or job boundary into database and network work. Do not replace it with `context.Background()` below a boundary.
- Register API routes centrally in `flow/api/main.go`; keep handler logic in the feature package.
- Use `serde.WithDbResponse` or `serde.WithDbNoResponse` for transactional JSON operations. Use `serde.WithDbDirect` only when the handler must own a non-JSON response/body or its transaction lifecycle.
- Decode and validate input before mutation. Keep transformations pure where possible so edge cases can be table-tested.
- Preserve middleware order and the request timeout unless the change explicitly requires different semantics.
- Use parameterized SQL only. Close or fully consume query rows and check iteration errors.

## Transactions and concurrency

- Begin, commit, and roll back at the operation boundary. A helper receiving `*db.Tx` participates in its caller's transaction.
- Keep transactions short. Do not perform slow network or SMTP calls inside a transaction without understanding the retry and visibility behavior already expected by that workflow.
- Preserve ordering, idempotency, and retry behavior in importer and email paths. A process retry must not silently duplicate externally visible work.
- Shared state must be immutable after initialization or explicitly concurrency-safe.

## Hasura and Postgres

- Add schema changes under `hasura/migrations/default/<timestamp>_<name>/` with both `up.sql` and a meaningful `down.sql`.
- Never edit the initial or another already-applied migration to represent a new change.
- Update the matching per-table metadata plus the aggregate registration, relationships, and role permissions. A table exposed without deliberate permissions is incomplete.
- Preserve constraints, indexes, triggers, functions, and dependent views in both directions. Materialized-view changes require reviewing the full dependency chain.
- Use database constraints for durable invariants; application checks improve errors but do not replace concurrency-safe constraints.
- Treat metadata exports as declarative source. Avoid manual changes that the next Hasura export will erase.

## Importer

- Maintain the fetch -> convert -> stage/copy -> merge structure under `flow/importer/uw/parts/`.
- Network decoding and normalization should be testable without a database. Database functions consume normalized values.
- Preserve explicit rules that protect manual or authoritative rows during vacuum and merge operations.
- Prefer per-entity transaction boundaries so one failed import does not corrupt a batch. Report aggregate outcomes without hiding individual failures.
- Use fixtures for upstream response shapes and table-driven tests for conversion edge cases.

## Email

- Keep queue scanning, message data, HTML rendering, and SMTP delivery in their existing packages.
- Maintain retry/idempotency semantics when moving the point at which a queue item is marked processed.
- Escape untrusted content in HTML and keep product-visible URLs configurable where the existing environment model supports it.
- Test formatting independently from live SMTP delivery.

## Testing patterns

- Place focused `*_test.go` files with the owning package. Existing sibling `test` packages may remain; do not churn them solely for consistency.
- Prefer table-driven cases with `t.Run` for parsers, conversions, validation, and status mapping.
- Use `go-cmp` for structural output. Keep source documents in `testdata/` rather than embedding large fixtures in test code.
- Tests must be deterministic: inject time, clients, or randomness when touching behavior that otherwise depends on them.
- A bug fix should include a test that fails for the old behavior whenever the boundary is testable.

## Cross-repository contract checklist

When changing a public contract, search `../uwflow_frontend` and verify:

- GraphQL documents and generated types for schema changes;
- Apollo cache keys for identity or primary-key changes;
- API endpoint paths, methods, JSON shapes, and stable error values;
- JWT/auth behavior and Hasura role permissions;
- calendar parsing/display assumptions and product-visible email links.
