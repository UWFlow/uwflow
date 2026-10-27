# Hasura schema and GraphQL contract

## Purpose

This directory is the canonical relational schema and GraphQL authorization contract. Migrations define Postgres state; metadata defines GraphQL exposure, relationships, actions, and role permissions.

## Key paths

| Path | Responsibility |
| --- | --- |
| `migrations/default/` | Immutable timestamped forward and rollback SQL |
| `metadata/databases/default/tables/` | Per-table relationships, permissions, and event configuration |
| `metadata/databases/default/tables/tables.yaml` | Registration of per-table metadata files |
| `metadata/actions.*` | Custom GraphQL action schema and handlers |
| `config.yaml` | Hasura CLI project configuration |

## For AI agents

- Read `README.md` and `../styleguide/backend/go.md` before making a schema change.
- Create a new timestamped migration with `up.sql` and `down.sql`; never rewrite applied history.
- Update registration, relationships, and every relevant role's select/insert/update/delete permissions.
- Review constraints and indexes as part of the same change. Application validation does not replace database invariants.
- Apply forward migration and metadata locally, exercise the affected query/mutation under realistic roles, then test rollback.
- Search `../frontend/src/graphql` for consumers and regenerate frontend types when the schema contract changes.
- Do not put secrets in metadata or migration files.
- The Slack data bot reads Postgres as `uwflow_slackbot` (see `1792955077386_slackbot_read_access`). A new table it should read needs `GRANT SELECT ... TO uwflow_slackbot` in its own migration; one holding personal data should not be granted.

Review changes with [backend review](../styleguide/backend/review.md).
