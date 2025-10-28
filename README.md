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
Step 1 and 3 as above, except no need for postgres dump, then run:
```sh
make setup-contrib
```
It will create a postgres container for you, with desired schema and imports course data. It won't contain user data or review data as in prod.

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

