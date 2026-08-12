#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "Pulling latest code..."
git pull

if [ ! -f .env ]; then
  echo "No .env found, copying .env.example. Review ports before continuing."
  cp .env.example .env
fi

echo "Bringing down old containers (including any renamed/orphaned ones)..."
docker compose down --remove-orphans

echo "Building and starting..."
docker compose up -d --build

echo "Waiting for healthchecks..."
sleep 5
docker compose ps

echo "Done."