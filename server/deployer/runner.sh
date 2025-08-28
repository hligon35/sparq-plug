#!/usr/bin/env bash
set -euo pipefail

# Where this repo's server folder is mounted inside the container
ROOT=/workspace/server
cd "$ROOT"

# Load env if present (for STATIC_SUBDIR, etc.)
if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

echo "[runner] pull main repo..."
git -C /workspace pull || true

echo "[runner] update portal repo..."
if [[ -d portal-app/src/.git ]]; then
  git -C portal-app/src pull --ff-only || true
fi

echo "[runner] update static repo..."
if [[ -d static-site/src/.git ]]; then
  git -C static-site/src pull --ff-only || true
  rm -rf static-site/build_out
  mkdir -p static-site/build_out
  cp -a "static-site/src/${STATIC_SUBDIR:-.}/." static-site/build_out/
  # Normalize permissions to prevent Nginx 403
  chmod 755 static-site/build_out || true
  find static-site/build_out -type d -exec chmod 755 {} + || true
  find static-site/build_out -type f -exec chmod 644 {} + || true
fi

echo "[runner] compose up --build..."
DOCKER_BUILDKIT=1 docker compose -f "$ROOT/docker-compose.yml" up -d --build
echo "[runner] done"
