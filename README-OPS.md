# SparqPlug Operational Notes

This document captures key operational commands and scripts for running the Next.js app and the optional gateway proxy.

## Components
- **Next.js App**: Runs on port 3000 (systemd: `sparqplug-next`).
- **Gateway (optional)**: Express reverse proxy providing basePath normalization, cache header hardening, SSO/session hooks, diagnostics. Default port 4000.

## Scripts
| Script | Purpose |
|--------|---------|
| `scripts/start-gateway.sh` | Launch gateway in foreground or detached (`--detach`) with upstream pre-flight check |
| `scripts/wait-ready.sh`    | Poll gateway `/ready` endpoint until `ok:true` or timeout |

Make scripts executable:
```
chmod +x scripts/*.sh
```

### Start Gateway (foreground)
```
APP_URL=http://localhost:3000 APP_BASE_PATH=/app PORT=4000 ./scripts/start-gateway.sh
```

### Start Gateway (detached)
```
APP_URL=http://localhost:3000 APP_BASE_PATH=/app PORT=4000 ./scripts/start-gateway.sh --detach
```
Logs (detached mode): `gateway.out.log`, `gateway.err.log`, PID file: `gateway.pid`.

### Wait for Readiness
```
PORT=4000 ./scripts/wait-ready.sh
```
Returns 0 on ready, non-zero on timeout.

## Readiness Semantics
`/ready` returns 200 only if:
- Upstream Next `/api/healthz` returns OK.
- If Redis configured (`REDIS_URL` set) then Redis is connected.
Otherwise 503.

## Systemd Integration Example
```
[Unit]
Description=SparqPlug Gateway
After=network.target sparqplug-next.service
Requires=sparqplug-next.service

[Service]
WorkingDirectory=/home/sparqy/GetSparQdDotCom/SparQDigital/sparq-plug
Environment=NODE_ENV=production
Environment=APP_URL=http://localhost:3000
Environment=APP_BASE_PATH=/app
Environment=PORT=4000
ExecStart=/home/sparqy/GetSparQdDotCom/SparQDigital/sparq-plug/scripts/start-gateway.sh
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
```
Reload and enable:
```
sudo systemctl daemon-reload
sudo systemctl enable sparqplug-gateway
sudo systemctl restart sparqplug-gateway
```

## Caching Strategy
- HTML: no-store (either via gateway or direct Next config) to prevent stale chunk references.
- Static assets (`/_next/static/`): immutable long cache.

## Troubleshooting Quick Table
| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| 502 via gateway | Upstream Next down | Check `curl -sf 3000/app/api/healthz` |
| Gateway 503 on `/ready` | Redis offline or upstream failing | Inspect `/ready` JSON details |
| Duplicate `/app/app/` in paths | BasePath duplication before normalization | Confirm `APP_BASE_PATH=/app` only once |
| Stale JS chunk errors | Cached HTML pointing to old hashes | Purge edge cache; ensure no-store headers present |

## Security Hardening (future)
- Add rate limiting (e.g., `express-rate-limit`) on auth endpoints.
- Enable structured logging (pino) for ingestion.
- Restrict outbound egress if deploying into containerized infra.

---
Last updated: $(date -u +%Y-%m-%dT%H:%MZ)
