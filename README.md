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
- NEXT_PUBLIC_FEATURE_EMAIL_SETUP / FEATURE_EMAIL_SETUP: Set to "true" to show the Email Setup UI (use NEXT_PUBLIC_ variant for client render).
- STRIPE_SECRET_KEY: Live or test secret key (optional for mocked flow).
- NEXT_PUBLIC_MANAGER_NAV_DEBUG: Set to "true" to render the manager navigation debug panel (development tooling only).

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
   - STRIPE_SECRET_KEY=&lt;your-key&gt; (set via a `.env` file; optional until ready)
1. Health check path: /app/api/healthz (or /api/healthz if APP_BASE_PATH is empty).

Self-host (Docker)

## Database & Prisma

The app uses Prisma for persistence. By default it points to a local SQLite file for zero-config development.

Default local `.env` entries (see `.env` / `.env.local`):

```env
DATABASE_URL="file:./dev.db"
```

Key commands:

```bash
npx prisma generate              # Rebuild client after schema changes
npx prisma migrate dev --name <migration_name>   # Create & apply a dev migration
npx prisma studio                # Open browser UI to inspect data
```

Recent models of note:

- AuditEvent: persistent security & activity audit log (replaces prior file-based JSON). A pruning job retains ~90 days (see `src/lib/audit.ts`).

If you pulled new changes containing `AuditEvent`, run:

```bash
npx prisma migrate dev --name add_audit_event
```

### Switching to Postgres (recommended for production)

1. Provision a Postgres instance.
2. Update `.env.local` (and deployment env) with:
   `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public`
3. Edit `prisma/schema.prisma` datasource:
   `provider = "postgresql"`
4. Run migrations locally:
   `npx prisma migrate dev --name init_postgres` (first time) or subsequent names.
5. In CI/production deploy step run:
   `npx prisma migrate deploy`

### Operational Notes

- Health endpoint: `/api/system/health` checks DB connectivity & env validity.
- Metrics endpoint: `/api/system/metrics` (admin only) returns user counts, pending registrations, and last 24h audit volume.
- Add monitoring/alerts on failed health checks and migration errors.
- For horizontal scaling & rate limiting, replace the in-memory limiter with Redis (future enhancement).

### Backups & Retention

- SQLite: back up the `dev.db` file (not ideal for production).
- Postgres: use provider-native automated backups + point-in-time restore.
- Audit pruning interval & retention days (`RETAIN_DAYS`) configurable in `src/lib/audit.ts`—adjust to compliance needs.


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
   -e STRIPE_SECRET_KEY="<your-key>" \
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

Local mailbox provisioning (optional)

This app can provision email mailboxes on the same server via a script you provide. It is wired to the Email Setup wizard when the provider "local" is selected.

1. Enable and configure via env:

   - LOCAL_MAILBOX_ENABLED=true
   - LOCAL_MAILBOX_SCRIPT: absolute path to your provisioning script

   See .env.local.example for guidance.

2. Script contract:

   Your script must accept:

   `--user <username> --domain <domain> --password <password> [--display-name <name>] [--aliases a,b,c]`

   The repo includes sample scripts:

   - server/bin/local-mailbox.sh (bash)
   - server/bin/local-mailbox.ps1 (PowerShell)

3. Use it:

   - Visit /email-setup → select provider "local" → enter mailbox and password → Apply.
   - The server calls the script and shows the result in the Summary step.

License
Proprietary/All rights reserved (update as needed).

---

## Manager Section Architecture & Navigation (Internal Docs)

The manager interface ("SparQ Plug" portal) uses a unified layout and typed navigation model to ensure consistency and testability.

### Key Files

| Concern | File |
|---------|------|
| Tab key types & routes | `src/lib/managerNav.ts` |
| Shared layout shell | `src/components/ManagerLayout.tsx` |
| Top navigation bar | `src/components/ManagerTopNav.tsx` |
| Root manager page (dashboard/invoices toggle) | `src/app/manager/page.tsx` |
| Client calendars (dynamic client query) | `src/app/manager/client-calendars/page.tsx` |
| Analytics hook | `src/hooks/useManagerNavAnalytics.ts` |
| Debug panel (dev only) | `src/components/ManagerNavDebugPanel.tsx` |

### Tab Model

Tabs are defined by the `ManagerTabKey` union and mapped via `managerRouteMap`:

```ts
export type ManagerTabKey = 'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings' | 'tasks';
```

Dashboard and invoices share the same physical route (`/manager`) and distinguish state via a `?tab=invoices` query parameter; internal switching is handled client-side for instant UX.

### Navigation Helper

`navigateManager(tab, { internalHandler, router, replace })` centralizes navigation:

- If `tab` is `dashboard` or `invoices` and `internalHandler` is provided, it invokes the handler (no route push by default). The caller may sync URL (root page does this with `history.replaceState`).
- Else it prefers the provided Next.js router (`router.push` / `router.replace`) and falls back to a hard navigation (`window.location.href`).

### ManagerLayout

Wraps pages with header + top nav and delegates to `navigateManager` for SPA behavior. Accepts:

- `active`: current tab key
- `headerTitle` / `headerSubtitle`
- `onNavChange`: optional override (used by root page to intercept dashboard/invoices)

### Instrumentation

`managerNav.ts` exposes lightweight event instrumentation:

```ts
addManagerNavListener(ev => {
   // ev: { tab, internal, method: 'internal' | 'router' | 'hard', timestamp }
});
```

Events fire after each navigation decision. Use `useManagerNavAnalytics` to retain a rolling buffer (default 100) and/or stream to an analytics endpoint.

### Debugging Panel

Include the debug panel in development to visualize navigation in real-time:

```tsx
import ManagerNavDebugPanel from '@/components/ManagerNavDebugPanel';

{process.env.NODE_ENV === 'development' && <ManagerNavDebugPanel />}
```

### Testing

`managerNav.test.ts` validates:

- Route map keys & invoices query param
- Internal handler bypass (dashboard/invoices)
- Router vs hard navigation fallback
- Instrumentation event emission (internal, router, hard)

Add future integration tests by rendering `ManagerLayout` with a mocked router and simulating tab button clicks using React Testing Library.

### Adding a New Tab

1. Add key to `ManagerTabKey` and `managerRouteMap`.
2. Add label entry in `ManagerTopNav` tabs array (order defines visual sequence).
3. Create `/manager/<new-tab>/page.tsx` using `ManagerLayout` with `active="<key>"`.
4. Update or add tests asserting key presence.
5. (Optional) If co-located with dashboard/invoices logic, ensure it does NOT use internalHandler unless it shares the same physical route.

### Accessibility Considerations

- Top nav uses buttons with `aria-current="page"` for active state.
- Section banners supply semantic headings; some pages include visually-hidden (`sr-only`) H1 to maintain structural outline.
- Dynamic grids (e.g., calendars) may utilize `aria-live="polite"` for content changes (extend as needed for screen reader announcement fidelity).

### Performance Notes

Navigation avoids full-page reloads except when a hard fallback occurs (rare). Dashboard/invoices toggle is instant (state + optional URL param update). Client calendars now update query string via `router.replace` without flush/reload.

---
