#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 3 || $1 == -* ]]; then
    echo "Usage: $0 SSH_HOST [LOCAL_PORT=18080] [REMOTE_HASURA_PORT=8080]" >&2
    exit 2
fi

host=$1
local_port=${2:-18080}
remote_port=${3:-8080}
for port in "$local_port" "$remote_port"; do
    if [[ ! $port =~ ^[0-9]{1,5}$ ]] || (( 10#$port < 1 || 10#$port > 65535 )); then
        echo "Ports must be integers between 1 and 65535." >&2
        exit 2
    fi
done

echo "Forwarding http://127.0.0.1:$local_port to Hasura on $host (Ctrl-C to close)."
exec ssh -N -T \
    -o ExitOnForwardFailure=yes \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ControlMaster=no \
    -o ControlPath=none \
    -o StrictHostKeyChecking=yes \
    -L "127.0.0.1:$local_port:127.0.0.1:$remote_port" \
    "$host"
