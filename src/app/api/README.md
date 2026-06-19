# `src/app/api/` — In-App Orchestration Route Handlers

Next.js route handlers that back the app's own **orchestration datastore** (Prisma/Postgres) and a few server-side operations. These are distinct from the `/trade-bff` BFF rewrites (which proxy to the external auth-gateway/trade-service) — handlers here run on this origin and use `@/server/*`.

## Routes

| File | Route | Purpose |
|------|-------|---------|
| `health/route.ts` | `GET /api/health` | Liveness/readiness probe — runs `SELECT 1` against Postgres, returns `200` healthy / `503` unhealthy. |
| `trades/route.ts` | `/api/trades` | List/create `TradeTransaction` aggregates. |
| `trades/[id]/route.ts` | `/api/trades/:id` | Fetch a single trade with its full graph. |
| `trades/[id]/workflow/route.ts` | `/api/trades/:id/workflow` | Workflow transitions. |
| `trades/[id]/events/route.ts` | `/api/trades/:id/events` | Event store for the trade. |
| `trades/[id]/audit/route.ts` | `/api/trades/:id/audit` | Audit trail. |
| `trades/[id]/documents/route.ts` | `/api/trades/:id/documents` | Trade documents. |
| `trades/[id]/finance/route.ts` | `/api/trades/:id/finance` | Trade-finance records. |
| `trades/[id]/compliance/route.ts` | `/api/trades/:id/compliance` | Compliance checks. |
| `trades/[id]/cancel/route.ts`, `complete/route.ts` | `/api/trades/:id/{cancel,complete}` | Lifecycle terminal transitions. |
| `finance/[requestId]/decision/route.ts` | `/api/finance/:requestId/decision` | Finance request decisioning. |
| `sanctions/screen/route.ts` | `POST /api/sanctions/screen` | Sanctions screening. |
| `[entity]/route.ts`, `[entity]/[id]/route.ts` | `/api/:entity[/:id]` | Generic CRUD entity routes. |
| `v1/[entity]/route.ts`, `v1/[entity]/[id]/route.ts` | `/api/v1/:entity[/:id]` | Versioned generic CRUD. |
| `v1/intelligence/delay-prediction/route.ts` | `/api/v1/intelligence/delay-prediction` | AI corridor delay prediction. |

## Conventions

- Handlers use `runtime = 'nodejs'` where Prisma/Node APIs are required.
- Responses use the shared `ok()` / `fail()` helpers from `@/server/http/api`.
- The edge middleware lets `/api/` through; these handlers enforce their own auth/identity via `@/server/http/identity`.
