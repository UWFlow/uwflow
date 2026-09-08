@README.md

## Using the Makefile

All backend workflows are driven by `make` targets in `uwflow/Makefile`. Run every
command from the `uwflow/` directory.

The Makefile does `include .env`, so **a `.env` file must exist before any target
will run** (copy `.env.sample` to `.env` first). Targets wrap
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml` for local
development, or `docker-compose -f docker-compose.yml` alone for the public-image
path.

`make help` prints the same list, generated from the `##` comments on each target.

### First-time setup

| Target | What it does |
| --- | --- |
| `make setup` | Maintainer setup — runs `script/start.sh` to seed Postgres from the dump at `POSTGRES_DUMP_PATH`. Rerun it to refresh the local DB from a newer dump. |
| `make setup-contrib` | Contributor setup — runs `script/setup-contrib.sh` to build the schema from migrations and pull course data from the UW API. Slow; no user or review data. |
| `make import-profs` | Loads dummy professor data (the UW API no longer serves profs). |

### Running services

| Target | What it does |
| --- | --- |
| `make start` | Starts `api`, `postgres`, `hasura`, `uw`, `email` with the dev override. Use this when changing backend code — `api` and `email` live-reload via Air, and Hasura reloads its metadata. |
| `make start-public` | Pulls and starts everything from published Docker Hub images. Use this when you only need a working backend (e.g. frontend work). |
| `make stop` | `docker-compose down` — stops services, keeps volumes. |
| `make ps` | Shows service status. |
| `make clean` | `docker-compose down --remove-orphans --volumes` — **destroys the Postgres volume**, so the DB has to be set up again. |

### Logs

`make logs` tails every service; `make logs-api`, `make logs-hasura`, `make logs-uw`,
and `make logs-email` tail one container each.

### Importer jobs

The importer is a cron job and does not live-reload. After editing importer code, run
the target for the job you're testing — each rebuilds the `uw` service before running:

- `make import-course` → `docker exec uw /app/uw hourly`
- `make import-vacuum` → `docker exec uw /app/uw vacuum`

### Hasura migrations

- `make migrate` — applies migrations and then metadata against the `default` database.
- `make migrate-status` — shows which migrations are applied.

Both require the `hasura` CLI on `PATH` and read `HASURA_GRAPHQL_ADMIN_SECRET` from
`.env`. See [hasura/README.md](hasura/README.md) for authoring new migrations.

### Tests and build checks

These run inside the already-running `api` container, so `make start` must have been
run first:

- `make test` — `go test ./...`
- `make build-test` — `go build ./...`
- `make docker-build-test` — `docker-compose build --dry-run`
