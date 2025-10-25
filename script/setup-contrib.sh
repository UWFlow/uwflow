#!/bin/sh


# Ensure basic assumptions hold
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

# Bring backend environment variables into this script's scope
cd "$BACKEND_DIR"
export $(cat .env | xargs)

echo "============================================"
echo "Setting up UWFlow for contributors"
echo "This will create a fresh database and populate it with data from UW API"
echo "============================================"

# Restart docker containers, rebuilding images as needed
echo "Cleaning up existing containers and volumes..."
$PREFIX docker-compose down --remove-orphans
$PREFIX docker volume rm -f backend_postgres

# Generate self-signed SSL certificate if needed
"$DIR/generate-ssl-cert.sh"

# Start postgres and wait for it to be ready
echo "Starting postgres..."
$PREFIX docker-compose up -d postgres

# Wait for postgres server to settle
while ! $PREFIX docker exec postgres \
  psql -U $POSTGRES_USER $POSTGRES_DB -p $POSTGRES_PORT -c 'SELECT TRUE' \
  >/dev/null 2>/dev/null
do
  echo "Waiting for postgres to be ready..."
  sleep 5
done

echo "Postgres is ready!"

# Start Hasura to apply migrations and create schema
echo "Starting Hasura to apply migrations..."
$PREFIX docker-compose up -d hasura

# Wait for Hasura to be ready
while ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$HASURA_PORT/healthz | grep -q "200"
do
  echo "Waiting for Hasura to be ready..."
  sleep 5
done

echo "Hasura is ready! Schema has been created."

# Import course data from UW API
echo "Importing course data from UW API..."
echo "This may take several minutes..."
$PREFIX docker-compose up -d --build uw

# Wait for importer container to be ready
sleep 5

$PREFIX docker exec uw /app/uw hourly

echo "Running vacuum to populate search indices..."
$PREFIX docker exec uw /app/uw vacuum

echo "============================================"
echo "Setup complete!"
echo "Your database is now populated with course data from UW API."
echo "Run 'make start' to start all backend services."
echo "============================================"
