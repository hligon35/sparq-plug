# Deploying sparq-plug on 68.54.208.207 with Cloudflare Tunnel

This app is Next.js (App Router). It supports a basePath. Below uses `/app` so the site is served at `https://sparqplug.getsparqd.com/app`.

## 1) Build and run with Docker

- Install Docker on the server 68.54.208.207
- Copy the repo to the server and run:

```powershell
# Build and start (Windows PowerShell examples)
docker compose up -d --build

# Check logs
docker compose logs -f web
```

The app listens on port 3000 locally.

## 2) Cloudflare Tunnel and DNS

DNS (from your provided records):

- CNAME `sparqplug.getsparqd.com` -> `4a40b7d3-cbb6-4a46-adfd-2017990af6e8.cfargotunnel.com` (Proxied)
- CNAME `portal.getsparqd.com` -> same tunnel hostname (Proxied)
- Apex `getsparqd.com` -> GitHub Pages (CNAME to hligon35.github.io)
- `www.getsparqd.com` CNAME -> getsparqd.com

Run Cloudflare Tunnel on the server and route to the local service:

```powershell
# One-time login
cloudflared tunnel login
# Create or use existing tunnel (ID shown matches your DNS)
cloudflared tunnel create sparqplug
# Route the hostname to the local port 3000
cloudflared tunnel route dns sparqplug sparqplug.getsparqd.com
# Start the tunnel
cloudflared tunnel run sparqplug
```

Alternatively with a config file (Linux paths shown; adapt as needed):

```yaml
# /etc/cloudflared/config.yml

# Replace with your actual Tunnel ID
"tunnel": "4a40b7d3-cbb6-4a46-adfd-2017990af6e8"
"credentials-file": "/etc/cloudflared/4a40b7d3-cbb6-4a46-adfd-2017990af6e8.json"

ingress:
  - hostname: sparqplug.getsparqd.com
    service: http://localhost:3000
  - hostname: portal.getsparqd.com
    service: http://localhost:3000
  - service: http_status:404
```

Then run:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 3) App configuration for subpath

- We use a subpath `/app`:
  - APP_BASE_PATH=/app
  - NEXT_PUBLIC_BASE_PATH=/app
- These are set in `docker-compose.yml`. If you want to serve at root, set them to empty string `""` and rebuild.

Health check endpoint for Cloudflare or monitors: `https://sparqplug.getsparqd.com/app/api/healthz`

## 4) Data persistence

- Uploads and JSON data are stored under `/data` volume in the container.
- Mapped by docker-compose to a named volume `data`.

## 5) Stripe (optional)

Set `STRIPE_SECRET_KEY` and `PUBLIC_URL` as env vars if you enable billing. Public URL should include protocol and host, e.g. `https://sparqplug.getsparqd.com`.

## 6) Troubleshooting

- If styling is missing, ensure the basePath matches env vars and the Cloudflare hostname path (see Section 3).
- If login loops back to /login, check browser cookies and ensure the app is served from the same hostname (SameSite=Lax) and that the middleware is using the correct basePath (it is by default).
- Check `/app/api/healthz` responds 200.
