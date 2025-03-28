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

# Restore backup before starting everything else
$PREFIX docker-compose run --name postgres_bootstrap -d postgres

# Wait for postgres server to settle
while ! $PREFIX docker exec postgres_bootstrap \
  psql -U $POSTGRES_USER $POSTGRES_DB -c 'SELECT TRUE' \
  >/dev/null 2>/dev/null
do
  echo "Waiting for bootstrap server..."
  sleep 10
done

$PREFIX docker exec -i postgres_bootstrap sh -c 'cat > /pg_backup' < $POSTGRES_DUMP_PATH
$PREFIX docker exec -i postgres_bootstrap pg_restore -U $POSTGRES_USER -d $POSTGRES_DB /pg_backup
$PREFIX docker stop postgres_bootstrap
$PREFIX docker-compose down

# Launch all containers
$PREFIX docker-compose up -d
