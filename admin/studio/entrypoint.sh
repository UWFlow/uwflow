#!/bin/sh
set -eu

# Do not source an env file as shell code or print secret values on failure.
for value in "${STUDIO_DB_PASSWORD:-}" "${STUDIO_CRYPTO_KEY:-}"; do
    case "$value" in
        ''|*[!0-9a-fA-F]*) echo 'Studio secrets must be generated with openssl rand -hex 32' >&2; exit 1 ;;
    esac
    [ "${#value}" -eq 64 ] || { echo 'Studio secrets must contain 64 hex characters' >&2; exit 1; }
done
[ "$STUDIO_DB_PASSWORD" != "$STUDIO_CRYPTO_KEY" ] || { echo 'Use independent Studio secrets' >&2; exit 1; }
export POSTGRES_PASSWORD="$STUDIO_DB_PASSWORD" PG_META_DB_PASSWORD="$STUDIO_DB_PASSWORD"
export PG_META_CRYPTO_KEY="$STUDIO_CRYPTO_KEY" CRYPTO_KEY="$STUDIO_CRYPTO_KEY"
unset STUDIO_DB_PASSWORD STUDIO_CRYPTO_KEY value
exec "$@"
