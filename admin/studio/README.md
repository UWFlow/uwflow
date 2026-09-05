# Private database administration with Supabase Studio

This opt-in Compose overlay runs Studio, postgres-meta, and an authenticated
Nginx gateway against UWFlow's existing stock PostgreSQL 15 database. It adds no
Supabase database, Auth, PostgREST, Storage, Realtime, or public website route.
Hasura remains responsible for application permissions and schema migrations;
the Go API still issues UWFlow's user tokens.

## Access and privilege boundaries

The only new published port is `127.0.0.1:8001`. Access it through SSH and HTTP
Basic authentication. **Self-hosted Studio does not authenticate its own API
requests**: never publish Studio's port 3000 or postgres-meta's port 8080, or
route around the gateway. The gateway authenticates every path, including SQL
requests, and rejects unexpected Host, Origin, and cross-site fetch headers.
Use exactly `http://localhost:8001` in the browser.

Studio and the gateway share an internal Docker network with postgres-meta.
Only postgres-meta also joins the separate internal network attached to
Postgres. None of the three new services joins the application's default
network. Studio and meta have no external network access; only the gateway has
a separate routable network for localhost port publishing. All three run without
root, Linux capabilities, or writable root filesystems. Docker administrators and trusted processes on the
host remain inside the trust boundary. Use Docker Engine 28+ so localhost port
publishing also blocks access from other hosts on the same L2 network.

The dedicated `flow_studio` login inherits PostgreSQL's `pg_read_all_data` and
`pg_write_all_data` roles: **this grants access to all application data, including
private schemas and future tables**. Give access only to database administrators.
Hasura permissions do not apply to this connection. It has no superuser,
role-creation, database-creation, replication, or RLS-bypass privileges, and does
not own application tables. Existing SQL functions keep their own permissions.
The Studio read-only connection setting uses the same login; it is not an
additional security boundary. This is a data administration tool, not a read-only
viewer or a way to perform schema changes outside migrations.

## Enable on an existing backend host

Requirements: Docker Engine 28+, Docker Compose v2, `openssl`, and `htpasswd`
(Debian/Ubuntu: `apache2-utils`). Take and verify a database backup first. Test
against a restored non-production database before enabling production access.

1. From the backend checkout, connect as the existing database administrator:

   ```sh
   docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
   ```

   Run the statements in [`create-role.sql`](create-role.sql) once, then run
   `\password flow_studio`. Set a fresh password from `openssl rand -hex 32`
   using the interactive prompt; do not put it in SQL history or shell arguments.
   The script deliberately fails if the role already exists. Inspect its grants
   before reusing an existing role rather than silently changing its privileges.

2. Copy [`env.sample`](env.sample) to `admin/studio/.env`.
   Set `STUDIO_DB_PASSWORD` to the password from step 1 and `STUDIO_CRYPTO_KEY`
   to a separate `openssl rand -hex 32` value. Use hex values because Studio
   embeds the password in a connection URI. Run `chmod 600 admin/studio/.env`.
   Never reuse the database owner's password or Hasura secrets. Only these two
   new secrets and the database name/port are passed to the admin services.
   Do not put admin secrets in the backend's root `.env`, which is passed to
   application containers. In that root `.env`, add only
   `COMPOSE_FILE=docker-compose.yml:docker-compose.studio.yml` to enable the
   overlay for subsequent deployments.

3. Create a separate gateway login (interactive password prompt):

   ```sh
   mkdir -p admin/studio/.secrets
   chmod 700 admin/studio/.secrets
   htpasswd -cB admin/studio/.secrets/htpasswd YOUR_ADMIN_NAME
   chmod 644 admin/studio/.secrets/htpasswd
   ```

   The directory prevents other host users from reading the hash file; the file
   is readable inside the non-root proxy's read-only mount. Add further named
   administrators with `htpasswd -B` (omit `-c`, which replaces the file). Use
   distinct strong passwords. The `.secrets` directory is gitignored.

4. Validate and pull the three pinned images:

   ```sh
   docker compose config --quiet
   docker compose pull studio studio-meta studio-proxy
   ```

   Avoid printing full resolved Compose config, which contains secrets. The
   overlay requires both secret files to exist. Its entrypoint rejects missing,
   malformed, or identical secrets before starting Studio or meta.

5. Schedule a brief backend maintenance window for the first start:

   ```sh
   docker compose up -d postgres
   docker compose up -d --wait studio-proxy
   ```

   The first command recreates the existing Postgres container to attach its new
   network; it preserves the existing image, command, database volume, and ports.
   It can interrupt database connections. The second starts all admin services.
   Keep `COMPOSE_FILE=docker-compose.yml:docker-compose.studio.yml` in `.env` so
   subsequent Compose operations, including `script/deploy.sh`, preserve the
   Postgres network. For local development include `docker-compose.dev.yml` too.
   The normal deploy script updates only the app services; admin image upgrades
   use the explicit commands below.

6. On your workstation, open a tunnel and keep it running:

   ```sh
   ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:8001:127.0.0.1:8001 ADMIN@BACKEND_HOST
   ```

   Visit `http://localhost:8001`, enter the gateway credentials, and open the
   table or SQL editor. SSH encrypts the remote connection. Do not expose this
   HTTP Basic-auth endpoint on a public interface or proxy it through UWFlow's
   public Nginx. Close the browser session and SSH tunnel when finished.

## What works, and what stays in Hasura

Use table discovery, row reads/edits, and SQL with the dedicated role. Database
RLS, constraints, and triggers still apply. Run `SELECT current_user` in the SQL
editor to confirm `flow_studio`. Schema/role changes and some Studio monitoring
queries require higher privileges and may fail; do not grant superuser to make
those panels work. Run schema changes through tracked Hasura migrations, then
update metadata where needed.

Supabase-specific Auth, Storage, Realtime, logs, API documentation, extensions,
and advisor panels are not supported by this deployment. Do not follow Studio
prompts to install Supabase schemas or grant client roles access to UWFlow data.
Saved SQL snippets are temporary and disappear when Studio is recreated; store
reviewable SQL in the repository. No AI provider key is configured.

This overlay does not change pre-existing host bindings for Postgres, Hasura,
or the Go API. Their existing firewall and ingress restrictions still need to
be maintained; a private Studio gateway does not protect a separately exposed
database port.

## Verification

Run `python3 admin/studio/test.py` from a development checkout. It uses the actual
overlay with a disposable stock PostgreSQL 15 database, random credentials, and
a random Compose project. Port 8001 must be free. It checks unauthenticated and
wrong-password rejection, Host/Origin protection, table discovery, a SQL
read/update/read round trip, RLS enforcement, and rejected privilege escalation
and table deletion. It removes only its test project and uses no production data.

On the deployed host, verify `docker compose ps` publishes only
`127.0.0.1:8001` for the gateway and no ports for Studio/meta. Through the tunnel:

```sh
curl -i http://localhost:8001/api/platform/projects
curl --user YOUR_ADMIN_NAME http://localhost:8001/api/platform/projects
```

Expect 401 without credentials and 200 after the second command's password
prompt. Inspect the table editor yourself for visual acceptance; automated
verification uses terminal HTTP/SQL checks only.

## Rotation, upgrades, and removal

- Rotate a gateway password with `htpasswd -B`, then recreate `studio-proxy` so
  its bind mount sees the replaced file. Disable an administrator with
  `htpasswd -D` and the same recreation.
- Rotate the database password with `\password flow_studio`, update `admin/studio/.env`, then
  recreate Studio and postgres-meta. Rotate `STUDIO_CRYPTO_KEY` in both services
  together. Never copy these credentials into frontend configuration.
- Studio and postgres-meta tags and multi-platform digests are pinned together
  from the upstream Docker configuration. Review release/security notes, update
  pins deliberately, and rerun the integration test before upgrading. Pull and
  run `docker compose up -d --wait studio-proxy` with the overlay enabled.
- To disable access, run `docker compose stop studio-proxy studio studio-meta`.
  To remove the containers, run `docker compose rm -f studio-proxy studio studio-meta`
  after stopping them. Remove the Studio entries from `.env` and recreate
  Postgres in a maintenance window to detach its admin network. As DB admin,
  terminate remaining `flow_studio` sessions, revoke its grants, and drop the
  login when no longer needed. Remove `admin/studio/.env` and the gateway hash
  file after revoking access. Preserve the normal PostgreSQL volume and backups;
  do not use `docker compose down -v` on the backend.

References: [upstream Docker configuration](https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml),
[Studio privilege configuration](https://supabase.com/docs/guides/self-hosting/remove-superuser-access),
[PostgreSQL predefined roles](https://www.postgresql.org/docs/15/predefined-roles.html),
[Docker port publishing](https://docs.docker.com/engine/network/port-publishing/).
