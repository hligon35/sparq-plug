#!/usr/bin/env bash
set -euo pipefail

# Start the gateway with sensible defaults and pre-flight checks.
# Usage: ./scripts/start-gateway.sh [--detach]

DETACH=0
if [[ "${1:-}" == "--detach" ]]; then
  DETACH=1
fi

APP_URL=${APP_URL:-http://localhost:3000}
APP_BASE_PATH=${APP_BASE_PATH:-/app}
PORT=${PORT:-4000}
START_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
GATEWAY_FILE="${START_DIR}/gateway/server.js"

if [[ ! -f "$GATEWAY_FILE" ]]; then
  echo "Gateway server.js not found at $GATEWAY_FILE" >&2
  exit 1
fi

# Pre-flight: ensure upstream responds (HEAD /app/api/healthz) with short retries
UP_HEALTH="${APP_URL}${APP_BASE_PATH}/api/healthz"
TRIES=10
SLEEP=1
UP_OK=0
for i in $(seq 1 $TRIES); do
  if curl -sf --max-time 2 "$UP_HEALTH" > /dev/null; then
    UP_OK=1; break
  fi
  sleep $SLEEP
done
if [[ $UP_OK -eq 0 ]]; then
  echo "WARNING: Upstream $UP_HEALTH not responding; continuing anyway" >&2
fi

# If REDIS_URL is set, attempt a single TCP connect (best-effort)
if [[ -n "${REDIS_URL:-}" ]]; then
  echo "Redis configured (REDIS_URL set). Gateway will report redisConnected in /ready once live." >&2
fi

export APP_URL APP_BASE_PATH PORT
cd "$START_DIR/gateway"
CMD=(node server.js)

if [[ $DETACH -eq 1 ]]; then
  nohup "${CMD[@]}" > ../gateway.out.log 2> ../gateway.err.log &
  echo $! > ../gateway.pid
  echo "Gateway started (PID $(cat ../gateway.pid)) on port $PORT -> upstream $APP_URL"
else
  echo "Starting gateway on port $PORT proxying $APP_URL (basePath=$APP_BASE_PATH)"
  exec "${CMD[@]}"
fi
