#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-4000}
HOST=${HOST:-localhost}
PATH_READY=${PATH_READY:-/ready}
TIMEOUT=${TIMEOUT:-30}
SLEEP=${SLEEP:-1}
START=$(date +%s)

URL="http://${HOST}:${PORT}${PATH_READY}"

while true; do
  if OUT=$(curl -sf --max-time 2 "$URL" 2>/dev/null); then
    OK=$(echo "$OUT" | grep -o '"ok":true' || true)
    if [[ -n "$OK" ]]; then
      echo "READY: $OUT"
      exit 0
    fi
    echo "Probe returned but not ready: $OUT" >&2
  else
    echo "No response yet from $URL" >&2
  fi
  NOW=$(date +%s)
  if (( NOW - START >= TIMEOUT )); then
    echo "ERROR: Timeout waiting for readiness at $URL" >&2
    exit 1
  fi
  sleep $SLEEP
done
