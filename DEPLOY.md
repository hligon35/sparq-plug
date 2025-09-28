# Deploying SparQ stack (Pi 5 + Cloudflare Tunnel)

This repo now includes a Raspberry Pi deployment bundle to run two sites together (portal retired) and auto-update every 6 hours:

- getsparqd.com (static site)
- sparqplug.getsparqd.com (this app)

See server/README-PI.md for the turnkey setup steps. (Legacy portal host portal.getsparqd.com has been removed.) In short, on the Pi:

1) Install Docker and the compose plugin
2) Clone this repo and cd server/
3) Copy .env.example to .env and edit URLs/branches
4) Add your Cloudflare Tunnel credentials JSON and config.yml in server/cloudflared
5) docker compose up -d --build
6) Enable the systemd timer: it calls bin/update.sh every 6 hours

Local single-app Docker (for quick tests):

- Build: docker build -t sparq-plug .
- Run: docker run -p 3000:3000 sparq-plug
