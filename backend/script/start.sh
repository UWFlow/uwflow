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

docker exec -it uw /app/uw terms

docker run --rm -it \
  --network backend_default \
  --env-file "$BACKEND_DIR/.env" -e MONGO_DUMP_PATH=/dump \
  -v "$MONGO_DUMP_PATH":/dump:ro \
  neuwflow/mongo /app/mongo

docker exec -it uw /app/uw sections
docker exec -it uw /app/uw exams
