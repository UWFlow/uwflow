.PHONY: help start start-public stop setup db-restore import-course import-vacuum migrate logs clean

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
	@echo "Starting services with public images..."
	$(DOCKER_COMPOSE_PUBLIC) up -d

stop: ## Stop all running services
	@echo "Stopping all services..."
	docker-compose down

setup: ## Initialize database with backup data
	@echo "Setting up database..."
	@if [ -z "$(POSTGRES_DUMP_PATH)" ]; then \
		echo "Error: POSTGRES_DUMP_PATH is not set in .env file"; \
		exit 1; \
	fi
	@if [ ! -f "$(POSTGRES_DUMP_PATH)" ]; then \
		echo "Error: Database dump file not found at $(POSTGRES_DUMP_PATH)"; \
		exit 1; \
	fi
	@echo "Stopping existing containers..."
	docker-compose down --remove-orphans
	@echo "Removing old postgres volume..."
	docker volume rm -f backend_postgres || true
	@echo "Starting postgres container..."
	docker-compose run --name postgres_bootstrap -d postgres
	@echo "Waiting for postgres to be ready..."
	@while ! docker exec postgres_bootstrap \
		psql -U $(POSTGRES_USER) $(POSTGRES_DB) -p $(POSTGRES_PORT) -c 'SELECT TRUE' \
		>/dev/null 2>/dev/null; do \
		echo "Waiting for bootstrap server..."; \
		sleep 5; \
	done
	@echo "Restoring database from backup..."
	docker exec -i postgres_bootstrap sh -c 'cat > /pg_backup' < $(POSTGRES_DUMP_PATH)
	docker exec -i postgres_bootstrap pg_restore -U $(POSTGRES_USER) -d $(POSTGRES_DB) -p $(POSTGRES_PORT) /pg_backup
	@echo "Cleaning up bootstrap container..."
	docker stop postgres_bootstrap
	docker-compose down
	@echo "Database setup complete! Run 'make start' to start services."

db-restore: ## Restore database from backup (without full setup)
	@echo "Restoring database from backup..."
	@if [ -z "$(POSTGRES_DUMP_PATH)" ]; then \
		echo "Error: POSTGRES_DUMP_PATH is not set in .env file"; \
		exit 1; \
	fi
	@if [ ! -f "$(POSTGRES_DUMP_PATH)" ]; then \
		echo "Error: Database dump file not found at $(POSTGRES_DUMP_PATH)"; \
		exit 1; \
	fi
	docker exec -i postgres sh -c 'cat > /pg_backup' < $(POSTGRES_DUMP_PATH)
	docker exec -i postgres pg_restore -U $(POSTGRES_USER) -d $(POSTGRES_DB) -p $(POSTGRES_PORT) /pg_backup
	@echo "Database restore complete!"

import-course: ## Run UW course importer job
	@echo "Running course import job..."
	docker exec uw app/uw courses
	@echo "Course import complete!"

import-vacuum: ## Run UW importer vacuum job
	@echo "Running vacuum job..."
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