#!/usr/bin/env bash
set -euo pipefail

# sparqplug Pi diagnostics: collects env, network, Docker, Cloudflare Tunnel, and stack status
# Usage: bash bin/diag.sh > diag-$(date +%Y%m%d-%H%M%S).txt

log() { echo -e "\n===== $* ====="; }

REPO_ROOT=${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}
cd "$REPO_ROOT"

log "SYSTEM"
uname -a || true
echo "ARCH: $(uname -m)" || true
echo "DATE: $(date -Is)" || true
echo "UPTIME: $(uptime -p || true)" || true

log "/etc/os-release"
cat /etc/os-release 2>/dev/null || true

log "DISK and MEMORY"
df -h || true
free -h || true

log "NETWORK"
hostname -f || true
ip -4 addr || true
ip -4 route || true
echo "RESOLV.CONF:"; cat /etc/resolv.conf 2>/dev/null || true

log "DNS LOOKUPS"
for host in getsparqd.com portal.getsparqd.com sparqplug.getsparqd.com; do
  getent ahosts "$host" || true
done

log "OPEN PORTS (listening)"
ss -tulpen || true

log "DOCKER"
(docker --version && docker compose version) || true
docker info 2>/dev/null | sed -n '1,40p' || true
echo "DOCKER COMPOSE FILE: $REPO_ROOT/docker-compose.yml"
if [ -f "$REPO_ROOT/docker-compose.yml" ]; then
  docker compose config >/dev/null && echo "compose config: OK" || echo "compose config: ERROR"
fi

log "STACK STATUS"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' || true
docker compose ps || true

log "ENV (.env in server/)"
if [ -f .env ]; then
  # Print safe vars only
  grep -E '^(TUNNEL_ID|ROOT_HOST|PORTAL_HOST|SPARQPLUG_HOST|PORTAL_REPO|PORTAL_BRANCH|PORTAL_DOCKERFILE|STATIC_REPO|STATIC_BRANCH|STATIC_SUBDIR|STATIC_BUILD_CMD|STATIC_OUTPUT_DIR)=' .env || true
else
  echo "No .env file found. Copy .env.example to .env and edit."
fi

log "CLOUDFLARED CONFIG"
CF_DIR="$REPO_ROOT/cloudflared"
ls -la "$CF_DIR" 2>/dev/null || true
if [ -f "$CF_DIR/config.yml" ]; then
  echo "--- config.yml ---"; sed -n '1,200p' "$CF_DIR/config.yml"; echo "-------------------"
  echo "Credentials JSON present?"; ls "$CF_DIR"/*.json 2>/dev/null || echo "No credentials JSON in $CF_DIR"
else
  echo "cloudflared/config.yml not found"
fi

log "CLOUDFLARE TUNNEL CONTAINER TEST"
# Try a dry-run by starting cloudflared in validate mode (short timeout)
if docker compose run --rm --name cf-validate -T cloudflared tunnel --version >/dev/null 2>&1; then
  docker compose run --rm -T cloudflared --config /etc/cloudflared/config.yml --no-autoupdate --help | head -n 5 || true
else
  echo "cloudflared service not defined or image pull pending; skip."
fi

log "RECENT LOGS"
docker compose logs --since=30m --tail=200 || true

log "SUGGESTIONS"
echo "- Ensure .env has correct repo URLs and TUNNEL_ID."
echo "- Place <TUNNEL_ID>.json credentials into cloudflared/ and keep it out of git."
echo "- After updates: DOCKER_BUILDKIT=1 docker compose up -d --build"

log "DONE"
