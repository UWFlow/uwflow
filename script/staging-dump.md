# Stream a production snapshot to staging over SSH

`staging-dump.sh` writes a PostgreSQL custom-format dump to stdout. It runs
`pg_dump` inside the existing `postgres` container, requests a read-only database
session, and creates no dump file on production. Errors go to stderr and a failed
dump returns a nonzero status. No arguments are accepted.

The dump command is shared with `backup-local.sh` through `postgres-dump.sh`.
Both use a read-only session with a 15-minute statement timeout and a 10-second
lock timeout. Local backups retain archive validation and atomic file promotion;
the staging exporter streams the archive and omits ownership and ACLs.

Install the script and shared helper on production as root-owned files:

```sh
sudo install -d -o root -g root -m 0755 /usr/local/lib/uwflow
sudo install -o root -g root -m 0644 script/postgres-dump.sh /usr/local/lib/uwflow/postgres-dump.sh
sudo install -o root -g root -m 0755 script/staging-dump.sh /usr/local/sbin/uwflow-staging-dump
```

The fixed container name is `postgres`, database is `flow`, and database user is
`postgres`. Adjust these identifiers during installation if production differs.
The PostgreSQL port is fixed at 5432. The receiving staging server
must use a compatible `pg_restore` version, at least as new as the dump client.

Create a dedicated SSH account, e.g. `staging-sync`, and grant only this exact
root-owned command in sudoers (validate with `visudo`):

```text
staging-sync ALL=(root) NOPASSWD: /usr/local/sbin/uwflow-staging-dump ""
```

In that account's `authorized_keys`, prefix the staging public key with:

```text
restrict,command="sudo -n /usr/local/sbin/uwflow-staging-dump" ssh-ed25519 PUBLIC_KEY staging-sync
```

The account does not need membership in the Docker group. Keep the installed
script, shared helper, and their parent directories unwritable by the SSH account. The forced
command restricts this key to database exports and disables forwarding and PTYs.
Protect access to this key: the snapshot includes production data.

From staging, use a dedicated private key and a verified `known_hosts` entry:

```sh
ssh -T -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile=./known_hosts -i ./id_ed25519 \
  staging-sync@PRODUCTION_HOST /usr/local/sbin/uwflow-staging-dump > snapshot.pending.dump
```

Only use the output if SSH exits successfully. The staging sync runner should
validate the archive, back up staging, restore with `pg_restore --exit-on-error`,
apply the deployed revision's migrations, and run health checks. Replace the
saved reset baseline only after success; restore the staging backup on failure.
Production is exclusively the dump source, never a restore target.
