# Hasura backend

This serves as a Postgres -> GraphQL adapter.
We use GraphQL to perform all CRUD operations for UWFlow.

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

## Production CLI and Console access

The helper connects through SSH to Hasura at `127.0.0.1:8080` on the server. The public `/graphql` route still uses Docker networking. The engine's
built-in Console stays disabled; run the CLI Console on your own machine.
SSH access and the production Hasura admin secret are both required. The admin
secret grants full access, including through the public GraphQL endpoint; keep it
in your password manager and never commit it or include it in command arguments.

### Server prerequisite

Production Hasura must be reachable at `127.0.0.1:8080` from the SSH host and
configured with a non-empty `HASURA_GRAPHQL_ADMIN_SECRET`. The CLI Console works
with `HASURA_GRAPHQL_ENABLE_CONSOLE=false`; no server-side Console is needed.
The helper does not change the server's port bindings or firewall rules. The
current Compose configuration publishes Hasura on all host interfaces; the SSH
workflow does not itself prevent direct access to that published port.

### Connect

Install the Hasura v2 CLI and use a checkout matching the deployed migrations and
metadata. Configure an SSH host alias with your production host, user, and key.
Verify the server's SSH host-key fingerprint through a trusted channel and add it
to `known_hosts` before using the helper; it refuses unknown or changed host keys.

From the backend repository root, run one command. The optional second argument
is the local port where you want to open the **Console**, defaulting to `9695`:

```sh
./script/hasura-prod-tunnel.sh uwflow-prod 9695
```

Replace `uwflow-prod` with your SSH alias if different. Enter the production
Hasura admin secret at the hidden prompt, then open `http://127.0.0.1:9695` once
the CLI reports it is ready. No second terminal or separate CLI command is needed.
The script can also be invoked from another working directory.

The script forwards the server's Hasura API on port `8080` through SSH and runs
the Hasura CLI Console locally. It uses the next two local ports internally:
for Console port `9695`, the migration API uses `9696` and the engine tunnel uses
`9697`. All three bind to `127.0.0.1`. Choose another Console port if any of these
ports are occupied; the allowed range is `1024`–`65533`. The remote Hasura port is
fixed at the production default, `8080`.

The secret is supplied to the CLI through its environment, without putting it in
command arguments or writing it to disk. Console edits affect production
immediately and can write migration/metadata files into this checkout; review
and commit those changes.

Leave the command running while using the Console. Ctrl-C stops the Console and
closes its dedicated SSH tunnel. Startup failures also close the tunnel. Do not
forward these local ports to other machines.
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
