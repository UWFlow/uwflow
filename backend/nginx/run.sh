#!/bin/sh

set -eu

RUNDIR="$(dirname $0)"
VARS='$API_PORT $DOMAIN $HASURA_PORT $NGINX_HTTP_PORT $NGINX_HTTPS_PORT'

for file in "$RUNDIR"/config/*.conf
do
  # Substitute only the variables listed above. Why?
  # Nginx uses internal variables of the form $host. They must not be changed.
  envsubst "$VARS" < "$file" > "/etc/nginx/conf.d/$(basename $file)"
done

# Without 'daemon off;' nginx will fork and the container will exit prematurely
nginx -g "daemon off;"
