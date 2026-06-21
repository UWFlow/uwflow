# Professor teaching ingestion

`POST /admin/prof-teaches/ingest` ingests one or more term buckets from
`prof_teaches.json`. Through Nginx, the route is available under
`/api/admin/prof-teaches/ingest`.

Send the existing Hasura admin secret in `X-Hasura-Admin-Secret`:

```sh
curl --fail-with-body \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  --data-binary @prof_teaches.json \
  http://localhost:8081/admin/prof-teaches/ingest
```

The endpoint validates the complete request and all referenced term/course IDs
before writing. `course_id` must identify the supplied `course_code`. Duplicate
rows in one file are collapsed by `(term_code, course_id, instructor)`, keeping
the latest `scraped_at` value.

A successful response reports both source and write counts:

```json
{
  "terms_processed": 3,
  "records_received": 6172,
  "unique_records": 6172,
  "professors_created": 0,
  "records_written": 6172
}
```

Re-sending unchanged data returns `records_written: 0`. Validation failures use
HTTP 400 and include each invalid JSON path. Missing or incorrect credentials
return HTTP 401.
