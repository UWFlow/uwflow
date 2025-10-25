.PHONY: help start start-public stop setup setup-contrib db-restore import-course import-vacuum migrate test build-test docker-build-test logs clean

# Load environment variables
include .env
export

# Docker compose command with proper file configuration
DOCKER_COMPOSE := docker-compose -f docker-compose.yml -f docker-compose.dev.yml
DOCKER_COMPOSE_PUBLIC := docker-compose -f docker-compose.yml

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start: ## Start all backend services in development mode (without frontend)
	@echo "Starting backend services in development mode..."
	$(DOCKER_COMPOSE) up -d api postgres hasura uw email

start-public: ## Start all services using public images
	@echo "Pulling latest images..."
	$(DOCKER_COMPOSE_PUBLIC) pull
	@echo "Starting services with public images..."
	$(DOCKER_COMPOSE_PUBLIC) up -d

stop: ## Stop all running services
	@echo "Stopping all services..."
	docker-compose down

setup: ## Initialize database with backup data (maintainers)
	@echo "Starting setup..."
	@bash script/start.sh
	@echo "Setup complete! Run 'make start' to start services."

setup-contrib: ## Initialize database from scratch using migrations and UW API (contributors)
	@echo "Starting contributor setup..."
	@bash script/setup-contrib.sh

import-course: ## Run UW course importer job (rebuilds importer service)
	@echo "Rebuilding and running course import job..."
	$(DOCKER_COMPOSE) up -d --build uw
	docker exec uw /app/uw hourly
	@echo "Course import complete!"

import-vacuum: ## Run UW importer vacuum job (rebuilds importer service)
	@echo "Rebuilding and running vacuum job..."
	$(DOCKER_COMPOSE) up -d --build uw
	docker exec uw /app/uw vacuum
	@echo "Vacuum complete!"

migrate: ## Apply Hasura migrations
	@echo "Applying Hasura migrations..."
	@if ! command -v hasura >/dev/null 2>&1; then \
		echo "Error: hasura CLI not found. Please install it first."; \
		echo "Visit: https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/"; \
		exit 1; \
	fi
	cd hasura && hasura migrate apply --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET) --endpoint http://localhost:$(HASURA_PORT)
	cd hasura && hasura metadata apply --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET) --endpoint http://localhost:$(HASURA_PORT)
	@echo "Migrations applied!"

migrate-status: ## Check Hasura migration status
	@echo "Checking migration status..."
	cd hasura && hasura migrate status --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET) --endpoint http://localhost:$(HASURA_PORT)

test: ## Run Go tests
	@echo "Running Go tests..."
	cd flow && go test ./...
	@echo "Tests complete!"

build-test: ## Test Go build compilation
	@echo "Testing Go build..."
	cd flow && go build ./...
	@echo "Build test complete!"

docker-build-test: ## Dry run Docker Compose build
	@echo "Testing Docker build (dry run)..."
	$(DOCKER_COMPOSE) build --dry-run
	@echo "Docker build test complete!"

logs: ## Tail logs from all services
	docker-compose logs -f

logs-api: ## Tail logs from API service
	docker logs -f api

logs-hasura: ## Tail logs from Hasura service
	docker logs -f hasura

logs-uw: ## Tail logs from UW importer service
	docker logs -f uw

logs-email: ## Tail logs from email service
	docker logs -f email

clean: ## Remove all containers, volumes, and reset environment
	@echo "Cleaning up..."
	docker-compose down --remove-orphans --volumes
	@echo "Clean complete!"

ps: ## Show status of all services
	docker-compose ps