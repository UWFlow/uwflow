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
