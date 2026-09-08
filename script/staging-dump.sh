#!/bin/sh
# Install root-owned as /usr/local/sbin/uwflow-staging-dump on production.
# stdout is ONLY a PostgreSQL custom-format archive; diagnostics go to stderr.
set -eu
if [ "$#" -ne 0 ]; then
  echo 'This command accepts no arguments.' >&2
  exit 2
fi
# Load only the root-owned installed helper, never a file from the checkout.
. /usr/local/lib/uwflow/postgres-dump.sh
# Fixed deployment-specific identifiers; change these during installation if needed.
PREFIX='' dump_postgres -U postgres -d flow -p 5432 --no-owner --no-acl
