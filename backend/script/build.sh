#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Build all images in sequence
for target in api mongo uw
do
  $PREFIX docker build --target $target -t neuwflow/$target:latest $BACKEND_DIR/flow
done
