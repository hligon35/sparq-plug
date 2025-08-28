#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

COMMIT=$(git rev-parse --short HEAD || echo "dev")
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
export COMMIT BUILD_TIME

echo "[update] Rebuilding with COMMIT=$COMMIT BUILD_TIME=$BUILD_TIME"
docker compose build --no-cache
echo "[update] Bringing stack up"
docker compose up -d
echo "[update] Done"
\ No newline at end of file
