.PHONY: dev prod build down logs

prod:
	docker compose up --build -d

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

build:
	docker compose build

down:
	docker compose down

logs:
	docker compose logs -f
