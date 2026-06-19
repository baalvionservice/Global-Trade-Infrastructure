# `src/app/` — Next.js App Router

Routes, layouts, in-app API route handlers, and SEO files. The **root layout is `force-dynamic`** (authenticated, store-driven app — not SSG-safe).

## Structure

| Path | Purpose |
|------|---------|
| `layout.tsx` | Root layout — `AppProvider`, `RouteGuard`, `TourOverlay`, `Toaster`, site-wide JSON-LD (Organization + WebSite), fonts (Inter, JetBrains Mono), global metadata/viewport. |
| `globals.css` | Global Tailwind styles + design tokens. |
| `(public)/` | Route group: marketing + onboarding surface (crawlable), wrapped in the institutional header/footer shell. |
| `(dashboard)/` | Route group: authenticated trade-ops workspace (sidebar, resizable panes, AI copilot, realtime). |
| `governance/` | Sovereign command + oversight plane (authenticated, persona-gated). |
| `api/` | In-app orchestration **route handlers** (trades, finance, sanctions, health, generic CRUD entities). |
| `login/`, `forgot-password/`, `reset-password/`, `accept-invite/` | Auth entry pages (server-rendered, public). |
| `error.tsx`, `loading.tsx`, `not-found.tsx` | App-level error / loading / 404 UI. |
| `sitemap.ts`, `robots.ts`, `manifest.ts` | SEO + PWA primitives (only the public surface is indexable). |
| `opengraph-image.png` / `.alt.txt` | Default social share card + alt text. |

## Conventions

- Route groups `(public)` and `(dashboard)` set their own layouts without affecting the URL.
- `_components/` and `_lib/` (underscore-prefixed) folders are route-private and never become routes.
- Public pages own SEO via `@/lib/seo` (metadata + per-page JSON-LD); the authenticated app stays `noindex`/disallowed.
- Authorization is layered: edge `middleware.ts` (session presence) → client `RouteGuard` (persona allowlist) → API (authoritative). Classification lives in `@/lib/route-access`.
