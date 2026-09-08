#!/bin/bash
#
# Mint a UW Flow session token for an arbitrary user, so you can look at the
# site exactly as they see it.
#
# The backend hands out a JWT at login (flow/api/serde/jwt.go) and the frontend
# keeps it in localStorage under 'token', alongside 'user_id'. Nothing about
# that token is tied to *how* you logged in — it is just an HS256 signature
# over the Hasura claims, keyed by HASURA_GRAPHQL_JWT_KEY. So if you hold the
# key, you can sign one yourself, and both the API and Hasura will accept it.
#
# That is all this script does: look the user up over a direct psql connection
# using the credentials in .env, then sign the same claims the Go code signs.
# There is no impersonation endpoint involved and nothing is written to the
# database — a token minted here is indistinguishable from one the user got by
# logging in, which is also why this only ever belongs on a dev box.
#
# Usage:
#   script/impersonate.sh                       # list everyone, filter interactively (fzf)
#   script/impersonate.sh 4021                  # by user id
#   script/impersonate.sh someone@uwaterloo.ca  # by email
#   script/impersonate.sh "Sandy Wu"            # by name (substring, case-insensitive)
#   script/impersonate.sh -i sandy              # open the picker pre-filtered to "sandy"
#
# With no user given (or with -i), the whole user table is listed through fzf so
# you can type to narrow it down and hit Enter on the one you want. Any argument
# passed alongside -i seeds the filter box. Everything below the picker is the
# same whether you land on a user by typing an id or by choosing one here.
#
# Options:
#   -i, --interactive    pick from the full user list with fzf (the default when
#                        no user is given); any argument seeds the filter
#   -e, --env-file PATH  env file to read secrets from (default: <repo>/.env)
#   -t, --ttl SECONDS    token lifetime (default: 86400, matching the backend)
#   -o, --origin URL     origin the snippet targets (default: http://localhost)
#   -c, --copy           copy the browser snippet to the clipboard
#       --token-only     print just the JWT (for curl/Authorization headers)
#       --json           print {"user_id":…,"token":…,"expires_at":…}
#   -h, --help           this message
#
# pipefail is what makes the openssl pipelines below trustworthy: a signature
# stage that dies mid-pipe would otherwise still hand back a plausible-looking
# (and completely invalid) token.
set -euo pipefail

DIR="$(dirname "$(realpath "$0")")"
. "$DIR/common.sh"

ENV_FILE="$BACKEND_DIR/.env"
TTL=86400
ORIGIN="http://localhost"
OUTPUT=human
COPY=0
PICK=0
TARGET=""

usage() {
  sed -n '2,/^set -euo/p' "$(realpath "$0")" | sed -e 's/^# \{0,1\}//' -e '$d'
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case "$1" in
    -i|--interactive|--pick) PICK=1; shift ;;
    -e|--env-file) ENV_FILE="${2:-}"; shift 2 ;;
    -t|--ttl)      TTL="${2:-}"; shift 2 ;;
    -o|--origin)   ORIGIN="${2:-}"; shift 2 ;;
    -c|--copy)     COPY=1; shift ;;
    --token-only)  OUTPUT=token; shift ;;
    --json)        OUTPUT=json; shift ;;
    -h|--help)     usage 0 ;;
    --)            shift; TARGET="${1:-}"; break ;;
    -*)            fail "Unknown option: $1 (try --help)" ;;
    *)
      [ -z "$TARGET" ] || fail "Expected a single user to impersonate, got '$TARGET' and '$1'"
      TARGET="$1"; shift ;;
  esac
done

# No user named means "let me pick one" rather than an error — the picker is
# the friendlier default now that it exists. -i forces the picker even when a
# user is named, treating that argument as a starting filter.
[ -n "$TARGET" ] || PICK=1

[ -f "$ENV_FILE" ] || fail "No env file at $ENV_FILE (pass --env-file; a fresh worktree has no .env)"
case "$TTL" in
  ''|*[!0-9]*) fail "--ttl must be a whole number of seconds, got '$TTL'" ;;
esac

# Read one key out of the env file rather than `export $(grep ... | xargs)`.
# The exporting trick is used elsewhere in script/, but it would drag the whole
# file — SMTP passwords, the Sentry DSN, the UW API key — into the environment
# of every command below, including `docker exec`. We need four values; take
# exactly those four. Last assignment wins, matching how a shell would source it.
env_get() {
  sed -n "s/^[[:space:]]*$1=//p" "$ENV_FILE" \
    | tail -n1 \
    | sed -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'\$/\1/"
}

JWT_KEY="$(env_get HASURA_GRAPHQL_JWT_KEY)"
PG_USER="$(env_get POSTGRES_USER)"
PG_DB="$(env_get POSTGRES_DB)"
PG_PORT="$(env_get POSTGRES_PORT)"
PG_PASSWORD="$(env_get POSTGRES_PASSWORD)"
PG_HOST="$(env_get POSTGRES_HOST)"

[ -n "$JWT_KEY" ] || fail "HASURA_GRAPHQL_JWT_KEY is not set in $ENV_FILE"
[ -n "$PG_USER" ] && [ -n "$PG_DB" ] && [ -n "$PG_PORT" ] \
  || fail "POSTGRES_USER/POSTGRES_DB/POSTGRES_PORT must all be set in $ENV_FILE"

# Two ways to reach the database, in preference order:
#
#   1. A psql on this machine. POSTGRES_HOST in .env is the compose service
#      name ('postgres'), which only resolves inside the compose network — but
#      docker-compose.yml publishes the port, so from the host the same server
#      is at 127.0.0.1. Rewrite it; leave any other host (a real staging box)
#      alone.
#   2. psql inside the container. The host often has no postgres client
#      installed at all — script/backup-local.sh already assumes as much — and
#      this way the client always matches the server.
PG_CONTAINER="${PG_CONTAINER:-postgres}"
if command -v psql >/dev/null 2>&1; then
  case "$PG_HOST" in
    postgres|'') PG_HOST=127.0.0.1 ;;
  esac
  psql_do() {
    PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" \
      -qtAF'|' -v ON_ERROR_STOP=1 -c "$1"
  }
  VIA="psql → $PG_HOST:$PG_PORT/$PG_DB"
else
  $PREFIX docker inspect "$PG_CONTAINER" >/dev/null 2>&1 \
    || fail "No psql on this machine and no '$PG_CONTAINER' container running — start the stack, or install a postgres client"
  psql_do() {
    # -i but never -t: a TTY would add carriage returns to the field output.
    $PREFIX docker exec -i -e PGPASSWORD="$PG_PASSWORD" "$PG_CONTAINER" \
      psql -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" \
      -qtAF'|' -v ON_ERROR_STOP=1 -c "$1"
  }
  VIA="docker exec $PG_CONTAINER psql → $PG_DB"
fi

# --- Interactive picker -------------------------------------------------
#
# Stream the whole user table (~80k rows) into fzf and let the human filter it
# by typing. fzf does the matching against every visible column at once — id,
# name, email, join source — so "sandy gmail" or "4021" both land. Whatever row
# is highlighted on Enter, we read its id off the front and hand it back to the
# same id-lookup path below, so the token-signing logic stays in one place.
pick_user() {
  command -v fzf >/dev/null 2>&1 \
    || fail "Interactive pick needs fzf (brew install fzf); or name a user by id/email/name"
  # Test the controlling terminal, not stdout: this function runs inside a
  # $(...) capture, so fd 1 is a pipe even in a real terminal. fzf draws its UI
  # on /dev/tty regardless of where stdout goes, so /dev/tty is what has to
  # exist. (This is also what correctly rejects non-interactive runners.)
  { : >/dev/tty; } 2>/dev/null \
    || fail "Interactive pick needs a terminal; name a user by id/email/name instead"

  local chosen
  # ON_ERROR_STOP won't survive the pipe (fzf's exit status is what $? sees), so
  # guard the empty result afterwards rather than trusting the pipeline status.
  # fzf reads the candidate list from the pipe on stdin and takes keystrokes
  # from /dev/tty on its own; only the picked line comes back out on stdout.
  chosen="$(
    psql_do "
      SELECT id, full_name, coalesce(email, '<no email>'), join_source, join_date::date
      FROM \"user\"
      ORDER BY id
    " \
    | awk -F'|' '{ printf "%-8s %-30s %-34s %-9s %s\n", $1, $2, $3, $4, $5 }' \
    | fzf --reverse --height='80%' --min-height=15 \
          --prompt='impersonate ▸ ' \
          --query="$1" \
          --header='type to filter · enter to pick · esc to cancel' \
    | awk '{ print $1 }'
  )"

  [ -n "$chosen" ] || fail "No user picked"
  printf '%s' "$chosen"
}

if [ "$PICK" -eq 1 ]; then
  # A named user (impersonate -i sandy) seeds the filter box; TARGET is then
  # replaced by the chosen id and flows into the id branch below unchanged.
  TARGET="$(pick_user "$TARGET")"
fi

# Everything interpolated below is a literal in the SQL text, so double the
# quotes. This is a dev tool run by the person who already holds the database
# password, but a name like O'Brien would otherwise be a syntax error long
# before it was a security question.
sql_quote() { printf "%s" "$1" | sed "s/'/''/g"; }
QUOTED="$(sql_quote "$TARGET")"

# How to interpret the argument: a bare number is an id, anything with an @ is
# an email, everything else is a name to search for. Emails are matched exactly
# (you know the address you typed); names are matched loosely, since the point
# of a name lookup is that you only half-remember it.
case "$TARGET" in
  *[!0-9]*)
    case "$TARGET" in
      *@*) WHERE="lower(email) = lower('$QUOTED')"; KIND="email" ;;
        *) WHERE="full_name ILIKE '%$QUOTED%'";     KIND="name"  ;;
    esac ;;
  *) WHERE="id = $TARGET"; KIND="id" ;;
esac

# LIMIT 6 so an over-broad name search can report "and more" without dumping
# the user table to the terminal.
ROWS="$(psql_do "
  SELECT id, coalesce(email, '<no email>'), full_name, join_source, join_date::date
  FROM \"user\"
  WHERE $WHERE
  ORDER BY id
  LIMIT 6
")"

[ -n "$ROWS" ] || fail "No user matches that $KIND ($TARGET)"

if [ "$(printf '%s\n' "$ROWS" | wc -l)" -gt 1 ]; then
  warn "That $KIND matches more than one user; re-run with the id you want:"
  printf '%s\n' "$ROWS" | awk -F'|' '{ printf "      %-7s %-32s %s\n", $1, $3, $2 }' >&2
  fail "Ambiguous user"
fi

IFS='|' read -r USER_ID USER_EMAIL USER_NAME JOIN_SOURCE JOIN_DATE <<< "$ROWS"

# --- Sign the token -----------------------------------------------------
#
# Byte-for-byte the claims from serde.NewSignedJwt: the Hasura namespace with a
# single 'user' role, plus iat/nbf/exp. env.Environment types JwtKey as []byte
# straight from the environment string — the value is hex-looking, but it is
# never hex-decoded, so the HMAC key here is the literal characters.
b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

NOW="$(date +%s)"
EXP=$((NOW + TTL))

HEADER='{"alg":"HS256","typ":"JWT"}'
PAYLOAD="$(printf '{"https://hasura.io/jwt/claims":{"x-hasura-allowed-roles":["user"],"x-hasura-default-role":"user","x-hasura-user-id":"%s"},"iat":%s,"nbf":%s,"exp":%s}' \
  "$USER_ID" "$NOW" "$NOW" "$EXP")"

SIGNING_INPUT="$(printf '%s' "$HEADER" | b64url).$(printf '%s' "$PAYLOAD" | b64url)"
SIGNATURE="$(printf '%s' "$SIGNING_INPUT" | openssl dgst -sha256 -hmac "$JWT_KEY" -binary | b64url)"
TOKEN="$SIGNING_INPUT.$SIGNATURE"

# --- Output -------------------------------------------------------------

# The frontend reads both keys on every render (src/utils/Auth.tsx), so set
# them together and reload rather than leaving the page half-swapped.
SNIPPET="localStorage.setItem('token','$TOKEN');localStorage.setItem('user_id','$USER_ID');location.reload()"

case "$OUTPUT" in
  token)
    printf '%s\n' "$TOKEN"
    exit 0 ;;
  json)
    printf '{"user_id":%s,"token":"%s","expires_at":%s}\n' "$USER_ID" "$TOKEN" "$EXP"
    exit 0 ;;
esac

if [ "$COPY" -eq 1 ]; then
  if command -v pbcopy >/dev/null 2>&1; then
    printf '%s' "$SNIPPET" | pbcopy
  elif command -v xclip >/dev/null 2>&1; then
    printf '%s' "$SNIPPET" | xclip -selection clipboard
  else
    warn "No pbcopy or xclip on PATH; printing the snippet instead of copying"
    COPY=0
  fi
fi

pass "Impersonating $USER_NAME (#$USER_ID)"
cat >&2 <<EOF
      email       $USER_EMAIL
      joined      $JOIN_DATE via $JOIN_SOURCE
      looked up   $VIA
      expires     $(date -r "$EXP" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d "@$EXP" '+%Y-%m-%d %H:%M:%S')

  Open $ORIGIN, then paste this into the browser console:
EOF

if [ "$COPY" -eq 1 ]; then
  echo "  (copied to your clipboard)" >&2
else
  echo >&2
  echo "$SNIPPET"
  echo >&2
fi

cat >&2 <<'EOF'
  Sign out normally to drop back to your own account, or:
    localStorage.removeItem('token');localStorage.removeItem('user_id');location.reload()
EOF
