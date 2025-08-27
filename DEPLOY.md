# Deploying sparq-plug on 68.54.208.207 (Docker + Nginx, optional Cloudflare Tunnel/TLS)

This is a Next.js App Router app. It's configured to run at the root path on `https://sparqplug.getsparqd.com`.

## 0) One-command bootstrap (recommended)

On a fresh Ubuntu/Debian server:

1) As root (or with sudo), run the bootstrap script:

```bash
curl -fsSL https://raw.githubusercontent.com/hligon35/sparq-plug/main/server_setup -o server_setup
sudo DOMAIN=sparqplug.getsparqd.com bash server_setup
```

Options:

- `ENABLE_TLS=true CERTBOT_EMAIL=you@example.com` → issues a Let's Encrypt cert and enables HTTPS
- `AUTO_UPDATE=true UPDATE_INTERVAL=6h` → creates a systemd timer to pull and redeploy every 6 hours

1) Point DNS for `sparqplug.getsparqd.com` to this server (A/AAAA) or use Cloudflare Tunnel (see below).

Health: http(s)://sparqplug.getsparqd.com/api/healthz

## 1) Manual build and run with Docker (if not using the script)

- Install Docker and Docker Compose plugin
- Copy the repo to the server, then from the repo directory:

```bash
docker compose up -d --build
```

  Check logs:

```bash
docker compose logs -f web
```

The app listens on port 3000 locally. Nginx can reverse proxy 80/443 → 3000.

## 2) Cloudflare Tunnel and DNS (optional)

DNS examples:

- CNAME `sparqplug.getsparqd.com` → `TUNNEL_ID.cfargotunnel.com` (Proxied)
- Apex `getsparqd.com` → GitHub Pages (CNAME to hligon35.github.io)
- `www.getsparqd.com` CNAME → getsparqd.com

Cloudflare Tunnel config (Linux):

`/etc/cloudflared/config.yml`

```yaml
tunnel: "TUNNEL_ID"
credentials-file: "/etc/cloudflared/TUNNEL_ID.json"

ingress:
  - hostname: sparqplug.getsparqd.com
    service: http://localhost:80
  - service: http_status:404
```

Then:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 3) App configuration and data persistence

- Base path is root. In `docker-compose.yml` APP_BASE_PATH and NEXT_PUBLIC_BASE_PATH are empty; do not change unless you serve under a subpath.
- Uploads and JSON data are stored under `/data` in the container, mapped to a named Docker volume `data`.

## 4) TLS with Let's Encrypt (optional)

- If you run `server_setup` with `ENABLE_TLS=true CERTBOT_EMAIL=you@example.com`, it will request and install a cert via Certbot (nginx plugin) and enable HTTPS with HSTS.
- Renewals are automatic via Certbot's systemd timer.

## 5) Auto-update every 6 hours (optional)

- `server_setup` creates a systemd service and timer that:
  - git fetch/reset to origin/main
  - docker compose up -d --build
- Controlled by env: `AUTO_UPDATE=true UPDATE_INTERVAL=6h GIT_BRANCH=main`
- To trigger manually:

```bash
sudo systemctl start sparqplug-update.service
```

## 6) Stripe (optional)

Set `STRIPE_SECRET_KEY` and `PUBLIC_URL` as env vars if you enable billing. PUBLIC_URL should include protocol and host, e.g. `https://sparqplug.getsparqd.com`.

## 7) Troubleshooting

- If styling is missing, ensure basePath envs are empty (root) and you're accessing the correct hostname.
- If login loops to /login, check cookies and that Nginx preserves Host; this setup does.
- Check `/api/healthz` responds 200.
