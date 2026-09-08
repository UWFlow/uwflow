#!/bin/sh
# Install root-owned as /usr/local/sbin/uwflow-staging-dump on production.
# stdout is ONLY a PostgreSQL custom-format archive; diagnostics go to stderr.
set -eu
if [ "$#" -ne 0 ]; then
  echo 'This command accepts no arguments.' >&2
  exit 2
fi
# Fixed deployment-specific identifiers; change these during installation if needed.
# No TTY: binary pg_dump output is streamed unchanged over SSH.
exec docker exec \
  -e PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=900000 -c lock_timeout=10000' \
  postgres pg_dump -U postgres -d flow -Fc --no-owner --no-acl
