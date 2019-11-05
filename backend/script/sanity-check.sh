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

# Just source the file instead of awkward handrolled parsing
. "$BACKEND_DIR/.env"

# Check for this simple, if unlikely, case so that impending `stat`
# does not fail with a possibly cryptic error
if ! test -d "$MONGO_DUMP_PATH"
then
  fail "Mongo dump is not unpacked at $MONGO_DUMP_PATH"
fi

if ! test -f "$MONGO_DUMP_PATH/course.bson"
then
  fail "Malformed Mongo dump: missing $MONGO_DUMP_PATH/course.bson"
fi

# Significant changes to ADM-sourced info happen in the span of two months.
# For the lack of a better way, prevent staleness based on that criterion.
last_modified="$(stat --format %Y $MONGO_DUMP_PATH)"
now=$(date +%s)
days_old=$(( (now-last_modified)/(3600*24) ))
max_days_old=60
if test $days_old -gt $max_days_old
then
  fail "Mongo dump is stale ($days_old days old). Download a new one"
fi

pass "Environment is set up correctly"
