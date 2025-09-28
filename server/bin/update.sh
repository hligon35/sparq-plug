#!/usr/bin/env bash
set -euo pipefail

# SparQ Plug server updater
# Pulls latest code for this repo and auxiliary repos, publishes static site,
# and (re)builds/restarts the docker compose stack.

umask 022

# Resolve stack root (this script lives in server/bin/update.sh)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

log(){ echo "[update] $*"; }

# Load .env if present (PORTAL_DOCKERFILE, STATIC_SUBDIR, REPO_OWNER, etc.)
if [[ -f .env ]]; then
	set -a; source .env; set +a
fi

REPO_OWNER="${REPO_OWNER:-hligon35}"
PORTAL_REPO_NAME="${PORTAL_REPO_NAME:-sparq-dash}"
STATIC_REPO_NAME="${STATIC_REPO_NAME:-sparq-landing}"

# Ensure git safe-directory (for root/systemd context)
git config --global --add safe.directory "$ROOT" || true

log "updating main repo at $ROOT"
if command -v git >/dev/null 2>&1; then
	git fetch --all --prune || true
	git pull --ff-only || true
else
	log "ERROR: git not found"
fi

# Prepare portal and static repos inside server/
mkdir -p "$ROOT/portal-app/src" "$ROOT/static-site/src" || true

log "sync portal repo"
if [[ ! -d "$ROOT/portal-app/src/.git" ]]; then
	git clone "https://github.com/${REPO_OWNER}/${PORTAL_REPO_NAME}.git" "$ROOT/portal-app/src" || true
fi
if [[ -d "$ROOT/portal-app/src/.git" ]]; then
	git config --global --add safe.directory "$ROOT/portal-app/src" || true
	git -C "$ROOT/portal-app/src" fetch --all --prune || true
	git -C "$ROOT/portal-app/src" pull --ff-only || true
fi

log "sync static site repo"
if [[ ! -d "$ROOT/static-site/src/.git" ]]; then
	git clone "https://github.com/${REPO_OWNER}/${STATIC_REPO_NAME}.git" "$ROOT/static-site/src" || true
fi
if [[ -d "$ROOT/static-site/src/.git" ]]; then
	git config --global --add safe.directory "$ROOT/static-site/src" || true
	git -C "$ROOT/static-site/src" fetch --all --prune || true
	git -C "$ROOT/static-site/src" pull --ff-only || true

	SRC_DIR="$ROOT/static-site/src/${STATIC_SUBDIR:-.}"
	OUT_DIR="$ROOT/static-site/build_out"
	TMP_OUT="$ROOT/static-site/.tmp_build_out_$(date +%s)"
	rm -rf "$TMP_OUT" && mkdir -p "$TMP_OUT"

	log "copy static files: $SRC_DIR -> $TMP_OUT"
	cp -a "$SRC_DIR/." "$TMP_OUT/" || true
	rm -rf "$TMP_OUT/.git" "$TMP_OUT/.github" "$TMP_OUT/.gitignore" 2>/dev/null || true

	if [[ ! -f "$TMP_OUT/index.html" ]] && [[ -z "$(find "$TMP_OUT" -maxdepth 1 -type f | head -n1)" ]]; then
		log "no files copied; keep existing $OUT_DIR"
		rm -rf "$TMP_OUT"
	else
		log "publish static site"
		rm -rf "$OUT_DIR" && mv "$TMP_OUT" "$OUT_DIR"
		chmod 755 "$OUT_DIR" || true
		find "$OUT_DIR" -type d -exec chmod 755 {} + || true
		find "$OUT_DIR" -type f -exec chmod 644 {} + || true
	fi
fi

log "docker compose up --build"
if command -v docker >/dev/null 2>&1; then
	if docker compose version >/dev/null 2>&1; then
		set +e
		DOCKER_BUILDKIT=1 docker compose -f "$ROOT/docker-compose.yml" up -d --build
		rc=$?
		set -e
		if [[ $rc -ne 0 ]]; then
			log "compose build failed (rc=$rc); trying up without build"
			docker compose -f "$ROOT/docker-compose.yml" up -d || true
		fi
		docker compose -f "$ROOT/docker-compose.yml" start || true
	elif command -v docker-compose >/dev/null 2>&1; then
		set +e
		DOCKER_BUILDKIT=1 docker-compose -f "$ROOT/docker-compose.yml" up -d --build
		rc=$?
		set -e
		if [[ $rc -ne 0 ]]; then
			log "docker-compose build failed (rc=$rc); trying up without build"
			docker-compose -f "$ROOT/docker-compose.yml" up -d || true
		fi
		docker-compose -f "$ROOT/docker-compose.yml" start || true
	else
		log "ERROR: neither docker compose nor docker-compose found"
		exit 1
	fi
else
	log "ERROR: docker not found"
	exit 1
fi

log "update complete"

