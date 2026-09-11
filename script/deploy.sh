#!/usr/bin/env bash
set -euo pipefail

# Deploy from this checkout, including when invoked from another directory.
# Set UWFLOW_IMAGE_TAG to a published SHA (or persist it in .env) to pin a release.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ $# -eq 0 ]]; then
    set -- api email uw frontend hasura postgres
fi
for service in "$@"; do
    case "$service" in
        api|email|uw|frontend|hasura|postgres) ;;
        *) echo "Unknown deployment service: $service" >&2; exit 2 ;;
    esac
done

if docker compose version >/dev/null 2>&1; then
    compose=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
    compose=(docker-compose)
else
    echo "Neither docker compose nor docker-compose is available" >&2
    exit 1
fi
compose+=(--project-directory "$ROOT_DIR" --env-file "$ROOT_DIR/.env" -f "$ROOT_DIR/docker-compose.yml")

# Pull everything requested successfully before replacing any containers.
"${compose[@]}" pull "$@"
# Keep the database and unrelated services running for frontend-only releases.
# Existing dependencies are managed explicitly through the service arguments.
"${compose[@]}" up -d --no-deps "$@"
"${compose[@]}" ps "$@"
