# UWFlow

UWFlow is one Git repository containing the frontend, Go services, Hasura schema,
and deployment configuration. A single branch or PR can update the entire stack.

| Directory | Contents |
| --- | --- |
| `frontend/` | React application, Bun lockfile, frontend Dockerfile, Vercel configuration |
| `flow/` | Go API, email worker, and UW importer |
| `hasura/` | Database migrations and GraphQL metadata |
| `nginx/` | Production frontend and API reverse proxy |
| `script/`, `staging/` | Build/deploy commands and staging infrastructure |

## Frontend development

Install Bun `1.3.14` and Node `22.20.0` (see `frontend/.nvmrc`), then run from the
repository root:

```sh
make frontend-install
make hooks
make frontend-start
```

The frontend runs at `http://localhost:3000`. Frontend-only commands do not need
or load the backend `.env`. Put browser configuration overrides in
`frontend/.env.local`, following `frontend/.env.sample`. Follow the backend setup
below for local API/GraphQL services.

```sh
make frontend-check     # lint, TypeScript, and unit tests
make frontend-build     # production build without Sentry upload
make frontend-generate  # requires a matching local Hasura schema
make migration-test     # build/deployment command tests; no Docker required
```

The root Git hook runs non-mutating frontend lint when frontend files are staged.
`make hooks` replaces this clone's `core.hooksPath`; it applies to linked worktrees
sharing that Git configuration. Existing standalone frontend clones should be
replaced by a fresh monorepo clone. See [frontend documentation](frontend/README.md).

## Builds and deployment

`./script/build.sh` builds all four application images; pass service names to build
a subset, for example `./script/build.sh frontend`. After building, run
`make frontend-container-test` for an isolated Nginx/routing smoke test (requires
Docker and OpenSSL; uses temporary containers and mock upstreams). Images retain the
`neuwflow/*` names and receive both a commit-SHA tag and `latest`. The unified
CircleCI pipeline validates both components on every PR and publishes on `main`.

From the production checkout, use `./script/deploy.sh frontend` for a frontend-only
release, or `./script/deploy.sh` for all services. Persist `UWFLOW_IMAGE_TAG` in the
backend `.env` to pin application images to a published commit. Without a pin,
Compose continues using `latest`. Pulling images does not update this checkout's
Nginx, Compose, or Hasura files.

Vercel uses `frontend` as its project Root Directory. Its Git connection must point
to `UWFlow/uwflow`. See the [migration and cutover runbook](docs/monorepo-migration.md)
for the history-preserving merge requirement, CI/Vercel handoff, and rollback.

## Backend setup

## Architecture

The UWFlow backend is composed of 5 components that will be explained in detail below.
Each of these components runs as a separate Docker container, orchestrated by `docker-compose`.

1. **Postgres**: Our Postgres database stores all of the data for UWFlow.

2. **Hasura**: Hasura is a GraphQL engine that sits on top of our Postgres database.
  It provides a GraphQL API for our frontend to interact with and is generally used for CRUD operations.
  We also use Hasura to enforce permissions and relationships between tables and manage DB migrations.
  For more details on using Hasura and creating new DB migrations, see the [./hasura/README.md](Hasura README).

3. **API**: Our API is a Go server that provides custom endpoints for our frontend to interact with.
  It is generally used for more complex operations that cannot be done with Hasura alone.
  This includes authentication, parsing for transcripts and calendars, webcal generation,
  and dumping raw search data for the frontend to use for autocomplete.

4. **UW Importer**: This is a cron job that runs on a schedule to import data from the UW API.
  We use this to fetch updates for courses, instructors, and term schedules.

5. **Email**: This is a service that watches a "queue" in our Postgres database for emails to send.
  It sends emails by generating HTML documents and sending them using the Google SMTP service.

In production, we run an Nginx reverse proxy in front of Hasura, the API, and the frontend
to route requests to the correct service. Hasura is exposed via `/graphql`, the API via `/api`,
and the frontend via `/`.

## Requirements

The following packages are required for core functionality:

- `docker`
- `docker-compose`

The following packages are required by optional components:

- [`hasura-cli`](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/#install): Hasura web interface. 

Exact package names may vary across distributions;
for example, Ubuntu refers to `docker` as `docker.io`.
The above list is intended as an unambiguous guideline for humans
and is not necessarily consistent with any single distribution.

## First-time setup 

### Maintainers

1. Ensure the required packages are installed (see above).
2. Obtain a postgres dump: We have a pipeline to setup with a postgres dump file, this is great for testing your code with the latest data from prod. You will need to obtain it, for example, scp it from prod. 
3. Copy `.env.sample` to `.env` and edit the latter (apply common sense) as needed. In particular:
  - `POSTGRES_DUMP_PATH` should point to `pg_backup` obtained at the end of (2)
  - `UW_API_KEY_V3` should be set as instructed in the
    [uwapi-importer README](uwapi-importer/README.md)
  - `POSTGRES_HOST` should be set to `postgres` on \*NIX systems
    and `0.0.0.0` on Windows (which is incidentally otherwise unsupported)
4. Run `make setup`, this will get your postgres volume ready. Whenever you want to update your local DB, setup your postgres dump file and rerun `make setup`

### Contributors 

1. Follow Step 1 and 3 as in the `Maintainers` section, except no need for postgres dump.

---
**NOTE:** We noticed that UW API sometimes closes registration, if this happens to you, please download our [public pg dump](https://drive.google.com/file/d/1gwz2RcJ2D77f-i3XLEmftJnqt-Ng8EwX/view) (This contains some course data and fake professors data, and no reviews and user data on production). Then, you can ignore this section and follow the ``Maintainers`` setup as above, since you are going with the option of a dump file. 

If this is not happening to you, please ignore the above note, and proceed to below:

---
2. Run this:

```sh
make setup-contrib
```
It will create a postgres container for you, with desired schema and imports course data (it will take some time). It won't contain user data or review data as in prod.

For professor data, as UW API is no longer providing this, the setup involves adding some dummy professors for your development purpose. If you want the prof data as in prod, you can manually call our prod's `graphql` endpoint to retrieve them.

## Development

Make sure you have finished the above section first. 

You can now start backend services locally, if you are working on the frontend, and just need the backend running but not making changes, you can choose to run it with images from Docker Hub: 

```sh
make start-public
``` 

If you are working with backend, run:

```sh
make start
``` 

Note `api` and `email` supports live reloading, supported by `Air`. `importer` does not support this, since it is a cron job. If you are working on it, after making your changes, run (depending on what you are working on): 

```sh
make import-course
``` 

or 

```sh
make import-vacuum
```
This will rebuild your importer using your local code, and then run the import jobs

Hasura supports live reloading as well, due to its configuration.

## Interacting with the backend

When `docker-compose` is active, services may be accessed
at their published ports, as declared in `docker-compose.yml`.

To illustrate, the `postgres` service publishes port `5432`, so
```sh
psql -h localhost -p 5432 -U flow
```
will spawn a Postgres shell connected to the database container.
If you do not happen to have `postgres-client` installed, this also works:
```sh
$ docker exec -it postgres sh
(docker) # psql -U postgres flow 
```

There are other `make` commands available, use `make help` to explore them, or simply visit `Makefile`
