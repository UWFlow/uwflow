#!/bin/sh

VARS='$API_PORT $HASURA_PORT $NGINX_HOST $NGINX_HTTP_PORT $NGINX_HTTPS_PORT'
# Substitute only the variables listed above. Why?
# Nginx uses internal variables of the form $host. They must not be substituted.
envsubst "$VARS" < /nginx.template > /etc/nginx/nginx.conf
# Without 'daemon off;' nginx will fork and let the container exit prematurely.
nginx -g "daemon off;"
