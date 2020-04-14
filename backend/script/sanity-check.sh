#!/bin/sh
# Check that assumptions implicit in the codebase hold

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Backend code is primarily tested on and designed for Linux
system="$(uname -s)"
case "$system" in
  Linux*) pass "Linux is supported";;
  Darwin*) warn "macOS is not supported, but should work";;
  *) warn "$system is not supported, proceed at your peril";;
esac

# This will be caught by docker-compose, but no harm in checking early
if ! test -f "$BACKEND_DIR/.env"
then
  fail ".env does not exist in $BACKEND_DIR: create it from .env.sample"
fi

# This _will not_ be caught by docker-compose, only by the api container
# But api may also refuse to start due to being broken, so this is helpful
sample_keys="$(sed 's/=.*//' $BACKEND_DIR/.env.sample | sort | tr -s '\n')"
actual_keys="$(sed 's/=.*//' $BACKEND_DIR/.env | sort | tr -s '\n')"
if test "$sample_keys" != "$actual_keys"
then
  fail ".env and .env.sample do not contain the same keys"
fi

# Docker exposes containers to each other
# under 0.0.0.0 or $container_name but not 127.0.0.1 or localhost
if grep localhost "$BACKEND_DIR/.env"
then
  warn ".env mentions 'localhost', but should likely reference Docker container"
fi
