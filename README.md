# SparQ Plug — Deploy to Render or Your Own Server

Next.js (App Router) app with TypeScript and Tailwind. This README covers only Render and self-host deployment.

Key paths and files

- Base path: configurable via APP_BASE_PATH (default /app).
- Health check: /api/healthz (respects APP_BASE_PATH).
- Stripe checkout: POST /api/create-stripe-session (uses STRIPE_SECRET_KEY if set, otherwise mocked).
- Artifacts: Dockerfile (self-host), render.yaml (Render deploy).

Environment variables

- APP_BASE_PATH: "/app" (default). Set to empty string "" to serve at root.
- NODE_ENV: "production" in production.
- PUBLIC_URL: Your public site URL (e.g., <https://example.com>). Used in Stripe redirects.
- STRIPE_SECRET_KEY: Live or test secret key (optional for mocked flow).

Local development

1. Install dependencies:

```bash
npm install
```

1. Start the dev server:

```bash
npm run dev
```

1. App will run on <http://localhost:3000> (or next available). If APP_BASE_PATH=/app, your routes are under <http://localhost:3000/app>.

Render deployment

Prereqs: A Render account with GitHub repo connected.

1. Push to main. Render will detect render.yaml.
1. In Render, create a Web Service from this repo if not auto-created.
1. Build command: npm ci --no-audit --no-fund && npm run build (from render.yaml)
1. Start command: npm run start (from render.yaml)
1. Environment variables:
   - NODE_ENV=production
   - APP_BASE_PATH=/app (or set to empty for root)
   - PUBLIC_URL=<https://your-render-domain>
   - STRIPE_SECRET_KEY=sk_live_xxx (optional until ready)
1. Health check path: /app/api/healthz (or /api/healthz if APP_BASE_PATH is empty).

Self-host (Docker)

Build image and run the container.

1. Build image:

```bash
docker build -t sparq-plug .
# Optionally set build arg APP_BASE_PATH to bake it into the build
# docker build -t sparq-plug --build-arg APP_BASE_PATH="/app" .
```

1. Run container:

```bash
docker run -p 3000:3000 \
   -e NODE_ENV=production \
   -e APP_BASE_PATH="/app" \
   -e PUBLIC_URL="https://your-domain" \
   -e STRIPE_SECRET_KEY="sk_live_xxx" \
   --name sparq-plug sparq-plug
```

1. Nginx/Load balancer: proxy pass to container:3000. Do not strip APP_BASE_PATH if you set one.

1. Health check: GET <https://your-domain/app/api/healthz> (or /api/healthz at root).

Auth note
Current login is demo-only and sets a role cookie on the client. Replace with real auth (e.g., NextAuth) before production. Middleware enforces role-based access based on cookie/header.

Stripe note
With STRIPE_SECRET_KEY set, the checkout session is real. Without it, session creation returns a mocked success URL so the UI flow can be tested.

Common adjustments

- To use root URLs, set APP_BASE_PATH="" in both build/runtime environments and update Render healthCheckPath accordingly.
- For error pages, add app/error.tsx and app/not-found.tsx if desired.

License
Proprietary/All rights reserved (update as needed).
