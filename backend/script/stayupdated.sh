#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

cd "$BACKEND_DIR"

while true
do
  $PREFIX docker-compose pull
  $PREFIX docker-compose up -d
  # Update every minute
  sleep 1m
done
