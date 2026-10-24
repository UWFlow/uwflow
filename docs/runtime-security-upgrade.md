# October 2026 runtime security upgrade

| Component | Version | Configuration |
| --- | --- | --- |
| Bun | 1.4.4 | `frontend/.bun-version` (local, CI, Docker, Vercel) |
| Go | 1.27.3 | `flow/go.mod` and both toolchain stages in `flow/Dockerfile` |
| Hasura | 2.49.2 | `docker-compose.yml` |
| PostgreSQL | 15.19 | `docker-compose.yml`; remains on major version 15 |

Bun 1.4.4 fixes the bundled Brotli decoder vulnerability
[CVE-2026-111497](https://github.com/oven-sh/bun/security/advisories/GHSA-663w-cv8g-jj2p).
Go 1.25 is outside the supported release window; 1.27.3 includes the
[October security fixes](https://go.dev/doc/devel/release).
Hasura 2.49.2 fixes a
[computed-field authorization bypass](https://github.com/hasura/graphql-engine/security/advisories/GHSA-r27x-gc74-qmxh).
PostgreSQL 15.19 includes the latest
[15.x security fixes](https://www.postgresql.org/docs/release/15.19/).

## Local tools

Install the Bun version in `frontend/.bun-version` before running frontend
commands. If using Node.js separately, use patched Node 22.23.4, 24.22.1,
or a later security release on a supported line. Repository changes do not
upgrade installed tools or already-running containers.

## Rollout

1. Validate and merge the PR, then wait for CI to publish all application images.
   Builds now pull their base images so cached Alpine/nginx tags do not silently
   retain old packages.
2. Before upgrading an existing environment, take and verify a restorable
   PostgreSQL backup, including Hasura's catalog, and save a metadata export.
   Review the PostgreSQL 15.19 release notes for extension-specific reindexing
   and configuration steps relevant to that database.
3. Update that environment's checkout to the merged revision and set
   `UWFLOW_IMAGE_TAG` in its `.env` to the published commit SHA. Run
   `./script/deploy.sh` to pull and recreate all services using these versions.
   PostgreSQL stays on 15.x; no major-version dump/restore is required.
4. Verify PostgreSQL's server version, Hasura `/v1/version`, `/healthz`, metadata
   consistency, and application auth, course queries, uploads, and calendar flows.
   Rebuild local development images before restarting development services:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.dev.yml build --pull
   ```

Hasura may upgrade its internal catalog. Rolling application images back does
not undo that catalog upgrade; use a tested Hasura downgrade procedure or the
pre-upgrade database backup rather than simply starting the old Hasura image.
