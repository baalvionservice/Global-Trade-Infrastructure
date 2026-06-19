# `src/` — Application Source

All application code for Baalvion GTI. TypeScript-first; the `@/*` import alias maps to this directory (`tsconfig.json` `paths`).

## Top-level layout

| Folder | Purpose |
|--------|---------|
| `app/` | Next.js App Router — routes, layouts, in-app API route handlers, and SEO files (`sitemap.ts`, `robots.ts`, `manifest.ts`). |
| `api/` | Typed **TradeOps data layer** for the dashboard: thin client over `lib/api-client`, React Query keys/provider, and per-domain modules (shipments, customs, compliance, logistics, documents, workflows). |
| `lib/` | Cross-cutting utilities: the canonical `api-client`, `route-access` (auth classification), `seo`, `safe-redirect`, finance/admin/sanctions clients, `utils`. |
| `services/` | Large catalog of domain **service singletons** consumed by dashboard pages (commerce, finance, intelligence, identity, logistics, compliance, governance…). |
| `server/` | In-app **orchestration backend** — Prisma access, repositories, HTTP helpers, domain/finance/compliance services, plus the test suite. |
| `ai/` | Server-only **Genkit AI** flows, agents, governance trust-guard, vector memory, and the orchestration kernel. |
| `orchestration/` | Workflow / lifecycle / consensus / compensation engines, ports/adapters, and the in-process event bus. |
| `core/` | Authorization primitives: personas, roles, routes, GST, organizations, authority mapping. |
| `components/` | Shared React components, including the ShadCN UI primitives in `components/ui`. |
| `modules/` | Feature modules (workspace store, analytics, financials, intelligence, security, …). |
| `design-system/` | Design tokens, density provider/hook, design store. |
| `hooks/` | Reusable React hooks (`use-mobile`, `use-realtime`, `use-toast`, `use-device-class`). |
| `store/` | Global Zustand app store (`use-app-store`). |
| `repositories/` | Client-side repository abstractions (`base-repository`, `sourcing-repository`). |
| `types/`, `data/` | Shared TypeScript types (`api`, `institutional`, `regulatory`) and a data index. |
| `middleware.ts` | Edge auth gate (reads the refresh cookie) + security headers / CSP. |

## Conventions

- Components are `PascalCase`; hooks are `use*`; the `@/` alias is used for all non-relative imports.
- The browser only ever calls this origin — all live trade/finance data flows through `lib/api-client` → `/trade-bff` (see root README › Architecture).
- Server-only code (`server/`, `ai/`) must not be imported into client components.
