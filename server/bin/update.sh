#!/usr/bin/env bash
set -euo pipefail

# Runs every 6 hours via systemd timer. Pulls repos, rebuilds containers, and restarts.
# Expects to be run inside the server/ folder or with REPO_ROOT pointing to repo root.

REPO_ROOT=${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}
cd "$REPO_ROOT"

# Load env
if [[ -f .env ]]; then
  set -a; source .env; set +a
else
  echo "[update] Missing .env in server/. Copy .env.example to .env and edit."
fi

log() { echo "[update] $*"; }

# Helper to ensure directory exists
ensure_dir() { mkdir -p "$1"; }

# 1) Update this repo
log "Updating sparqplug repo..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git fetch --all --prune || true
  git pull --ff-only || true
else
  log "Not a git repo; skipping pull."
fi

# 2) Portal repo clone/update
if [[ -n "${PORTAL_REPO:-}" ]]; then
  ensure_dir portal-app
  if [[ ! -d portal-app/src/.git ]]; then
    log "Cloning portal repo: $PORTAL_REPO"
    ensure_dir portal-app
    rm -rf portal-app/src && mkdir -p portal-app/src
    git clone --branch "${PORTAL_BRANCH:-main}" --depth 1 "$PORTAL_REPO" portal-app/src
  else
    log "Updating portal repo to ${PORTAL_BRANCH:-main}..."
    git -C portal-app/src fetch --all --prune || true
    git -C portal-app/src checkout "${PORTAL_BRANCH:-main}" || true
    git -C portal-app/src pull --ff-only || true
  fi
fi

# 3) Static site clone/update and build/copy
if [[ -n "${STATIC_REPO:-}" ]]; then
  ensure_dir static-site
  if [[ ! -d static-site/src/.git ]]; then
    log "Cloning static site repo: $STATIC_REPO"
    rm -rf static-site/src && mkdir -p static-site/src
    git clone --branch "${STATIC_BRANCH:-main}" --depth 1 "$STATIC_REPO" static-site/src
  else
    log "Updating static site repo to ${STATIC_BRANCH:-main}..."
    git -C static-site/src fetch --all --prune || true
    git -C static-site/src checkout "${STATIC_BRANCH:-main}" || true
    git -C static-site/src pull --ff-only || true
  fi

  # Build or copy
  SRC_DIR="static-site/src/${STATIC_SUBDIR:-.}"
  OUT_DIR="static-site/build_out"
  rm -rf "$OUT_DIR" && mkdir -p "$OUT_DIR"
  if [[ -n "${STATIC_BUILD_CMD:-}" ]]; then
    log "Building static site: $STATIC_BUILD_CMD"
    (cd "$SRC_DIR" && bash -lc "$STATIC_BUILD_CMD")
    if [[ -n "${STATIC_OUTPUT_DIR:-}" ]]; then
      cp -a "$SRC_DIR/${STATIC_OUTPUT_DIR}/." "$OUT_DIR/"
    else
      log "STATIC_OUTPUT_DIR empty after build; copying entire source subdir"
      cp -a "$SRC_DIR/." "$OUT_DIR/"
    fi
  else
    log "No build command; copying static files from $SRC_DIR"
    cp -a "$SRC_DIR/." "$OUT_DIR/"
  fi
fi

# 4) Rebuild and up services
log "Bringing stack up with build..."
DOCKER_BUILDKIT=1 docker compose up -d --build
log "All done."
