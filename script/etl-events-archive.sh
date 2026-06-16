#!/bin/bash
# Daily ETL: archive the previous day's analytics events from ClickHouse to S3
# as Parquet. Wired into cron by staging/templates/user_data.sh.tftpl.
#
# - Exports rows whose ts falls on the target day (default: yesterday, UTC).
# - Uploads to s3://$EVENTS_ARCHIVE_BUCKET/events/dt=YYYY-MM-DD/events.parquet
# - Idempotent: re-running overwrites the same key, and the export is a pure
#   function of the (immutable, past) partition. Safe to retry.
#
# ClickHouse keeps raw rows for 90 days (table TTL); S3/Glacier is the
# long-term record. This script does NOT delete from ClickHouse — the TTL does.
#
# Required environment (sourced from the app .env, plus EVENTS_ARCHIVE_BUCKET
# injected by cloud-init):
#   CLICKHOUSE_DB, CLICKHOUSE_USER, CLICKHOUSE_PASSWORD
#   EVENTS_ARCHIVE_BUCKET
# Optional:
#   CLICKHOUSE_CONTAINER (default: clickhouse)
#   ETL_DATE (YYYY-MM-DD; default: yesterday UTC) — for backfills.

set -euo pipefail

CLICKHOUSE_CONTAINER="${CLICKHOUSE_CONTAINER:-clickhouse}"

# Pick a docker prefix that works whether or not the invoking user is in the
# docker group (cron runs as root on the box, so this is usually a no-op).
if docker info >/dev/null 2>&1; then
  DOCKER="docker"
else
  DOCKER="sudo docker"
fi

: "${CLICKHOUSE_DB:?CLICKHOUSE_DB must be set}"
: "${CLICKHOUSE_USER:?CLICKHOUSE_USER must be set}"
: "${CLICKHOUSE_PASSWORD:?CLICKHOUSE_PASSWORD must be set}"
: "${EVENTS_ARCHIVE_BUCKET:?EVENTS_ARCHIVE_BUCKET must be set}"

# Target day: yesterday in UTC unless ETL_DATE is given (for backfills).
DAY="${ETL_DATE:-$(date -u -d 'yesterday' +%F 2>/dev/null || date -u -v-1d +%F)}"

echo "[etl] archiving events for dt=$DAY"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT
OUTFILE="$WORKDIR/events.parquet"

# Export the day's partition as Parquet via clickhouse-client inside the
# container. We filter on toDate(ts) so the export is exactly one calendar day.
# FORMAT Parquet streams straight to the file.
$DOCKER exec -i "$CLICKHOUSE_CONTAINER" clickhouse-client \
  --user "$CLICKHOUSE_USER" \
  --password "$CLICKHOUSE_PASSWORD" \
  --database "$CLICKHOUSE_DB" \
  --query "SELECT name, ts, received_at, anonymous_id, session_id, url, referrer, ip_hash, user_agent, props FROM events WHERE toDate(ts) = toDate('$DAY') ORDER BY ts FORMAT Parquet" \
  > "$OUTFILE"

ROWS=$(stat -c%s "$OUTFILE" 2>/dev/null || stat -f%z "$OUTFILE")
if [ "$ROWS" -eq 0 ]; then
  echo "[etl] no data for dt=$DAY (empty export); nothing to upload"
  exit 0
fi

KEY="events/dt=$DAY/events.parquet"
echo "[etl] uploading $OUTFILE ($ROWS bytes) to s3://$EVENTS_ARCHIVE_BUCKET/$KEY"

aws s3 cp "$OUTFILE" "s3://$EVENTS_ARCHIVE_BUCKET/$KEY" \
  --content-type application/vnd.apache.parquet \
  --only-show-errors

echo "[etl] done: dt=$DAY archived to s3://$EVENTS_ARCHIVE_BUCKET/$KEY"
