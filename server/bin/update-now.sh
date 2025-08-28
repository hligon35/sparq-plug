#!/usr/bin/env bash
set -euo pipefail

# Trigger an immediate stack update from anywhere.
# Uses the same REPO_ROOT convention as update.sh.

REPO_ROOT=${REPO_ROOT:-/opt/sparqplug/server}
echo "[update-now] Using REPO_ROOT=$REPO_ROOT"

if [ ! -d "$REPO_ROOT" ]; then
  echo "[update-now] ERROR: REPO_ROOT does not exist: $REPO_ROOT" >&2
  exit 1
fi

cd "$REPO_ROOT"
if [ ! -f bin/update.sh ]; then
  echo "[update-now] ERROR: bin/update.sh not found." >&2
  exit 1
fi

exec bash bin/update.sh
