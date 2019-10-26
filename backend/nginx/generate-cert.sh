#!/bin/sh

set -eu

# Certbot maintains best-practices ssl parameter configs.
# We should probably use them instead of trying to be smart with crypto.
CERTBOT_REPO="https://raw.githubusercontent.com/certbot/certbot/master"
CERTBOT_TLS_DIR="$CERTBOT_REPO/certbot-nginx/certbot_nginx/tls_configs"
CERTBOT_TLS_FILE="options-ssl-nginx.conf"
CERTBOT_DH_DIR="$CERTBOT_REPO/certbot"
CERTBOT_DH_FILE="ssl-dhparams.conf"

ROOT_DIR="/etc/letsencrypt"
CERTIFICATE_DIR="$ROOT_DIR/certificates/$NGINX_HOSTNAME"
CONFIG_DIR="$ROOT_DIR/config"

mkdir -p "$CERTIFICATE_DIR" "$CONFIG_DIR"

wget "$CERTBOT_TLS_DIR/$CERTBOT_TLS_FILE" -O "$CONFIG_DIR/$CERTBOT_TLS_FILE"
wget "$CERTBOT_DH_DIR/$CERTBOT_DH_FILE" -O "$CONFIG_DIR/$CERTBOT_DH_FILE"

# We create a self-signed certificate for bootstrapping:
# nginx will refuse to create an ssl endpoint if no certificate is loaded.

# If P-256 is good enough for the NSA, it's good enough for us
openssl ecparam -name prime256v1 -genkey -out "$CERTIFICATE_DIR/$DOMAIN.key"
openssl req -new -x509 -sha256 \
  -key "$CERTIFICATE_DIR/$DOMAIN.key" \
  -out "$CERTIFICATE_DIR/$DOMAIN.crt" \
  -config "$RUNDIR/selfsign.conf"

# Now try 
lego --key-type ec256 --accept-tos \
  --email $GMAIL_USER \
  --domains "$DOMAIN" --domains "www.$DOMAIN" \
  --webroot /var/www/letsencrypt \
  --path /etc/letsencrypt \
  run
