#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Bring backend environment variables into this script's scope
export $(cat "$BACKEND_DIR/.env" | xargs)

# Run regression tests
docker run --rm -i \
  --env-file ../.env \
  -v "$BACKEND_DIR/regtest":/src:ro \
  --network=host \
  loadimpact/k6 run --insecure-skip-tls-verify /src/test.js
