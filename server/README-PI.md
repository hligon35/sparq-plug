# Raspberry Pi deployment: getsparqd.com, portal.getsparqd.com, sparqplug.getsparqd.com

This folder ships a minimal, repeatable deployment for a Raspberry Pi 5 (8GB):

- getsparqd.com — static landing site (served by nginx)
- portal.getsparqd.com — your second app (built from its own repo via Dockerfile)
- sparqplug.getsparqd.com — this Next.js app (built from this repo)

Cloudflare Tunnel (cloudflared) routes traffic by hostname to each service. No public ports are required on the Pi.

## One-time setup on the Pi (over SSH)

1) Install Docker and the compose plugin (Debian/Ubuntu based Pi OS):
   - sudo apt-get update
   - sudo apt-get install -y docker.io docker-compose-plugin git
   - sudo systemctl enable --now docker

2) Clone this repo to the Pi, e.g. /opt/sparqplug:
   - sudo mkdir -p /opt/sparqplug
   - sudo chown -R "$USER":"$USER" /opt/sparqplug
   - git clone YOUR_REPO_URL /opt/sparqplug
   - cd /opt/sparqplug/server

3) Copy environment template and edit values:
   - cp .env.example .env
   - edit .env (portal/static repo URLs, branches, optional build commands)

4) Configure Cloudflare Tunnel:
   - mkdir -p cloudflared
   - Copy your tunnel credentials JSON to cloudflared/<TUNNEL_ID>.json
   - cp cloudflared/config.example.yml cloudflared/config.yml
   - Edit config.yml: set your TUNNEL_ID and adjust hostnames if needed

5) First run (clones repos and brings up the stack):
   - bash bin/update.sh

6) Auto-update every 6 hours:
   - sudo cp bin/update.sh /usr/local/bin/sparqplug-update.sh && sudo chmod +x /usr/local/bin/sparqplug-update.sh
   - sudo cp systemd/sparqplug-updater.service /etc/systemd/system/
   - sudo cp systemd/sparqplug-updater.timer /etc/systemd/system/
   - sudo systemctl daemon-reload
   - sudo systemctl enable --now sparqplug-updater.timer

## How updates work

- Push to your repos normally.
- Every 6 hours the Pi runs the updater:
  - Pulls latest changes for this repo (sparqplug)
  - Clones/pulls the Portal repo and Static site repo
  - Builds (if needed) and restarts containers with docker compose

## Files

- docker-compose.yml — services for sparqplug, portal-app, static-site, and cloudflared
- .env.example — fill in and copy to .env
- cloudflared/config.example.yml — example config; copy to config.yml and set your tunnel ID
- bin/update.sh — idempotent updater the timer calls
- systemd/*.service|*.timer — run updater every 6 hours

Notes:

- For portal-app, ensure the repo contains a Dockerfile at its root (or set PORTAL_DOCKERFILE in .env).
- For static-site, set STATIC_BUILD_CMD if the site needs a build (e.g., npm ci && npm run build), and STATIC_OUTPUT_DIR accordingly.
- All images chosen support linux/arm64 (Pi 5).
