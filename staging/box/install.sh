#!/usr/bin/env bash
#
# One-time (and upgrade) install of the staging deploy target. Run on the
# staging box from a checkout of main — never from a PR branch, since what
# this installs runs as root next to the production SSH credentials:
#
#   git clone https://github.com/UWFlow/uwflow ~/uwflow && cd ~/uwflow
#   sudo staging/box/install.sh --github-key ~/github-actions-staging.pub
#
# Re-running is safe: code and compose files are replaced, while existing
# config, secrets, certificates and data are kept.
#
# Options:
#   --github-key FILE  authorize this public key for GitHub Actions, restricted
#                      to the uwflow-staging command (no shell, no forwarding)
#   --user NAME        account that key logs in as (default: $SUDO_USER or ubuntu)
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SRC/../.." && pwd)"
CONF_DIR=/etc/uwflow-staging
SHARE_DIR=/usr/local/share/uwflow-staging
STATE_DIR=/var/lib/uwflow-staging
GITHUB_KEY=""
LOGIN_USER="${SUDO_USER:-ubuntu}"

while [ $# -gt 0 ]; do
  case "$1" in
    --github-key) GITHUB_KEY="${2:?}"; shift 2 ;;
    --user)       LOGIN_USER="${2:?}"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }
command -v docker >/dev/null || { echo "docker is not installed" >&2; exit 1; }
docker compose version >/dev/null || { echo "docker compose v2 is required" >&2; exit 1; }
for tool in curl python3 openssl flock scp; do
  command -v "$tool" >/dev/null || { echo "$tool is required" >&2; exit 1; }
done

branch="$(git -C "$REPO" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
[ "$branch" = main ] || echo "warning: installing from '$branch', not main" >&2

install -d -o root -g root -m 0755 "$SHARE_DIR"
install -d -o root -g root -m 0700 "$CONF_DIR" "$CONF_DIR/ssl"
install -d -o root -g root -m 0750 "$STATE_DIR" "$STATE_DIR/releases" "$STATE_DIR/dumps"

install -o root -g root -m 0755 "$SRC/uwflow-staging" /usr/local/sbin/uwflow-staging
install -o root -g root -m 0755 "$SRC/uwflow-staging-smoke" /usr/local/sbin/uwflow-staging-smoke
# Production's compose file is the base; staging only overrides it.
install -o root -g root -m 0644 "$REPO/docker-compose.yml" "$SHARE_DIR/docker-compose.yml"
install -o root -g root -m 0644 "$SRC/docker-compose.staging.yml" "$SHARE_DIR/docker-compose.staging.yml"

if [ ! -f "$CONF_DIR/staging.conf" ]; then
  install -o root -g root -m 0600 "$SRC/staging.conf.example" "$CONF_DIR/staging.conf"
  echo "created $CONF_DIR/staging.conf"
fi

if [ ! -f "$CONF_DIR/env" ]; then
  umask 077
  sed -e "s/^HASURA_GRAPHQL_ADMIN_SECRET=CHANGE_ME$/HASURA_GRAPHQL_ADMIN_SECRET=$(openssl rand -hex 24)/" \
      -e "s/^HASURA_GRAPHQL_JWT_KEY=CHANGE_ME$/HASURA_GRAPHQL_JWT_KEY=$(openssl rand -hex 32)/" \
      -e "s/^POSTGRES_PASSWORD=CHANGE_ME$/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" \
      "$SRC/env.example" > "$CONF_DIR/env"
  chmod 0600 "$CONF_DIR/env"
  echo "created $CONF_DIR/env with fresh secrets; set DOMAIN to staging's hostname"
fi

if [ ! -f "$CONF_DIR/ssl/crt.pem" ]; then
  domain="$(sed -n 's/^DOMAIN=//p' "$CONF_DIR/env" | tail -n1)"
  # Cloudflare terminates public TLS; this only secures tunnel -> nginx.
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 -subj "/CN=$domain" \
    -keyout "$CONF_DIR/ssl/key.pem" -out "$CONF_DIR/ssl/crt.pem" 2>/dev/null
  echo "created a self-signed certificate for $domain"
fi
# Compose (as root) reads env and bind-mounts ssl through each release's
# .env/.ssl symlinks, so nothing here needs to be readable by other users.

if [ ! -f "$CONF_DIR/prod_ssh_config" ]; then
  cat > "$CONF_DIR/prod_ssh_config" <<'EOF'
# SSH config root uses to copy production dumps. Fill in HostName/User and
# put the private key and a verified host key alongside this file.
Host uwflow-prod
  HostName CHANGE_ME
  User ec2-user
  IdentityFile /etc/uwflow-staging/prod_ssh_key
  IdentitiesOnly yes
  UserKnownHostsFile /etc/uwflow-staging/prod_known_hosts
  StrictHostKeyChecking yes
EOF
  chmod 0600 "$CONF_DIR/prod_ssh_config"
  echo "created $CONF_DIR/prod_ssh_config; fill it in (see staging/box/README.md)"
fi

if [ -n "$GITHUB_KEY" ]; then
  key="$(tr -d '\r' < "$GITHUB_KEY" | head -n1)"
  [[ "$key" =~ ^ssh-(ed25519|rsa)\ [A-Za-z0-9+/=]+ ]] || { echo "$GITHUB_KEY is not an SSH public key" >&2; exit 1; }
  home="$(getent passwd "$LOGIN_USER" | cut -d: -f6)"
  auth="$home/.ssh/authorized_keys"
  line="restrict,command=\"sudo -n /usr/local/sbin/uwflow-staging \\\"\$SSH_ORIGINAL_COMMAND\\\"\" $key"
  material="$(awk '{print $2}' <<<"$key")"
  if grep -qF "$material" "$auth" 2>/dev/null; then
    echo "GitHub key already in $auth (left unchanged)"
  else
    printf '%s\n' "$line" >> "$auth"
    chown "$LOGIN_USER:" "$auth"
    chmod 0600 "$auth"
    echo "authorized the GitHub key for $LOGIN_USER, restricted to uwflow-staging"
  fi
  # The forced command runs sudo non-interactively.
  sudo -n -u "$LOGIN_USER" sudo -n true 2>/dev/null \
    || echo "warning: $LOGIN_USER needs passwordless sudo for /usr/local/sbin/uwflow-staging" >&2
fi

echo "installed uwflow-staging"
