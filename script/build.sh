#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Build all images in sequence
for target in api email uw
do
  $PREFIX docker build $BACKEND_DIR/flow \
    -t neuwflow/$target:latest \
    --target $target \
    --label org.opencontainers.image.revision=$(git rev-parse HEAD) \
    --label org.opencontainers.image.source=github.com/UWFlow/uwflow
done
