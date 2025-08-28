#!/usr/bin/env bash
set -euo pipefail

# Ensure readable perms regardless of environment umask
umask 022

# Where this repo's server folder is mounted inside the container
ROOT=/workspace/server
cd "$ROOT"

# Load env if present (for STATIC_SUBDIR, etc.)
if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

log() { echo "[runner] $*"; }

# Ensure SSH won't prompt for GitHub host key; prefer non-interactive add
HOME_DIR="${HOME:-/root}"
mkdir -p "$HOME_DIR/.ssh" && chmod 700 "$HOME_DIR/.ssh" || true
touch "$HOME_DIR/.ssh/known_hosts" && chmod 600 "$HOME_DIR/.ssh/known_hosts" || true
ssh-keyscan -T 3 -t ed25519 github.com >> "$HOME_DIR/.ssh/known_hosts" 2>/dev/null || true
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=$HOME_DIR/.ssh/known_hosts"

log "skip main repo pull (managed on host)"

log "update portal repo..."
if [[ -d portal-app/src/.git ]]; then
  git config --global --add safe.directory /workspace/server/portal-app/src || true
  git -C portal-app/src pull --ff-only || true
fi

log "update static repo..."
if [[ -d static-site/src/.git ]]; then
  git config --global --add safe.directory /workspace/server/static-site/src || true
  git -C static-site/src pull --ff-only || true

  SRC_DIR="static-site/src/${STATIC_SUBDIR:-.}"
  OUT_DIR="static-site/build_out"
  TMP_OUT="static-site/.tmp_build_out_$(date +%s)"
  rm -rf "$TMP_OUT" && mkdir -p "$TMP_OUT"

  log "copying static files from $SRC_DIR -> $TMP_OUT"
  cp -a "$SRC_DIR/." "$TMP_OUT/" || true

  # Strip VCS artifacts
  rm -rf "$TMP_OUT/.git" "$TMP_OUT/.github" "$TMP_OUT/.gitignore" 2>/dev/null || true

  # Validate content exists (index.html or any top-level file)
  if [[ ! -f "$TMP_OUT/index.html" ]] && [[ -z "$(find "$TMP_OUT" -maxdepth 1 -type f | head -n1)" ]]; then
    log "WARNING: No files copied into temp; keeping existing $OUT_DIR"
    rm -rf "$TMP_OUT"
  else
    log "publishing static site atomically"
    rm -rf "$OUT_DIR" && mv "$TMP_OUT" "$OUT_DIR"
    # Normalize permissions to prevent Nginx 403
    chmod 755 "$OUT_DIR" || true
    find "$OUT_DIR" -type d -exec chmod 755 {} + || true
    find "$OUT_DIR" -type f -exec chmod 644 {} + || true
  fi
fi

log "compose up --build..."
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    DOCKER_BUILDKIT=1 docker compose -f "$ROOT/docker-compose.yml" up -d --build
  elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_BUILDKIT=1 docker-compose -f "$ROOT/docker-compose.yml" up -d --build
  else
    log "ERROR: neither docker compose nor docker-compose found"
    exit 1
  fi
else
  log "ERROR: docker CLI not found in deployer container"
  exit 1
fi
log "done"
