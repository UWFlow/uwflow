#!/bin/sh
# Shared by local backups and the installed staging exporter.
dump_postgres() {
  # No TTY: preserve the binary archive on stdout. PREFIX comes from common.sh.
  ${PREFIX:-} docker exec \
    -e PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=900000 -c lock_timeout=10000' \
    postgres pg_dump -Fc "$@"
}
