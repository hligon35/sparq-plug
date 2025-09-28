#!/usr/bin/env bash
set -euo pipefail

# deploy-systemd.sh
# Idempotent deployment script for the SparQ Plug application when running under systemd (no Docker).
# Steps:
# 1. Sync repo to remote branch (default: server)
# 2. Install dependencies (npm ci) if lockfile changed or node_modules missing
# 3. Build Next.js
# 4. Restart systemd units (sparqplug-next, sparqplug-gateway)
# 5. Run basic health checks and emit status

BRANCH="${DEPLOY_BRANCH:-server}"
REPO_DIR="${REPO_DIR:-$(cd -- "$(dirname -- "$0")/.." && pwd)}"
NODE_BIN="${NODE_BIN:-node}" # override if needed
NPM_BIN="${NPM_BIN:-npm}"   # override if needed
NEXT_SERVICE="${NEXT_SERVICE:-sparqplug-next}"
GATEWAY_SERVICE="${GATEWAY_SERVICE:-sparqplug-gateway}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/healthz}"

log() { echo "[deploy] $*"; }
warn() { echo "[deploy][warn] $*" >&2; }
fail() { echo "[deploy][error] $*" >&2; exit 1; }

log "Starting deployment in $REPO_DIR (branch: $BRANCH)"
cd "$REPO_DIR"

# Ensure git safe directory for root / timers
git config --global --add safe.directory "$REPO_DIR" || true

if ! command -v git >/dev/null 2>&1; then
  fail "git not installed"
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo detached)
log "Current branch: $CURRENT_BRANCH"

log "Fetching origin/$BRANCH"
git fetch origin "$BRANCH" --prune

REMOTE_HASH=$(git rev-parse "origin/$BRANCH")
LOCAL_HASH=$(git rev-parse HEAD)

if [ "$REMOTE_HASH" != "$LOCAL_HASH" ]; then
  log "Updating working tree to origin/$BRANCH"
  # Use reset for reproducibility (avoid drift from uncommitted hotfixes)
  git reset --hard "origin/$BRANCH"
else
  log "Already at latest commit ($LOCAL_HASH)"
fi

# Optional: detect nvm and load if present for consistent Node version
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh" || true
  if [ -f .nvmrc ]; then
    nvm install >/dev/null 2>&1 || true
    nvm use >/dev/null 2>&1 || true
  fi
fi

log "Node version: $(node -v 2>/dev/null || echo missing)"
log "NPM  version: $(npm -v 2>/dev/null || echo missing)"

if [ ! -f package-lock.json ]; then
  fail "package-lock.json missing; refusing to deploy without lockfile"
fi

# Quick heuristic: run npm ci if node_modules missing OR lockfile newer than a stamp
STAMP=".deploy/npm.stamp"
NEED_INSTALL=0
if [ ! -d node_modules ]; then
  NEED_INSTALL=1
elif [ ! -f "$STAMP" ]; then
  NEED_INSTALL=1
elif [ package-lock.json -nt "$STAMP" ]; then
  NEED_INSTALL=1
fi

if [ "$NEED_INSTALL" -eq 1 ]; then
  log "Installing dependencies (npm ci)"
  mkdir -p .deploy
  $NPM_BIN ci
  date +%s > "$STAMP"
else
  log "Skipping npm ci (node_modules fresh)"
fi

log "Building Next.js (npm run build)"
$NPM_BIN run build

log "Restarting systemd services: $NEXT_SERVICE, $GATEWAY_SERVICE"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart "$NEXT_SERVICE" || fail "Failed to restart $NEXT_SERVICE"
  sudo systemctl restart "$GATEWAY_SERVICE" || fail "Failed to restart $GATEWAY_SERVICE"
else
  warn "systemctl not found; skipping service restarts"
fi

sleep 3
log "Health check: $HEALTH_URL"
if command -v curl >/dev/null 2>&1; then
  set +e
  CURL_OUT=$(curl -fsS -m 8 "$HEALTH_URL" 2>&1)
  RC=$?
  set -e
  if [ $RC -ne 0 ]; then
    warn "Health endpoint failed (rc=$RC): $CURL_OUT"
  else
    log "Health OK: $CURL_OUT"
  fi
else
  warn "curl not installed; skipping health check"
fi

log "Deployment complete"
