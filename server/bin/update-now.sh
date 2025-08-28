#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT=${REPO_ROOT:-/opt/sparqplug/server}
echo "[update-now] Using REPO_ROOT=$REPO_ROOT"
cd "$REPO_ROOT"
exec bash bin/update.sh
