@README.md

## Authentication, impersonation, and review abuse

Treat `HASURA_GRAPHQL_JWT_KEY` as full account authority. UW Flow's API and
Hasura accept HS256 JWTs containing the `user` role and
`x-hasura-user-id`; anyone with the deployed signing key can mint a writable
token for any known user ID. A client-supplied `x-hasura-role` or
`x-hasura-user-id` header without a valid JWT does not establish identity.

- Never use the values in `.env.sample` in a deployed environment, expose a
  deployed signing key to a client, or commit a real signing key. Rotate the
  deployed key immediately if exposure is suspected.
- JWT-minting development scripts are local-only tools. Do not point them at a
  deployed environment or present their output as a safe support workflow.
- Do not implement support impersonation by issuing a normal `user` token. A
  support workflow must use a separate select-only Hasura role, a short token
  lifetime, an audit trail, no refresh or chaining, and explicit blocks on API
  routes that write to Postgres outside Hasura.
- Keep authorization server-side. Every user-owned Hasura mutation must bind
  ownership to `X-Hasura-User-Id`; prefer a column preset such as
  `set: { user_id: X-Hasura-User-Id }`, exclude `user_id` from client-settable
  columns, and retain an independent permission check. Frontend state and
  mutation variables are not an authorization boundary.

The review table currently has two useful database protections: the
`review_check_course_taken` trigger requires the course to be in
`user_course_taken`, and `course_uniquely_reviewed` allows only one review per
user and course. Do not weaken either protection. They do not, by themselves,
prevent review spam:

- Review ratings and comments are nullable, and the comment length checks
  accept an empty string. A direct GraphQL client can bypass the frontend's
  required-rating check; an empty string is non-NULL and can therefore be
  selected and counted as a comment.
- `hasura/metadata/api_limits.yaml` currently configures no Hasura API limits,
  and `nginx/config/site.conf` currently proxies `/graphql` without an
  application-specific request limit. Do not assume an external CDN or WAF
  rule exists merely because production is proxied through one; verify its
  deployed configuration separately.
- Email registration accepts user-supplied names and addresses without proving
  address ownership, so display-name impersonation and throwaway accounts are
  distinct from taking over an existing user ID but remain abuse vectors.
- The schedule import accepts user-supplied text and populates
  `user_course_taken` from matching class numbers. Course-taken checks alone
  are therefore not proof of a verified UW enrollment.

Changes touching reviews or account creation must enforce abuse controls at
the server/database layer. At minimum:

1. Reject semantically empty reviews in Postgres (trim comments before testing
   them) and keep professor-only fields consistent with `prof_id`.
2. Rate-limit GraphQL writes and the registration, password-reset, and import
   endpoints using both account and network-level signals where available.
3. Add account-verification or equivalent anti-automation friction before an
   account can post public reviews.
4. Monitor review/account creation velocity and retain a reversible moderation
   path rather than relying on UI validation.
5. Test that unsigned/spoofed identity headers cannot access the `user` role,
   one user cannot write as another, empty reviews are rejected, and the
   course-taken and per-course uniqueness constraints still hold.

Repository configuration cannot prove which JWT key, CDN rules, or rate limits
are active in production. Verify those controls against the deployed
environment without stress-testing or creating production data.
