#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Run regression tests
# - network=host is used because the container
#   does not use the host address resolution otherwise, which is inconvenient
# - insecure-skip-tls-verify is to ignore that the cert is self-signed
$PREFIX docker run --rm -i \
  --env-file "$BACKEND_DIR/.env" \
  -v "$BACKEND_DIR/regtest":/src:ro \
  --network=host \
  loadimpact/k6 run --insecure-skip-tls-verify /src/test.js
