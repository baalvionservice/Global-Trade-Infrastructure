# `src/app/governance/` — Sovereign Command & Oversight Plane

The authenticated, persona-gated governance surface. Classified under `ADMIN_PREFIXES` in `@/lib/route-access`: the edge middleware proves a session exists; the client `RouteGuard` restricts access to god-view/oversight personas; the API is authoritative. `layout.tsx` provides the shared governance chrome.

## Notable routes

| Route | Purpose |
|-------|---------|
| `/governance` | Governance home. |
| `/governance/platform-status` | Live ROUTE_REGISTRY / service-coverage tracker. |
| `/governance/onboarding` | Review queue for submitted onboarding applications. |
| `/governance/intelligence` | Risk heatmap, anomaly detector, exposure tracker, supplier-risk list (`_components/`). |
| `/governance/security/*` | RBAC (`rbac/`), tenants (`tenants/`), security audit (`audit/`) — own `security/layout.tsx`. |
| `/governance/approvals`, `/policies`, `/disputes`, `/disputes/[id]` | Approval, policy, and dispute management. |
| `/governance/audit-logs`, `/records`, `/certification` | Audit trail, records, certification. |
| `/governance/compliance-admin`, `/compliance-admin/risk` | Compliance administration. |
| `/governance/bank-admin`, `/platform-admin`, `/sovereign-admin`, `/organizations` | Tenant + platform administration. |
| `/governance/{control-tower,maritime,customs,regulatory,war-room,emergency-ops,…}` | Operational command surfaces. |
| `/governance/{ai-command-center,ai-oversight,enterprise-cognition,strategy-intelligence}` | AI governance + strategic intelligence. |

## Conventions

- All pages are authenticated; none are indexable (every governance prefix is `disallow`ed in `app/robots.ts`).
- Page-private widgets live in route `_components/` folders (e.g. `intelligence/_components`).
