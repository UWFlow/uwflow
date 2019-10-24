#!/bin/sh

set -eu

DIR="$(dirname $0)"
VARS='$API_PORT $HASURA_PORT $NGINX_HOSTNAME $NGINX_HTTP_PORT $NGINX_HTTPS_PORT'

# Substitute only the variables listed above. Why?
# Nginx uses internal variables of the form $host. They must not be substituted.
envsubst "$VARS" < "$DIR/nginx.template" > /etc/nginx/nginx.conf

# Schedule nginx reload to pick up new certificates
crontab "$DIR/crontab"
# This will fork and allow us to continue
crond

# Without 'daemon off;' nginx will fork and the container will exit prematurely
nginx -g "daemon off;"
