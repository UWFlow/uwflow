# API server

This is the Flow API server for handling non-CRUD tasks.

## Features

- Authentication:
  - [x] email
  - [x] openID
- Parsing:
  - [x] schedule
  - [x] transcript
- Admin imports:
  - [x] Quest professor-course associations
- [x] Webcal generation

## How to run this

As per `Dockerfile`, this is containerized and managed by `docker-compose`.
If you wish to run this on the host, do so at your peril.

## Admin imports

`POST /admin/course-professors/upload` ingests the `prof_teaches.json` shape
emitted by the Quest scraper:

```sh
curl \
  -H "X-Hasura-Admin-Secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -F "file=@../prof_teaches.json" \
  "http://localhost:8081/admin/course-professors/upload"
```

The endpoint also accepts a raw JSON request body. It normalizes and deduplicates
rows, validates courses, fuzzy-matches instructor names against `prof.name`, and
upserts accepted links into `scraped_prof_teaches_course`. Ambiguous matches are
returned in the response for manual review rather than inserted.
