#!/bin/sh

# Bail on errors and unset variables
set -eu

# Bring environment variables into this script's scope
export $(cat .env | xargs)
# Necessary outside of Docker
export POSTGRES_HOST=localhost

# Prefix docker commands with sudo if the user is not in the `docker` group
if ! $(groups | grep docker)
then
  PREFIX="sudo"
else
  PREFIX=""
fi

# Restart docker containers, rebuilding images as needed
$PREFIX docker-compose down
$PREFIX docker volume rm backend_postgres
$PREFIX docker-compose up -d --build

# Wait for migrations to be applied by selecting from a random table
while ! $PREFIX docker exec postgres \
  psql -U $POSTGRES_USER $POSTGRES_DB -c 'SELECT TRUE FROM term_date' \
  >/dev/null 2>/dev/null
do
  echo "Waiting for containers to settle..."
  sleep 10
done

# Run import jobs
(cd uwapi-importer && go run .)
(cd mongo-importer && go run . $MONGO_DUMP_PATH)
