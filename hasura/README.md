# Hasura backend

This serves as a Postgres -> GraphQL adapter.
We use GraphQL to perform all CRUD operations for UWFlow.

## Interface

Hasura's host port is bound to `127.0.0.1` on `HASURA_PORT` from `.env`.
Its GraphQL endpoint accepts POSTs with JSON bodies:
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

## Production CLI and Console access

Production administration uses an SSH tunnel to the host's loopback-bound Hasura
port. The public `/graphql` route still uses Docker networking. The engine's
built-in Console stays disabled; run the CLI Console on your own machine.
SSH access and the production Hasura admin secret are both required. The admin
secret grants full access, including through the public GraphQL endpoint; keep it
in your password manager and never commit it or include it in command arguments.

### Deployment prerequisite

Deploy the updated `docker-compose.yml` and recreate Hasura using the normal
deployment process. Ensure `HASURA_GRAPHQL_ADMIN_SECRET` is non-empty (Compose now
rejects missing/empty values). `docker compose port hasura 8080` on the server
should report `127.0.0.1:8080`, assuming the standard `HASURA_PORT=8080`.
Keep the Hasura port blocked by the host/cloud firewall as well. Existing direct
connections from other machines must switch to the tunnel; local development and
Nginx's container-to-container connection still work.

### Connect

Install the Hasura v2 CLI and use a checkout matching the deployed migrations and
metadata. Configure an SSH host alias with your production host, user, and key.
Verify the server's SSH host-key fingerprint through a trusted channel and add it
to `known_hosts` before using the helper; it refuses unknown or changed host keys.

In one terminal, from the backend repository root, run:

```sh
bash script/hasura-prod-tunnel.sh YOUR_PROD_SSH_ALIAS
```

Leave it running. It binds only local `127.0.0.1:18080`, forwards to the server's
`127.0.0.1:8080`, and exits if the local port cannot be bound. Optional second and
third arguments override the local and remote ports. It uses a dedicated SSH
connection so Ctrl-C closes this tunnel without affecting other SSH sessions.

In a second terminal, start Bash and run the following from the repository root.
The subshell drops the exported secret on exit; the hidden prompt keeps it out of
shell history and command-line arguments. Do not enable shell tracing (`set -x`).

```bash
bash
(
  read -r -s -p 'Production Hasura admin secret: ' HASURA_GRAPHQL_ADMIN_SECRET || exit 1
  printf '\n'
  [[ -n $HASURA_GRAPHQL_ADMIN_SECRET ]] || exit 1
  export HASURA_GRAPHQL_ADMIN_SECRET
  export HASURA_GRAPHQL_ENDPOINT=http://127.0.0.1:18080
  hasura --project hasura migrate status --database-name default &&
    hasura --project hasura console --address 127.0.0.1 \
      --api-host http://127.0.0.1 --no-browser
)
```

Open `http://127.0.0.1:9695` yourself after the CLI starts. The Console and its
migration API bind only to loopback. Console edits affect production immediately
and can write migration/metadata files into this checkout; review and commit
those changes. For CLI-only work, replace the `console` command above with the
desired command, retaining the production endpoint and secret environment
variables. Change the endpoint too if you override the tunnel's local port.

Use Ctrl-C to stop the Console, then Ctrl-C in the first terminal to close the
tunnel. Do not forward the Console or migration API ports to other machines.
See the [Hasura CLI Console reference](https://hasura.io/docs/2.0/hasura-cli/commands/hasura_console/)
for the supported flags and environment variables.

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
