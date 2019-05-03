#!/bin/sh

# Bail on first error
set -e

# Run migrations
alembic upgrade head

# Run server
gunicorn flow.main:api \
  --bind $API_HOST:$API_PORT \
  --log-level $LOG_LEVEL \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers $GUNICORN_WORKERS
