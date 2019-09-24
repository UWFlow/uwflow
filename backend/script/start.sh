#!/bin/sh
# Restart 

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"
# Ensure basic assumptions hold
"$DIR/sanity-check.sh"

# Bring backend environment variables into this script's scope
cd "$BACKEND_DIR"
export $(cat .env | xargs)

# Prefix docker commands with sudo if the user is not in the `docker` group
# If there is no `sudo` executable, then assume we don't need it anyway
if ! $(groups 2>/dev/null | grep docker) && $(which sudo 2>/dev/null >&2)
then
  PREFIX="sudo"
else
  PREFIX=""
fi

# Restart docker containers, rebuilding images as needed
$PREFIX docker-compose down
$PREFIX docker volume rm -f backend_postgres
$PREFIX docker-compose up -d --build
# Remove outdated API images
$PREFIX docker system prune -f

# Wait for migrations to be applied by selecting from a random table
while ! $PREFIX docker exec postgres \
  psql -U $POSTGRES_USER $POSTGRES_DB -c 'SELECT TRUE FROM term_date' \
  >/dev/null 2>/dev/null
do
  echo "Waiting for containers to settle..."
  sleep 10
done

# Necessary outside of Docker
export POSTGRES_HOST=localhost
# Run import jobs
(cd uwapi-importer && go run .)
(cd mongo-importer && go run . $MONGO_DUMP_PATH)