#!/bin/bash
set -e  # Exit on error

cd ~/uwflow

# Detect which docker compose command is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' found!"
    exit 1
fi

echo "Using: $DOCKER_COMPOSE"

echo "Pulling latest images for backend services"
$DOCKER_COMPOSE pull api email uw hasura postgres

echo "Restarting backend containers"
$DOCKER_COMPOSE down api email uw hasura postgres
$DOCKER_COMPOSE up -d api email uw hasura postgres

echo "Deployment complete!"
echo "Container status:"
$DOCKER_COMPOSE ps api email uw hasura postgres