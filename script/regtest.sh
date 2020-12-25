#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Run regression tests
# - GODEBUG=tls13=1 enables TLS1.3 support, which our NGINX container uses
# - network=host is used because the container
#   does not use the host address resolution otherwise, which is inconvenient
# - insecure-skip-tls-verify is to ignore that the cert is self-signed
$PREFIX docker run --rm -i \
  --env-file "$BACKEND_DIR/.env" \
  -e GODEBUG=tls13=1 \
  -v "$BACKEND_DIR/regtest":/src:ro \
  --network=host \
  loadimpact/k6 run --insecure-skip-tls-verify /src/test.js
