# Hasura backend

This serves as a Postgres -> GraphQL adapter.
We use GraphQL to perform all CRUD operations for UWFlow.

## Interface

Hasura listens on `HASURA_PORT` as specified in `.env`.
It exposes a single endpoint expecting _only POSTs with JSON bodies_:
`http://HOST:HASURA_PORT/v1/graphql`.

A sample JSON body posted to this endpoint might look like the following:
```json
{
  "query": "{course(where: {code: {_eq: \"cs135\"}}) { code name course_reviews(where: {text: {_is_null: false}}) { user { name } text } }}"
}
```
This corresponds to the GraphQL query
```graphql
{
  course(where: {code: {_eq: "cs135"}}) {
    code
    name
    course_reviews(where: {text: {_is_null: false}}) {
      user {
        name
      }
      text
    }
  }
}
```
Responses will either be of the form
```json
{
  "data" : {
    "course": {
      "code": //...
    }
  }
}
```
or of the form
```json
{
  "error": //...
}
```

## Authentication

For development, an admin role is available.
Send an `x-hasura-admin-secret` header set to the secret from `.env`.

For example, with curl:
```sh
$ curl -H 'x-hasura-admin-secret:secretinprod' http://localhost:8080/v1/graphql -d @payload
```
will submit the contents of the file `payload` and get the response.

## Roles

Three roles exist, and every table's metadata declares its permissions explicitly:

| Role | Who gets it | Permissions |
|---|---|---|
| `anonymous` | logged-out visitors (`HASURA_GRAPHQL_UNAUTHORIZED_ROLE`) | select, on public course/prof data |
| `user` | any signed-in user | select/insert/update/delete, scoped to `X-Hasura-User-Id` |
| `impersonated_user` | an admin viewing another account through the admin console | **select only**, scoped to `X-Hasura-User-Id` |

`impersonated_user` is what makes admin impersonation read-only. Its select
permissions are a verbatim copy of `user`'s on every table, and it has **no**
insert/update/delete permission anywhere — Hasura consequently exposes no
mutation root to it at all, so a write is rejected as "no mutations exist"
rather than table by table.

> **When you change a `user` select permission, mirror it to
> `impersonated_user` in the same file.** They are separate blocks in the same
> `select_permissions` list, so nothing enforces this automatically: a column
> added to `user` alone silently becomes invisible to an admin looking at the
> account, and a *filter* relaxed on `user` alone leaves the two roles seeing
> different rows. Never mirror insert/update/delete — that is exactly the
> boundary the role exists to draw.

Because these are two distinct roles rather than one inheriting from the other,
be aware that Hasura's `inherited_roles` would *not* work here: in v2 an
inherited role inherits mutation permissions along with select ones, so a role
inheriting from `user` would be fully writable.

## Creating New Database Migrations

The following steps are based on the [Hasura migration documentation](https://hasura.io/docs/latest/graphql/core/migrations/migrations-setup.html). We also assume the Hasura CLI is installed.

1. Navigate to the `hasura` folder and create a migration:
```sh 
$ hasura migrate create "migration_name_here"
```

2. Update the generated `up.sql` and `down.sql` to perform the migration.

  In general, migrations of normal tables are fairly straightforward. However, materialized views cannot be modified, so you will need drop the entire materialized view, as well as any associated functions and views, before recreating everything. However, it shouldn't be necessary to drop or recreate any indexes associated with the materialized view. The `course_search_prereqs` migration contains an example of how to do this.

3. Update `metadata/tables.yaml` with any required metadata changes to the GraphQL API.

4. Apply the migration (using the correct admin secret defined your `.env`):
```sh 
$ hasura migrate apply --admin-secret "HASURA_GRAPHQL_ADMIN_SECRET"
```

5. Reload the Hasura metadata:
```sh 
$ hasura metadata reload --admin-secret "HASURA_GRAPHQL_ADMIN_SECRET"
```

6. (Optional) To test if the migration rollback works, use the `--down 1` flag:
```sh 
$ hasura migrate apply --down 1 --admin-secret "HASURA_GRAPHQL_ADMIN_SECRET"
```
