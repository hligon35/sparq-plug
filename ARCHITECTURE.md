# Architecture Overview

This document summarizes the current and target architecture of the SparQ Plug platform.

## Layers

- **UI**: Next.js App Router (React 19) + Tailwind CSS
- **API Routes**: Thin adapters using `createApiHandler` for logging, tracing, metrics, error shaping
- **Domain Services**: e.g., `schedulingService` encapsulates business logic
- **Core Infra (`/src/core`)**: logger, feature flags, validation, metrics, audit, request context
- **Persistence**: JSON file adapters (planned migration to database repository pattern)

## Cross-Cutting Concerns

- Structured logging (trace-aware) with `x-trace-id` response header
- Feature flags (metrics, audit logging, advanced validation, etc.)
- Validation via Zod schemas
- Error normalization (consistent JSON shape)
- In-memory metrics counters (flag gated `/api/metrics` endpoint)
- Client-side diagnostics panel for runtime health checks

## Request Flow (Example: Create Scheduled Post)

```text
Client -> /api/scheduled-posts POST -> apiHandler -> validation -> service.create -> JSON store
      -> (audit emit?) -> metrics counter -> response (+ trace id)
```

## Error Shape

```json
{ "error": { "code": "string", "message": "string", "traceId": "uuid" } }
```

## Adding a New API Route

1. Implement/extend domain service
2. Create route and wrap with `createApiHandler`
3. Validate input (Zod) under any feature flag gates
4. Increment metrics / emit audit events as needed

## Accessibility

- Skip link (`#main`) + `<main>` landmark
- Navigation regions carry `role="navigation"` and descriptive `aria-label`s
- Sortable tables apply `aria-sort`

## Testing (Current / Planned)

- Existing: logger + validation unit tests
- Planned: service layer, integration (API + diagnostics), feature flag behavior

## Deployment

- Docker containerization, cloudflared tunnel configs, systemd scripts for edge/device deployment

## Roadmap Highlights

- DB migration (PostgreSQL/Prisma or Drizzle)
- Analytics ingestion pipeline (social + site + revenue)
- Background jobs / queue for slow operations
- Unified reporting generation service
- Enhanced RBAC & multi-tenant isolation
- OpenTelemetry tracing exports (future)

---

(Keep this document updated as new subsystems land.)
