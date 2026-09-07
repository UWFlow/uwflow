# PostHog PostgreSQL source

Status: connection design and deployment prerequisites. This PR changes the
Compose host binding and supplies opt-in SSH/SQL configuration; it does not
configure production or start exporting data. The initial table/column allowlist,
PostHog region, and production host settings still need to be selected/verified.

## Connection boundary

```text
PostHog Cloud source worker
  -> encrypted SSH, dedicated key, region-specific source IP allowlist
  -> production host sshd, user posthog_tunnel
  -> only 127.0.0.1:POSTGRES_PORT
  -> Docker PostgreSQL, user flow_posthog
  -> explicitly approved relations
```

[PostHog supports SSH tunnels for PostgreSQL sources](https://posthog.com/docs/cdp/sources/postgres).
Use scheduled full/incremental sync initially. Leave CDC disabled: this design
does not grant replication or table ownership and does not change WAL settings.

Nginx handles HTTP for the frontend, `/api`, and `/graphql`. PostgreSQL uses its
own wire protocol; adding an HTTP location cannot proxy it. An Nginx TCP stream
listener would add another exposed service without providing database privileges.
The required forwarding change is therefore in `docker-compose.yml`: publish
PostgreSQL on IPv4 loopback only. Containers still use `postgres:POSTGRES_PORT`
over the existing Docker network. Host tools use `127.0.0.1`, not IPv6 localhost.

This trusts the production host and its Docker network. SSH encrypts the public
hop; it does not isolate PostgreSQL from other processes/containers on that host.
The tunnel key cannot open a shell or forward to Hasura, the API, Docker sockets,
or arbitrary network destinations. The separate database password limits damage
if either credential leaks alone. Store both in the team secret manager and the
PostHog source's credential fields, never in Git, shared `.env`, or shell arguments.

## 1. Make the host database port private

Before rollout, inventory remote database clients and move them to SSH. Inspect
the actual production Compose configuration and running container bindings; a
repository change is not evidence that a public listener is closed. Retain the
provider firewall's deny rules for the database port on both IPv4 and IPv6.
Use an up-to-date Docker Engine; older than 28.0.0 has a documented localhost
publishing caveat for other hosts on the same L2 network
([Docker port publishing](https://docs.docker.com/engine/network/port-publishing/)).

During a short maintenance window, from the production checkout with its existing
environment and volume, recreate only PostgreSQL:

```sh
docker compose up -d --no-deps --force-recreate postgres
docker compose ps postgres
docker inspect postgres --format '{{json .NetworkSettings.Ports}}'
```

Use `docker-compose` instead if that is the installed deployment command. Never
run `make setup` or remove the database volume. A restart briefly disconnects
application clients. Check PostgreSQL readiness and an actual API/Hasura database
read after restart. Inspect the rendered port bindings without sharing environment
secrets. Only `127.0.0.1` should be published for PostgreSQL. Test from a separate
external host that the database port is unreachable, including the server's IPv6
address if it has one. Check for other Compose overrides or TCP proxies too.

## 2. Provision a tunnel-only SSH account

On the same host as Docker, create `posthog_tunnel` with no sudo, Docker group,
or other privileged memberships. Give it a valid shell for OpenSSH account checks;
the configuration's `MaxSessions 0` denies shell/exec/SFTP sessions while allowing
forwarding. Account-lock/PAM behavior varies: verify key login on the actual host
without enabling password authentication.

Generate a dedicated key pair in the secret-management workflow. Install the
public key in `/etc/ssh/authorized_keys/posthog_tunnel`, owned by root and not
writable by the account (directory mode 755, file 644). Restrict the key with:

```text
from="REGIONAL_POSTHOG_IPS",restrict,port-forwarding,permitopen="127.0.0.1:5432" KEY_TYPE PUBLIC_KEY posthog-warehouse
```

Replace `REGIONAL_POSTHOG_IPS` with the comma-separated addresses for the actual
project region from [PostHog's current source IP list](https://posthog.com/docs/cdp/sources#inbound-ip-addresses).
Replace the key fields with the generated public key and `5432` with the actual
`POSTGRES_PORT` everywhere. Do not install the placeholder line. Add those IPs to
the SSH firewall allowlist while retaining existing administrator access. The
key-level source restriction prevents use from other IPs even when SSH allows
administrators more broadly. Review IP changes when PostHog reports connectivity
errors; do not relax the rule to all sources.

Install [sshd_config.conf](sshd_config.conf) in the host's included SSH config
directory, usually `/etc/ssh/sshd_config.d/`. It allows only local TCP forwarding
to the literal `127.0.0.1:5432`; `localhost` does not match. It denies reverse
forwarding, Unix socket forwarding, agent forwarding, PTY and shell sessions.

Keep an administrator session open, validate syntax and effective policy, then
reload the host's SSH service (commonly `systemctl reload ssh` on Ubuntu):

```sh
sudo sshd -t
sudo sshd -T -C user=posthog_tunnel,host=posthog,addr=POSTHOG_SOURCE_IP
```

Replace `POSTHOG_SOURCE_IP` with a real regional address. Confirm effective
`authenticationmethods publickey`, `allowtcpforwarding local`, the exact
`permitopen`, `permitlisten none`, and `maxsessions 0`; earlier matching settings
can take precedence. Also check an administrator's effective config and reconnect
as that administrator before closing the original session. See the
[OpenSSH configuration reference](https://man.openbsd.org/sshd_config).

## 3. Grant the minimum database access

Run [bootstrap.sql](bootstrap.sql) once as the database administrator in the
intended database, through an interactive `psql` session or standard input. It
creates `flow_posthog` with **NOLOGIN**, no password, and no explicit data grants.
It intentionally refuses to reuse an existing role. Do not give PostHog the
application/superuser password or membership in any other role.

Direct SQL bypasses Hasura's row/column authorization. Before enabling login,
record an explicit list of relations, columns, row scope, analytics purpose, and
deletion requirements. Start with public catalog data if sufficient. Never grant
whole-schema access, `pg_read_all_data`, automatic future table grants, or access
to `hdb_catalog`. In particular, `public."user"` includes email and `secret_id`;
do not grant the whole table to obtain an analytics user ID. Schedules, course
history, invites, and authentication data need separate review.

For a fully approved table, the reviewed grant would look like this (example only;
the bootstrap deliberately does not execute it):

```sql
GRANT USAGE ON SCHEMA public TO flow_posthog;
GRANT SELECT ON TABLE public.course TO flow_posthog;
```

A table grant includes future columns. For sensitive or mixed tables, prefer
explicit-column, filtered export relations in a dedicated schema, owned by a
separate non-login owner, with SELECT granted only on each approved export.
Do not use `SELECT *` in export definitions. Validate discovery and sync support
for the chosen relation type with PostHog before rollout; regular curated tables
are an alternative when a connector mode cannot sync views. Only grant access to
the exports, not their backing tables. Export definitions/population are a
follow-up once the desired data is known.

Audit **effective** permissions before LOGIN. All roles inherit `PUBLIC` privileges
even with `NOINHERIT`; revoking a privilege from `flow_posthog` cannot override a
PUBLIC grant. Inspect database CONNECT/CREATE/TEMP, schema CREATE, relation and
column ACLs, role memberships, default privileges, and callable application
functions, especially SECURITY DEFINER functions. Older/restored databases can
grant PUBLIC CREATE on `public`. Resolve inappropriate PUBLIC grants by explicitly
preserving the required application roles' privileges before revoking PUBLIC, and
test application behavior. Do not enable login while unreviewed access remains.

The role's read-only default and timeouts reduce accidental impact, but the client
can change those settings: SQL privileges are the authorization boundary. Even a
read-only user can consume CPU/IO or hold locks. Audit application functions for
side effects and use a replica or separate curated database if stronger workload
or metadata isolation is needed. System catalogs expose object names; this design
does not promise to hide the schema.

Require password authentication for this role in the actual `pg_hba.conf`, with
SCRAM preferred. Docker-forwarded traffic may appear as a bridge address rather
than `127.0.0.1` inside PostgreSQL. Determine that address on the host; use ordered
role-specific rules allowing only the intended database and rejecting this role
for other databases/replication before broader rules. Verify a wrong password and
a different database are rejected. Do not use `trust` or rewrite application
authentication rules blindly.

After the privilege and authentication checks, set a generated password using
interactive `psql` (so it is not in command arguments/history), then enable login:

```text
\password flow_posthog
ALTER ROLE flow_posthog LOGIN;
```

## 4. Configure and verify PostHog

| Field | Value |
| --- | --- |
| Database host / port | `127.0.0.1` / actual `POSTGRES_PORT` |
| Database | Actual production `POSTGRES_DB` |
| Database user / password | `flow_posthog` / dedicated password |
| Schema | Schema containing the approved relations |
| SSH tunnel | Enabled, key authentication |
| Tunnel host / port | Production host's SSH DNS name / actual SSH port |
| SSH user / private key | `posthog_tunnel` / dedicated private key |
| CDC | Disabled |

Use the SSH host directly, not an HTTP-only CDN proxy. Prefer PostgreSQL TLS
through the tunnel when provisioned. The current Compose file does not provision
database TLS certificates; if the server has no TLS, disable PostHog's “Require
TLS through tunnel” only for this same-host loopback design. The public connection
remains encrypted by SSH. Do not apply that exception to a remote bastion-to-DB
network hop. Confirm how the current connector verifies the SSH host identity;
the documented source form does not establish a host-key pinning guarantee.

Perform a small real sync before expanding scope. Verify the imported columns and
rows in PostHog, not just its connection test. Keep sync concurrency within the
role's connection limit; start infrequently, monitor database load and source
failures, and tune timeouts deliberately. Incremental sync needs a reliable cursor
and does not propagate deletions; select full refresh where deletion propagation
is required and verify removal in PostHog. Set warehouse retention/access controls
for any exported personal data.

Acceptance checks on the deployed host and a disposable fixture first:

- Correct key, regional source IP, and DB password allow an approved read.
- Wrong key, wrong source IP, and wrong DB password fail independently.
- Shell/exec/SFTP, reverse forwarding, Unix socket forwarding, and a forward to
  another port (e.g. Hasura) fail; the approved PostgreSQL forward succeeds.
- An authenticated DB client cannot read an unapproved relation or column,
  write even after `SET default_transaction_read_only = off`, create objects,
  assume another role, or use replication. A newly created table stays unreadable.
- PostgreSQL remains unreachable from outside the host; internal services and
  existing administrator SSH access still work.

## Disable, rotate, or roll back

Pause the PostHog source, `ALTER ROLE flow_posthog NOLOGIN`, terminate existing
sessions for that role with `pg_terminate_backend`, and remove its authorized key.
Disabling LOGIN or removing the key alone does not close existing sessions/tunnels;
terminate that account's active SSH connections as well. Rotate the database
password and SSH key independently, updating the source through the secret manager.
Revocation does not delete previously copied data: delete it in PostHog separately
when required.

Keep the database's loopback binding during rollback. Restore any required remote
admin access using SSH. Reverting to a public binding requires a separate firewall
review. Remove only the dedicated account/config and reviewed grants; do not use
`DROP OWNED ... CASCADE` or remove the production volume.

## Local validation

Run `python3 admin/posthog/test.py` with Docker available. It starts a disposable
PostgreSQL 15 container with tmpfs storage, checks bootstrap/role restrictions and
approved versus denied SQL operations, then removes the container. It does not
mount the application volume or use application credentials. The fixture's grants
are test-only. This is not a production ACL audit or an end-to-end PostHog/SSH
test; perform the deployment acceptance checks above before exporting data.
