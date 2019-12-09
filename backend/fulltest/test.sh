#!/bin/sh

docker run --rm -i \
  --env-file ../.env \
  -v $PWD:/src:ro \
  --network=host \
  loadimpact/k6 run --insecure-skip-tls-verify /src/test.js
