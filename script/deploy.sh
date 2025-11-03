#!/bin/bash
set -e  # Exit on error

cd ~/uwflow

echo "Pulling latest images for api, email, and uw..."
docker-compose pull api email uw

echo "Restarting api, email, and uw containers..."
docker-compose up -d --no-deps api email uw

echo "Deployment complete!"
echo "Container status:"
docker-compose ps api email uw