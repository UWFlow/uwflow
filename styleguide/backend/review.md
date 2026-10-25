# Backend review

Apply the [general review](../review.md) first. Use [Go and data](go.md) for the
implementation rules. Paths below start at the repository root.

## Requests and writes

- Trace each request or job to the package that owns its behavior.
- Validate inputs before mutation and enforce the same rules across callers.
- Preserve request context, cancellation, timeout, and stable public errors.
- Keep related writes atomic and dependent checks safe under concurrency.
- Confirm helpers participate in their caller's transaction.
- Check parameterized SQL, row cleanup, and iteration errors.

## Schema and authorization

- Leave applied migrations unchanged. Check both migration directions and dependent objects.
- Update metadata registration, relationships, and role permissions together.
- Verify queries under affected roles, including anonymous access, rather than only admin access.
- Check durable invariants against database constraints.
- Inspect deletes for foreign keys, cascades, and references outside the immediate table.
- Confirm metadata remains consistent after applying the change.

## Jobs and side effects

- Check importer ordering and protection of manual or authoritative rows.
- Check retry behavior when changing transaction or queue-completion boundaries.
- Ensure retries cannot duplicate externally visible work.
- Verify email escaping and URLs without sending test mail to real recipients.

## Consumer contracts

- Search `frontend/` for changed GraphQL fields, API routes, JSON fields, error values, and JWT behavior.
- Check generated types and Apollo identity when schema keys change.
- Verify calendar and upload behavior when parsers or serialization change.
- Run the relevant Go tests and build; validate native dependencies in Docker.
