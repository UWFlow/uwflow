#!/bin/sh
# Run from the production checkout alongside postgres-dump.sh.
# stdout is ONLY a PostgreSQL custom-format archive; diagnostics go to stderr.
set -eu
if [ "$#" -ne 0 ]; then
  echo 'This command accepts no arguments.' >&2
  exit 2
fi
# Resolve the helper relative to this script, independent of the working directory.
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/postgres-dump.sh"
# Fixed deployment-specific identifiers; change these during installation if needed.
PREFIX='' dump_postgres -U postgres -d flow -p 5432 --no-owner --no-acl
