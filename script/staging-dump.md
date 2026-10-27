# Stream a production snapshot to staging over SSH

`staging-dump.sh` writes a PostgreSQL custom-format dump to stdout. It runs
`pg_dump` inside the existing `postgres` container, requests a read-only database
session, and creates no dump file on production. Errors go to stderr and a failed
dump returns a nonzero status. No arguments are accepted.

The dump command is shared with `backup-local.sh` through `postgres-dump.sh`.
Both use a read-only session with a 15-minute statement timeout and a 10-second
lock timeout. Local backups retain archive validation and atomic file promotion;
the staging exporter streams the archive and omits ownership and ACLs.

Run the exporter directly from the production checkout at
`/home/ec2-user/uwflow/script/staging-dump.sh`. Keep `postgres-dump.sh` beside it;
the exporter resolves the helper relative to its own location, regardless of the
SSH session's working directory. No installation under `/usr/local` is needed.
The current staging connection uses `ec2-user`, which has Docker access.

The fixed container name is `postgres`, database is `flow`, and database user is
`postgres`. Adjust these identifiers during installation if production differs.
The PostgreSQL port is fixed at 5432. The receiving staging server
must use a compatible `pg_restore` version, at least as new as the dump client.

From staging, use a dedicated private key and a verified `known_hosts` entry:

```sh
ssh -T -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile=./known_hosts -i ./id_ed25519 \
  ec2-user@PRODUCTION_HOST /home/ec2-user/uwflow/script/staging-dump.sh > snapshot.pending.dump
```

Only use the output if SSH exits successfully. The staging sync runner should
validate the archive, back up staging, restore with `pg_restore --exit-on-error`,
apply the deployed revision's migrations, and run health checks. Replace the
saved reset baseline only after success; restore the staging backup on failure.
Production is exclusively the dump source, never a restore target.
