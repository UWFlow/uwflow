#!/bin/sh

DIR="$(dirname $(realpath $0))"
. "$DIR/common.sh"

SSL_DIR="$BACKEND_DIR/.ssl"

if test -d "$SSL_DIR"
then
  pass "SSL certificate already exists, skipping"
  exit 0
else
  mkdir "$SSL_DIR"
fi

# If P-256 is good enough for the NSA, it's good enough for us
openssl ecparam -name prime256v1 -genkey -out "$SSL_DIR/key.pem"
openssl req -new -x509 -sha256 \
  -key "$SSL_DIR/key.pem" -out "$SSL_DIR/crt.pem" -subj "/CN=$DOMAIN"

pass "Self-signed SSL certificate created"
