#!/bin/sh

set -eu

RUNDIR="$(dirname $0)"
VARS='$API_PORT $DOMAIN $HASURA_PORT $NGINX_HTTP_PORT $NGINX_HTTPS_PORT'

# Substitute only the variables listed above. Why?
# Nginx uses internal variables of the form $host. They must not be substituted.
envsubst "$VARS" < "$RUNDIR/nginx.template" > /etc/nginx/nginx.conf
envsubst "$VARS" < "$RUNDIR/selfsign.template" > "$RUNDIR/selfsign.conf"

# Schedule nginx reload to pick up new certificates
crontab "$RUNDIR/crontab"
# This will fork and allow us to continue
crond

# Without 'daemon off;' nginx will fork and the container will exit prematurely
nginx -g "daemon off;"
