# UWFlow

UWFlow is one Git repository containing the frontend, Go services, Hasura schema,
and deployment configuration. A single branch or PR can update the entire stack.

| Directory | Contents |
| --- | --- |
| `frontend/` | React application, Bun lockfile, frontend Dockerfile, Vercel configuration |
| `flow/` | Go API, email worker, and UW importer |
| `hasura/` | Database migrations and GraphQL metadata |
| `nginx/` | Production frontend and API reverse proxy |
| `script/`, `staging/` | Build/deploy scripts and staging infrastructure |

Run `make help` to list every `make` target.

---

## Frontend

### Frontend setup

Do this once per clone.

1. Install the Bun version in `frontend/.bun-version`.
2. From the repository root, install dependencies and the Git hooks:

   ```sh
   make frontend-install
   make hooks
   ```

Rerun `make frontend-install` whenever `frontend/bun.lock` changes.

### Running the frontend

```sh
make frontend-start
```

The development server runs at `http://localhost:3000`.

### Frontend development commands

Use these while you work. None of them are required for onboarding.

| Command | What it does |
| --- | --- |
| `make frontend-check` | Lint, TypeScript, and unit tests (run before opening a PR) |
| `make frontend-lint` | Lint only, without changing files |
| `make frontend-typecheck` | TypeScript only |
| `make frontend-test` | Unit tests only |
| `make frontend-build` | Production build, without uploading Sentry source maps |
| `make frontend-generate` | Regenerate GraphQL types (needs the local backend running with a matching Hasura schema) |

### More frontend docs

See the [frontend README](frontend/README.md) for Vercel previews, and
[frontend/docs](frontend/docs) for GraphQL codegen, modals, pages, search, and analytics.

---

## Backend

### Architecture

The backend has five components. Each runs as a separate Docker container,
managed by `docker-compose`.

1. **Postgres** stores all of the data for UWFlow.
2. **Hasura** is a GraphQL engine on top of Postgres. The frontend uses it for
   ordinary CRUD operations. Hasura also enforces permissions, defines relationships
   between tables, and manages database migrations. See the
   [Hasura README](hasura/README.md) for details and for creating migrations.
3. **API** (`flow/api`) is a Go server for operations that Hasura cannot handle alone:
   authentication, transcript and calendar parsing, webcal generation, and search
   data for frontend autocomplete.
4. **UW Importer** (`flow/importer/uw`) is a scheduled job that imports courses,
   instructors, and term schedules from the UW API.
5. **Email** (`flow/email`) watches a queue table in Postgres and sends HTML emails
   over Google SMTP.

In production, an Nginx reverse proxy routes `/graphql` to Hasura, `/api` to the
API, and `/` to the frontend.

### Requirements

- `docker`
- `docker-compose`
- Optional: [`hasura-cli`](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/#install),
  for the Hasura console and `make migrate`.

Package names vary across distributions. For example, Ubuntu calls `docker`
`docker.io`. The backend is developed on Linux. macOS should work. Windows is
not supported.

### Backend setup

Do this once, and again whenever you want to reset your local database.

> **Warning:** both setup commands below delete your local Postgres volume and
> replace it.

1. Install the [requirements](#requirements).
2. Copy `.env.sample` to `.env` in the repository root. The sample values work for
   local development, except:
   - `UW_API_KEY_V3`: required to import course data. See
     [how to obtain a key](flow/importer/uw/README.md).
   - `POSTGRES_DUMP_PATH`: only needed if you set up from a dump (option B below).
   - `POSTGRES_HOST`: keep `postgres` on Linux and macOS.
3. Create the database using one of the options below.

#### Option A: Build from the UW API (contributors)

```sh
make setup-contrib
```

This creates a fresh Postgres database, applies the Hasura migrations, imports
course data from the UW API, and adds dummy professors. It takes several minutes.
The database has no users or reviews.

#### Option B: Restore from a dump

```sh
make setup
```

This restores the dump at `POSTGRES_DUMP_PATH`.

- Maintainers can use a dump of production, for example copied from the production
  server with `scp`, to test against the latest data.
- Contributors can use the [public dump](https://drive.google.com/file/d/1gwz2RcJ2D77f-i3XLEmftJnqt-Ng8EwX/view)
  instead of option A, for example when the UW API has closed registration and the
  import fails. It contains course data and fake professors, but no users or reviews.

### Running the backend

Pick one:

```sh
make start-public   # frontend work: run the published images from Docker Hub
make start          # backend work: build and run your local Go code
```

`make start` runs `api` and `email` with live reloading through Air. Hasura picks
up migration and metadata changes from `hasura/` automatically.

The importer does not reload, because it is a scheduled job. After changing it,
rebuild it and run a job:

```sh
make import-course  # import courses, instructors, and schedules
make import-vacuum  # run the term and course vacuum jobs
```

Stop everything with `make stop`.

### Backend development commands

| Command | What it does |
| --- | --- |
| `make test` | Run Go tests in the running `api` container |
| `make build-test` | Check that the Go code compiles, in the running `api` container |
| `make docker-build-test` | Dry run of the Docker Compose build |
| `make migrate` | Apply Hasura migrations and metadata (needs `hasura-cli`) |
| `make migrate-status` | Show Hasura migration status |
| `make import-profs` | Add dummy professors (already done by `make setup-contrib`) |
| `make course-renames` | Apply the course renames in `hasura/course_renames.sql` |
| `make prof-aliases` | Apply the prof aliases and merges in `hasura/prof_aliases.sql` |
| `make ps` | Show the status of all services |
| `make logs` | Tail logs from all services. Use `logs-api`, `logs-hasura`, `logs-uw`, or `logs-email` for one service |

You can also run Go commands directly from `flow/`.

### Connecting to services

While the backend runs, services listen on the ports in `.env`:

| Service | Default address |
| --- | --- |
| API | `http://localhost:8081` |
| Hasura GraphQL | `http://localhost:8080/v1/graphql` |
| Postgres | `localhost:5432` |

---

## Builds and deployment (maintainers)

Contributors do not need this section. CircleCI validates every PR and publishes
images when changes merge to `main`.

- `./script/build.sh` builds all four application images. Pass service names to
  build a subset, for example `./script/build.sh frontend`. Images use the
  `neuwflow/*` names and get both a commit-SHA tag and `latest`.
- `make frontend-container-test` smoke-tests a built frontend image with Nginx and
  disposable mock upstreams. It needs Docker and OpenSSL.
- `make migration-test` tests the build and deploy scripts without Docker.
- On the production checkout, `./script/deploy.sh` deploys all services, and
  `./script/deploy.sh frontend` deploys only the frontend. Set `UWFLOW_IMAGE_TAG`
  in `.env` to pin images to a published commit; otherwise Compose uses `latest`.
  Pulling images does not update the checkout's Nginx, Compose, or Hasura files.
- Vercel uses `frontend` as its project Root Directory, connected to `UWFlow/uwflow`.

See the [migration and cutover runbook](docs/monorepo-migration.md) for the CI and
Vercel handoff and for rollback.
