#!/bin/bash
#
# Export the Postgres database to a dump file on this box's local disk.
#
# This is the on-server counterpart to backup-db.sh (which streams to S3).
# Use this one when you want a dump you can scp off the box afterwards.
# Filenames follow the convention already in ~/backup:
#   $BACKUP_DIR/YYYY-MM-DD-pg-latest.dump
#
# The output is custom format (-Fc), the inverse of script/start.sh's
# pg_restore, so a dump produced here can be fed straight back in via
# POSTGRES_DUMP_PATH + `make setup`.
#
# Optional env:
#   BACKUP_DIR   where to write (default: $HOME/backup)
#
# Nothing is pruned — the dump history on this box goes back years and
# deleting any of it is a deliberate decision, not a side effect of a backup.
#
# pipefail matters even without a pipe here: it keeps the exit status honest
# if this ever grows one, and a silently-truncated dump is the failure mode
# we care most about.
set -euo pipefail

DIR="$(dirname "$(realpath "$0")")"
. "$DIR/common.sh"

# Bring backend environment variables into scope (POSTGRES_USER/DB/PORT).
cd "$BACKEND_DIR"
export $(grep -v '^#' .env | xargs)

BACKUP_DIR="${BACKUP_DIR:-$HOME/backup}"
mkdir -p "$BACKUP_DIR"

FINAL="$BACKUP_DIR/$(date +%F)-pg-latest.dump"
# Write to a temp name first, then rename on success, so an interrupted dump
# never appears under the dated name and get mistaken for a good backup.
TMP="$BACKUP_DIR/.in-progress-$(date +%F-%H%M%S).dump"

# The root volume on this box is small and holds every dump ever taken, so
# check before writing rather than discovering it mid-pg_dump.
AVAIL_KB="$(df -Pk "$BACKUP_DIR" | awk 'NR==2 {print $4}')"
if [ "$AVAIL_KB" -lt 204800 ]; then
  fail "Only $((AVAIL_KB / 1024)) MiB free on $BACKUP_DIR; refusing to dump"
elif [ "$AVAIL_KB" -lt 1048576 ]; then
  warn "Only $((AVAIL_KB / 1024)) MiB free on $BACKUP_DIR — prune old dumps soon"
fi

echo "Dumping database '$POSTGRES_DB' to $FINAL ..."

# No -t/-i on docker exec: a TTY would corrupt the binary dump on stdout.
if $PREFIX docker exec postgres \
     pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -p "$POSTGRES_PORT" -Fc \
   > "$TMP"
then
  # Verify it's a readable archive before promoting it. pg_dump can exit 0 and
  # still leave something unusable if the write side failed. Run the check in
  # the container rather than on the host: the host has no postgres client
  # tools installed, and this way the verifier always matches the dumper.
  # No "-" for stdin: pg_restore treats it as a literal filename and fails.
  if ! $PREFIX docker exec -i postgres pg_restore --list >/dev/null 2>&1 < "$TMP"; then
    rm -f "$TMP"
    fail "Dump completed but is not a valid pg archive; nothing written"
  fi
  mv "$TMP" "$FINAL"
  pass "Backup written to $FINAL ($(du -h "$FINAL" | cut -f1))"
else
  rm -f "$TMP"
  fail "pg_dump failed; no backup written for $(date +%F)"
fi
