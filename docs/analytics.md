# Events analytics pipeline

This document describes the backend half of the UWFlow events-analytics
pipeline: a self-hosted ClickHouse store, a secure ingestion endpoint on the Go
API, daily archival to S3 / Glacier Deep Archive, and EC2 monitoring.

> The **frontend** (separate repo) additionally dual-sends the same events to
> **PostHog Cloud**. That is out of scope here — this backend is the raw store,
> ingestion, archival, and monitoring only. PostHog is not touched by the
> backend.

## Architecture

```
browser ──POST /events──► nginx (rate limit, 64k cap) ──► Go API (/events)
                                                              │
                                          validate + hash IP  │  async batched
                                                              ▼  insert
                                                        ClickHouse (analytics.events)
                                                              │  TTL 90 days
                                       daily cron (etl)        │
                                  export prev day as Parquet   ▼
                                          aws s3 cp ──► s3://uwflow-events-archive/events/dt=YYYY-MM-DD/
                                                              │  lifecycle: +30 days
                                                              ▼
                                                     Glacier Deep Archive
```

- **ClickHouse** runs as a self-hosted docker-compose service on the same single
  EC2 box (`clickhouse/clickhouse-server:24`). It is **internal-only** — not
  published to the host or the public internet — and capped at 1 GiB RAM so a
  traffic spike can't OOM the box. ~10k events/day is tiny for ClickHouse.
- **Raw rows expire after 90 days** (table TTL). S3 + Glacier is the long-term
  system of record.

## Ingestion contract

The frontend posts batches to:

```
POST https://<domain>/events
Content-Type: application/json
```

`<domain>` is `uwflow.com` in prod, `next.uwflow.com` for staging, and
`http://localhost:3000` → API in dev. (It also works at `/api/events`, but use
`/events` — that path has the dedicated nginx rate limit and body cap.)

There is **no browser secret key** — a key shipped in frontend JS is not secret.
Security is enforced server-side:

- **CORS allowlist**: `uwflow.com`, `www.uwflow.com`, `next.uwflow.com`, plus
  `http://localhost:3000` in dev (`RUN_MODE=dev`).
- **Per-IP rate limit**: token bucket (~20 events/s, burst 60) in the Go handler,
  behind a coarser nginx `limit_req` (10 r/s, burst 20) at the edge.
- **Caps**: body ≤ 64 KiB, ≤ 50 events/batch, string fields ≤ 255 chars, props
  blob ≤ 4 KiB, event name ≤ 64 chars.
- **Strict schema validation.** A malformed batch is rejected; the endpoint is
  fire-and-forget and **never 500s the page**.

### Request body

```json
{
  "events": [
    {
      "name": "course_view",
      "ts": 1718500000000,
      "anonymous_id": "uuid",
      "session_id": "uuid",
      "url": "/course/cs246",
      "referrer": "/explore",
      "props": { "course_code": "cs246", "dwell_ms": 1234 }
    }
  ]
}
```

| field          | required | rules                                                        |
| -------------- | -------- | ------------------------------------------------------------ |
| `name`         | yes      | snake_case (`^[a-z][a-z0-9_]*$`), ≤ 64 chars                  |
| `ts`           | yes      | epoch **millis** (client clock); bogus values fall back to server time |
| `anonymous_id` | yes      | string ≤ 255 chars                                           |
| `session_id`   | yes      | string ≤ 255 chars                                           |
| `url`          | no       | string ≤ 255 chars                                           |
| `referrer`     | no       | string ≤ 255 chars                                           |
| `props`        | no       | **flat** object of string/number/bool values only            |

### Responses

| status | meaning                                  |
| ------ | ---------------------------------------- |
| `202`  | accepted (empty body)                    |
| `400`  | malformed body or a failed-validation event |
| `413`  | body too large or > 50 events            |
| `429`  | rate limited                             |

The server adds three fields the client never sends:
`received_at` (server time), `ip_hash` (`sha256(client_ip + EVENTS_IP_HASH_SALT)`
— **the raw IP is never stored**), and `user_agent`.

## ClickHouse schema

`clickhouse/init/001_events.sql` (run automatically on first container start)
creates database `analytics` and:

```sql
CREATE TABLE analytics.events (
    name        LowCardinality(String),
    ts          DateTime64(3),
    received_at DateTime64(3) DEFAULT now64(3),
    anonymous_id String,
    session_id   String,
    url          String,
    referrer     String,
    ip_hash      String,
    user_agent   String,
    props        String        -- raw JSON
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(ts)
ORDER BY (name, ts)
TTL toDateTime(ts) + INTERVAL 90 DAY;
```

## Archival (S3 + Glacier)

- `script/etl-events-archive.sh` exports the **previous day's** partition via
  `clickhouse-client ... FORMAT Parquet` and `aws s3 cp`s it to
  `s3://<bucket>/events/dt=YYYY-MM-DD/events.parquet`. It is idempotent (rerun =
  overwrite the same key) and supports `ETL_DATE=YYYY-MM-DD` for backfills.
- A daily cron at **03:15 UTC** runs it (wired in
  `staging/templates/user_data.sh.tftpl`).
- Terraform (`staging/s3-events-archive.tf`) creates the bucket (private, SSE-S3)
  with a lifecycle rule transitioning `events/*` to **Glacier Deep Archive after
  30 days**, and grants the instance role `s3:PutObject` to `events/*`.

## Monitoring

`staging/cloudwatch.tf` (fulfils the CloudWatch TODO in `main.tf`):

- Attaches `CloudWatchAgentServerPolicy` to the instance role; the agent is
  installed + configured in `user_data.sh.tftpl` (CPU, memory, disk, swap at
  5-min resolution).
- **High-CPU alarm** (`AWS/EC2 CPUUtilization` ≥ 80% for 15 min) to spot
  analytics traffic burning CPU.
- **Low-root-disk alarm** (agent `disk_used_percent`) — ClickHouse data and the
  Parquet exports live on the root volume.
- Optional **SNS topic + email** (`alarm_email`); confirm the subscription via
  the email AWS sends.

## Configuration

### App env vars (set in `.env` / Terraform `app_env`)

| var                  | example       | notes                                   |
| -------------------- | ------------- | --------------------------------------- |
| `CLICKHOUSE_HOST`    | `clickhouse`  | compose service name (internal)         |
| `CLICKHOUSE_PORT`    | `9000`        | native TCP protocol port                |
| `CLICKHOUSE_DB`      | `analytics`   |                                         |
| `CLICKHOUSE_USER`    | `flow_events` |                                         |
| `CLICKHOUSE_PASSWORD`| (secret)      | **set a real secret in prod/staging**   |
| `EVENTS_IP_HASH_SALT`| (secret)      | long random string; rotating it unlinks history |

### Terraform vars (`staging/terraform.tfvars`)

| var                                 | default                  | notes                              |
| ----------------------------------- | ------------------------ | ---------------------------------- |
| `events_archive_bucket`             | `uwflow-events-archive`  | **globally unique** — change it    |
| `events_archive_glacier_days`       | `30`                     | days before Deep Archive transition |
| `alarm_email`                       | `""`                     | empty = no notifications           |
| `cpu_alarm_threshold`               | `80`                     | percent                            |
| `disk_free_alarm_threshold_percent` | `15`                     | percent free                       |

## Deploy

Local dev:

```bash
cp .env.sample .env   # fill in the CLICKHOUSE_* and EVENTS_IP_HASH_SALT values
make start            # brings up clickhouse alongside the rest
```

Staging (single EC2 box):

```bash
cd staging
cp terraform.tfvars.example terraform.tfvars   # set bucket, app_env secrets, salt
terraform init
terraform plan
terraform apply
```

Things a human **must** set before deploy:

- A strong `CLICKHOUSE_PASSWORD` and a long random `EVENTS_IP_HASH_SALT` (in
  `app_env`).
- A globally-unique `events_archive_bucket`.
- Optionally `alarm_email` (and confirm the SNS subscription email).

## Operational notes

- **ClickHouse must stay internal.** Never add a `ports:` mapping for it or an
  nginx `location` that reaches it — only the Go ingestion handler talks to it.
- If ClickHouse is down, the Go writer logs and **drops** events rather than
  blocking or 500-ing the page. The async buffer absorbs short outages.
- Glacier Deep Archive retrieval is slow (hours) — it's cold storage, not a
  query path. Warm analytics (≤ 90 days) lives in ClickHouse.
```
