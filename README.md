# Backend

This is a collection of services comprising the UWFlow backend.

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

- [`hasura-cli`](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/#install): Hasura web interface

Exact package names may vary across distributions;
for example, Ubuntu refers to `docker` as `docker.io`.
The above list is intended as an unambiguous guideline for humans
and is not necessarily consistent with any single distribution.

## First-time setup

To find out what is really expected, peruse `scripts/sanity-check.sh`
and apply common sense, as the following docs may be outdated.

1. Ensure the required packages are installed (see above).
2. Download and decrypt the database dump:
  - Download the file located in Google Drive at `Flow/Data/pg_backup.gpg`.
  - Run `gpg2 --decrypt pg_backup.gpg > pg_backup`.
    Use the password from the shared Bitwarden vault.
3. Copy `.env.sample` to `.env` and edit the latter as needed. In particular:
  - `POSTGRES_DUMP_PATH` should point to `pg_backup` obtained at the end of (2)
  - `UW_API_KEY_V3` should be set as instructed in the
    [uwapi-importer README](uwapi-importer/README.md)
  - `POSTGRES_HOST` should be set to `postgres` on \*NIX systems
    and `0.0.0.0` on Windows (which is incidentally otherwise unsupported)

## How to run this

If you have not run the backend before, refer to the preceding section first.
That being done, **simply run `script/start.sh`**.

As dependencies between containers exist that cannot be explicitly specified,
the system will take a while to reach a stable (all services up) state.
The script will wait as this happens, but it should not take more than a minute.
If it does, then something went wrong. Ping `#backend-dev`.

It is instructive to study the script, as it often does not need to be re-run
in its entirety. For example, when developing `api`, it is
not necessary clear database state, so the following command suffices:
```sh
docker-compose up -d --build
```

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

## Testing your changes 
There is a `docker-compose.dev.yml` file to build and start all backend services using local repo (`docker-compose.yml` uses public images). 

Run this command to apply your changes: 

```
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
