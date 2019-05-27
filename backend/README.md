# Backend

This is a collection of services comprising the UWFlow backend.

## Architecture

The architecture is explained in a standalone RFC.

## Requirements

The following packages are required for anything at all to work:

- `docker`
- `docker-compose`

The following packages are required by optional components:

- `libpq-dev` (required for Python services interacting with Postgres)
- [`hasura-cli`](https://docs.hasura.io/1.0/graphql/manual/hasura-cli/install-hasura-cli.html#install) (autogenerating Hasura migrations)

The following packages are neat to have:

- `postgres-client` (interface with Postgres directly)

Exact package names may vary across distributions;
for example, Ubuntu refers to `docker` as `docker.io`.
The above list is intended as an unambiguous guideline for humans
and is not necessarily consistent with any single distribution.

## How to run this

1. Ensure the required packages are installed (see above).
2. Copy `.env.sample` to `.env` and optionally edit the latter as needed.
3. Run `docker-compose up -d` to bring the backend up.

It may be necessary to wait for up to a minute on the first run:
dependencies between containers exist that cannot be explicitly specified,
so the system will take a while to reach a stable (all services up) state.

To shut the backend down, run `docker-compose down`.
Services may also be started separately with `docker-compose run`; see docs.

## Interacting with the backend

When `docker-compose` is active, services may be accessed
at their published ports, as declared in `docker-compose.yml`.

To illustrate, the `postgres` service publishes port `5432`, so
```sh
psql -h localhost -p 5432 -u flow
```
will spawn a Postgres shell connected to the database container.

## Cookbook

Various recipes for getting commonly desired things done follow.

### Just give me a Hasura instance with some fake data

Frontend will mostly be interested in doing just this.
```sh
sudo apt install docker.io docker-compose  # Amend as appropriate
cd uwflow2.0/backend
cp .env.sample .env
docker-compose up -d
# Wait ~1min for containers to stabilize
cd db-random-populate
pipenv install && pipenv run python main.py
```
Voilà, now you have an endpoint to query at `http://localhost:8080/v1/graphql`.
Remember that Hasura requires auth; see the relevant [README](hasura/README.md).

### Completely reset database state

Normally, it should be sufficient to `TRUNCATE` tables by hand
as necessary via the `psql` interface shown above; this is the fastest way.

However, if something has gone horribly wrong, backend state
can be reset completely, discarding all database data. Run
```sh
docker-compose down
docker volume rm backend_postgres
docker-compose up -d
```

### Open Hasura console

The graphical interface for Hasura does not generate mutations by default.
For this reason, it is disabled
(though it may, in fact, be a good idea to hand-write mutations instead).
To bring up a graphical interface _with_ mutation support:
```sh
cd uwflow2.0/backend/hasura
export $(cat ../.env | xargs)
hasura console
```
This should ideally happen automatically;
however, it is not easy to set this up from within the container.
It is a known wrinkle in the way Docker and Hasura interoperate.
