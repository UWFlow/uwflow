-- ClickHouse schema for the UWFlow events-analytics pipeline.
-- This file is mounted into the container's /docker-entrypoint-initdb.d/
-- directory, so ClickHouse runs it automatically on first startup (when the
-- data directory is empty). It is written to be idempotent (IF NOT EXISTS)
-- so re-running it by hand is harmless.

CREATE DATABASE IF NOT EXISTS analytics;

-- Raw event store. Rows are inserted by the Go API's async writer
-- (flow/api/events) and expire after 90 days once they've been archived to
-- S3/Glacier by the daily ETL (script/etl-events-archive.sh).
CREATE TABLE IF NOT EXISTS analytics.events
(
    -- Event name, e.g. "course_view". Low-cardinality set, so dictionary-encode.
    name        LowCardinality(String),
    -- Client-supplied event timestamp (epoch millis on the wire).
    ts          DateTime64(3),
    -- Server-stamped ingestion time. Authoritative; the client clock is not.
    received_at DateTime64(3) DEFAULT now64(3),
    anonymous_id String,
    session_id   String,
    url          String,
    referrer     String,
    -- sha256(client_ip + EVENTS_IP_HASH_SALT). We never store the raw IP.
    ip_hash      String,
    user_agent   String,
    -- Flat JSON object of string/number/bool props, stored as raw JSON text.
    props        String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(ts)
ORDER BY (name, ts)
TTL toDateTime(ts) + INTERVAL 90 DAY;
