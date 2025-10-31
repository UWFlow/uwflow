#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

# Bring backend environment variables into this script's scope
cd "$BACKEND_DIR"
export $(cat .env | xargs)

echo "============================================"
echo "Adding dummy professor data"
echo "============================================"

# Create SQL import script with dummy data
IMPORT_SQL=$(mktemp)

cat > "$IMPORT_SQL" <<'SQL'
-- Insert 10 dummy professors
INSERT INTO prof (code, name) VALUES
  ('john_smith', 'John Smith'),
  ('jane_doe', 'Jane Doe'),
  ('alice_johnson', 'Alice Johnson'),
  ('bob_williams', 'Bob Williams'),
  ('carol_brown', 'Carol Brown'),
  ('david_jones', 'David Jones'),
  ('emma_davis', 'Emma Davis'),
  ('frank_miller', 'Frank Miller'),
  ('grace_wilson', 'Grace Wilson'),
  ('henry_moore', 'Henry Moore')
ON CONFLICT (code) DO NOTHING;
SQL

echo "Importing dummy professor data into database..."

# Import into database
if $PREFIX docker exec -i postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT < "$IMPORT_SQL"; then
  # Count imported profs
  PROF_COUNT=$($PREFIX docker exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT -t -c "SELECT COUNT(*) FROM prof;")

  echo "============================================"
  echo "Import complete!"
  echo "Total professors in database: $PROF_COUNT"
  echo "============================================"
else
  echo "Error: Failed to import data into database"
  rm -f "$IMPORT_SQL"
  exit 1
fi

# Cleanup
rm -f "$IMPORT_SQL"