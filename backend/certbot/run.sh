#!/bin/sh

set -eu

# Less is not acceptable in $CURRENT_YEAR
RSA_KEY_SIZE=4096

CERTBOT_REPO_URL="https://raw.githubusercontent.com/certbot/certbot/master"
CERTBOT_OPTIONS_URL="$CERTBOT_REPO_URL/certbot-nginx/certbot_nginx/tls_configs/options-ssl-nginx.conf"
CERTBOT_DHPARAMS_URL="$CERTBOT_REPO_URL/certbot/ssl-dhparams.pem"
CERTIFICATE_DIR="/etc/letsencrypt/live/$NGINX_HOSTNAME"
CONFIG_DIR="/etc/letsencrypt/conf"

FIRST_RUN=0

# If certificate directory does not exist, then this is a first run.
if ! test -d "$CERTIFICATE_DIR"
then
  mkdir -p "$CERTIFICATE_DIR"
  mkdir -p "$CONFIG_DIR"
  wget "$CERTBOT_OPTIONS_URL" -O "$CONFIG_DIR/options-ssl-nginx.conf"
  wget "$CERTBOT_DHPARAMS_URL" -O "$CONFIG_DIR/ssl-dhparams.pem"
  FIRST_RUN=1
  # We create a self-signed certificate for bootstrapping:
  # nginx will refuse to create an ssl endpoint if no certificate is loaded.
  openssl req \
    -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -sha256 -days 1 \
    -keyout "$CERTIFICATE_DIR/privkey.pem" \
    -out "$CERTIFICATE_DIR/fullchain.pem" \
    -subj "/CN=$NGINX_HOSTNAME"
fi

# Wait for nginx to pick up the certificate
sleep 60s

# Only run certbot if the hostname is actually resolvable.
# Otherwise, Letsencrypt probably cannot reach us either
# and we are hopefully running on localhost.
# In that case, we keep our self-signed certificate.
if ! getent hosts "$NGINX_HOSTNAME"
then
  echo "WARNING: $NGINX_HOSTNAME is not resolvable. Assuming localhost." >&2
  exit 0
fi

# We only need to specify these details once
if test $FIRST_RUN -eq 1
then
  certbot certonly --webroot -w /var/www/cerbot \
    -d "$NGINX_HOSTNAME" --email "$GMAIL_USER" \
    --rsa_key_size $RSA_KEY_SIZE \
    --agree-tos --force-renewal
fi

# Block on cron which will manage renewals
crontab "$(dirname $0)/crontab"
crond -f
