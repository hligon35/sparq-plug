#!/usr/bin/env bash
# Usage: ./diagnose-gateway.sh [hostname]
set -euo pipefail
HOST="${1:-sparqplug.getsparqd.com}";
BASE="/app";
printf "Checking public origin: https://%s${BASE}/login.html\n" "$HOST";
HTTP=$(curl -sk -o /tmp/resp.$$ -D - "https://$HOST$BASE/login.html" || true)
CODE=$(head -1 /tmp/resp.$$ | awk '{print $2}')
HAS_GATEWAY=$(grep -i '^x-gateway:' /tmp/resp.$$ || true)
MODE=$(grep -i '^x-login-mode:' /tmp/resp.$$ || true)
printf "Status: %s\n" "$CODE"
if [ -n "$HAS_GATEWAY" ]; then
  printf "Gateway header present: %s\n" "$HAS_GATEWAY"
else
  printf "Gateway header MISSING -> traffic not hitting gateway layer.\n"
fi
[ -n "$MODE" ] && printf "Login mode: %s\n" "$MODE"
rm -f /tmp/resp.$$

printf "Local gateway (if accessible) http://localhost:4000${BASE}/login.html\n"
if curl -sI http://localhost:4000$BASE/login.html | grep -qi '^x-gateway:'; then
  echo "Local gateway up."
else
  echo "Local gateway not reachable on 4000.";
fi
