---
name: fetch-backend-data
description: Guide for understanding the UWFlow data layer — inspecting the Postgres schema via psql, understanding how Hasura exposes it as GraphQL, and wiring up Apollo Client queries in the frontend.
---

# Fetch Backend Data

This skill guides you through the full data-fetching stack: Postgres → Hasura (GraphQL) → Apollo Client (React).

## 1. Understand the Schema via psql

Credentials live in `uwflow/.env` (copy of `.env.sample`):

```
POSTGRES_DB=flow
POSTGRES_HOST=postgres   # or localhost if connecting outside Docker
POSTGRES_PASSWORD=secretinprod
POSTGRES_PORT=5432
POSTGRES_USER=postgres
```

Connect locally (backend must be running via `docker-compose`). Read the
database name from `uwflow/.env` rather than assuming it — it is `flow_new`,
not `flow`:

```bash
psql -h localhost -p 5432 -U postgres -d flow_new
# or, without a local psql client:
docker exec -i postgres psql -U postgres -d flow_new
```

Useful psql commands:

```sql
\dt              -- list all tables
\d course        -- describe a specific table (columns, types, constraints)
\d+ user_schedule -- verbose description including indexes and foreign keys
```

The canonical source of truth for the schema is the Hasura migrations:

- **Init migration**: `uwflow/hasura/migrations/default/1559740220527_init/up.sql` — defines all base tables
- **Subsequent migrations**: `uwflow/hasura/migrations/default/*/up.sql` — incremental alterations

Read these files to understand table structure before writing queries.

## 2. How Hasura Exposes the Schema as GraphQL

Hasura introspects the Postgres schema and **automatically generates a GraphQL API** — no resolver code needed. Every table becomes a queryable root field. Relationships between tables (foreign keys) become nested fields.

The Hasura console runs at `http://localhost:8080`. 

Key mapping rules:
- Table `course` → GraphQL root field `course`
- Filter with `where: { code: { _eq: $code } }`
- Order with `order_by: { field: asc }`
- Joins follow FK relationships: `course { course_sections { ... } }`

## 3. Adding a Query to the Frontend

### Step 1 — Write the query

Queries live in `src/graphql/queries/`. Create or edit a file there:

```tsx
import { gql } from '@apollo/client';

export const GET_MY_DATA = gql`
  query getMyData($id: Int!) {
    my_table(where: { id: { _eq: $id } }) {
      id
      name
      related_table {
        field
      }
    }
  }
`;
```

Reuse shared fragments from `src/graphql/fragments/` where possible.

### Step 2 — Use the query in a component

```tsx
import { useQuery } from '@apollo/client';
import { GET_MY_DATA } from 'graphql/queries/my_feature/MyFeature';

const MyComponent = ({ id }: { id: number }) => {
  const { data, loading, error } = useQuery(GET_MY_DATA, {
    variables: { id },
  });

  if (loading) return <Spinner />;
  if (error || !data) return null;

  return <div>{data.my_table[0].name}</div>;
};
```

### Step 3 — Regenerate TypeScript types

`src/generated/graphql.tsx` is a **generated artifact. Never hand-edit it.**
Adding a field to a fragment or writing a new query means regenerating:

```bash
bun run generate    # graphql-codegen --config codegen.js
```

Codegen introspects the **live local Hasura** (`codegen.js` points at
`http://localhost:8080/v1/graphql` with `x-hasura-admin-secret: secretinprod`),
so the backend must be running first. Postgres and Hasura are enough — the Go
services are not needed:

```bash
cd uwflow && docker compose up -d postgres hasura
```

Codegen emits typed operations for every document under `src/**`. Use them
instead of hand-writing operation types:

```tsx
import { GetMyDataQuery, GetMyDataQueryVariables } from 'generated/graphql';

const { data } = useQuery<GetMyDataQuery, GetMyDataQueryVariables>(GET_MY_DATA);
```

A locally declared `type MyDataQuery = { ... }` sitting next to a `gql`
document is a smell: it means codegen was never run for that query, and the
hand-written type will silently drift from the schema.

#### Check the diff before committing

Codegen reads whatever schema your local Hasura currently has, so **any
unmerged backend migration applied to your local database leaks into the
output**. Regenerating while the backend repo sits on a feature branch adds
types for tables that do not exist on `main`, inflating an unrelated frontend
PR by hundreds of lines.

Always `git diff src/generated/graphql.tsx` and confirm every hunk traces back
to a change you actually made. If it does not, point codegen at a schema that
matches what the PR targets before regenerating.

## 4. Authentication Context

Apollo is configured in `src/graphql/apollo.js`. It automatically attaches a JWT from `localStorage` as `Authorization: Bearer <token>`. Hasura uses `HASURA_GRAPHQL_JWT_KEY` to verify the token and applies row-level permissions based on the user role (`anonymous` vs authenticated).

Unauthenticated queries work as the `anonymous` role — only publicly visible data is returned. If a query returns empty results unexpectedly, check that the Hasura permissions for `anonymous` include the relevant table.

## 5. Quick Reference

| Layer           | Location                                              |
|-----------------|-------------------------------------------------------|
| Schema def      | `uwflow/hasura/migrations/default/*/up.sql`           |
| psql creds      | `uwflow/.env`                                         |
| Hasura UI       | `http://localhost:8080`                               |
| GQL queries     | `uwflow_frontend/src/graphql/queries/`                |
| Fragments       | `uwflow_frontend/src/graphql/fragments/`              |
| Apollo init     | `uwflow_frontend/src/graphql/apollo.js`               |
| Generated types | `uwflow_frontend/src/generated/graphql.tsx` (never hand-edit) |
| Codegen config  | `uwflow_frontend/codegen.js` (`bun run generate`)     |
