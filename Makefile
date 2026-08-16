up:
	docker compose up -d --build --force-recreate --remove-orphans

down:
	docker compose down

run_ui:
	cd ui && pnpm run dev || cd -

# Dumps the Postgres database (all Pentaract metadata: users, storages,
# file paths, and chunk->Telegram-message-id mappings) to backups/.
# This is your safety net against `docker compose down -v`, an accidental
# volume deletion, or anything else that wipes pentaract-db-volume.
#
# Uses `docker compose exec` against the `db` service (not a hardcoded
# container name) so this keeps working even if container_name changes
# or you're running multiple compose projects side by side.
#
# Requires .env (for DATABASE_USER / DATABASE_NAME) and the db service
# to be running.
backup:
	@set -a && . ./.env && set +a && \
	mkdir -p backups && \
	timestamp=$$(date +%Y%m%d-%H%M%S) && \
	docker compose exec -T db pg_dump -U $$DATABASE_USER $$DATABASE_NAME \
		> backups/pentaract-$$timestamp.sql && \
	echo "Backup written to backups/pentaract-$$timestamp.sql"

# Restores a backup produced by `make backup` into the running db service.
# Usage: make restore FILE=backups/pentaract-20240101-120000.sql
# WARNING: this overwrites existing data for tables in the dump.
restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=backups/pentaract-<timestamp>.sql"; \
		exit 1; \
	fi
	@set -a && . ./.env && set +a && \
	docker compose exec -T db psql -U $$DATABASE_USER $$DATABASE_NAME < $(FILE) && \
	echo "Restored from $(FILE)"
