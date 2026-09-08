#!/usr/bin/env bash
# Keep the secret out of traces, even when invoked with bash -x.
set +x
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 || $1 == -* ]]; then
    echo "Usage: $0 SSH_HOST [CONSOLE_PORT=9695]" >&2
    exit 2
fi
host=$1
console_port=${2:-9695}
if [[ ! $console_port =~ ^[0-9]{1,5}$ ]] || (( 10#$console_port < 1024 || 10#$console_port > 65533 )); then
    echo "Console port must be an integer between 1024 and 65533." >&2
    exit 2
fi
console_port=$((10#$console_port))
# Reserve adjacent loopback ports for the CLI migration API and engine tunnel.
api_port=$((console_port + 1))
engine_port=$((console_port + 2))
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../hasura" && pwd)"
for dependency in ssh hasura curl; do
    if ! command -v "$dependency" >/dev/null 2>&1; then
        echo "Required command not found: $dependency" >&2
        exit 1
    fi
done

# Always prompt for production credentials; do not silently use a local .env.
read -r -s -p 'Production Hasura admin secret: ' admin_secret || exit 1
printf '\n'
if [[ -z $admin_secret ]]; then
    echo "The production admin secret cannot be empty." >&2
    exit 1
fi

# A private control socket lets cleanup close only this script's SSH connection.
tunnel_dir=$(mktemp -d "${TMPDIR:-/tmp}/uwflow-hasura.XXXXXX")
console_pid=
cleanup() {
    if [[ -n $console_pid ]]; then
        kill "$console_pid" 2>/dev/null || true
        wait "$console_pid" 2>/dev/null || true
    fi
    ssh -S "$tunnel_dir/socket" -O exit "$host" >/dev/null 2>&1 || true
    rm -rf "$tunnel_dir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
ssh -M -S "$tunnel_dir/socket" -f -N -T \
    -o ExitOnForwardFailure=yes \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ControlPersist=no \
    -o StrictHostKeyChecking=yes \
    -L "127.0.0.1:$engine_port:127.0.0.1:8080" \
    "$host"

# -f returns after SSH establishes the forward. Check the remote engine too.
if ! curl --noproxy '*' --fail --silent --show-error --max-time 10 \
    "http://127.0.0.1:$engine_port/healthz" >/dev/null; then
    echo "Cannot reach production Hasura on the server's port 8080." >&2
    exit 1
fi

echo "Starting production Hasura Console at http://127.0.0.1:$console_port"
echo "Console edits affect production immediately. Ctrl-C closes the Console and tunnel."
HASURA_GRAPHQL_ADMIN_SECRET="$admin_secret" hasura --project "$project_dir" console \
    --endpoint "http://127.0.0.1:$engine_port" \
    --console-hge-endpoint "http://127.0.0.1:$engine_port" \
    --address 127.0.0.1 \
    --console-port "$console_port" \
    --api-host http://127.0.0.1 \
    --api-port "$api_port" \
    --no-browser &
console_pid=$!
wait "$console_pid"
