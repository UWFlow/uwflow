#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"
# Ensure basic assumptions hold
"$DIR/sanity-check.sh"

# Bring backend environment variables into this script's scope
cd "$BACKEND_DIR"
export $(cat .env | xargs)

# Restart docker containers, rebuilding images as needed
$PREFIX docker-compose down --remove-orphans
$PREFIX docker volume rm -f backend_postgres

# Generate self-signed SSL certificate if needed
"$DIR/generate-ssl-cert.sh"

# Update to latest published images
$PREFIX docker-compose pull
# Build local changes, if any
"$DIR/build.sh"
# Launch all containers
$PREFIX docker-compose up -d

# Wait for migrations to be applied by selecting from a random table
while ! $PREFIX docker exec postgres \
  psql -U $POSTGRES_USER $POSTGRES_DB -c 'SELECT TRUE FROM term' \
  >/dev/null 2>/dev/null
do
  echo "Waiting for containers to settle..."
  sleep 10
done

# Necessary outside of Docker
export POSTGRES_HOST=localhost
# Run import jobs
(cd flow/importer/uw && go run . terms)
(cd flow/importer/mongo && go run .)
(cd flow/importer/uw && go run . sections && go run . exams)
