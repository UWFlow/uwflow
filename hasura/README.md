# Hasura backend

This serves as a Postgres -> GraphQL adapter.

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
