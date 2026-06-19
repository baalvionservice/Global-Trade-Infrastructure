# `src/app/(dashboard)/` — Authenticated Trade-Ops Workspace

The operational command plane. `layout.tsx` (a client component) wires the workspace shell: a collapsible `DashboardSidebar`, `DashboardHeader`, a resizable `WorkspaceShell` (panes + tabs), the `AiCopilotDrawer`, and a `RealtimeProvider`, all inside a `TradeQueryProvider` (TanStack Query). Sidebar collapse state comes from the workspace Zustand store.

## Shared route-private components (`_components/`)

| File | Purpose |
|------|---------|
| `route-guard.tsx` | Per-persona authorization gate (mounted in the **root** layout, guards all protected surfaces). |
| `app-state.tsx` | `AppProvider` / `useAppState` — auth + authorization context. |
| `sidebar.tsx`, `sidebar-nav.tsx` | Primary navigation rail and its nav model. |
| `header.tsx` | Workspace top bar. |
| `workspace-shell.tsx`, `workspace-tabs.tsx` | Resizable pane + tab engine. |
| `ai-copilot-drawer.tsx` | AI copilot side drawer. |
| `realtime-provider.tsx` | Realtime/event subscription provider. |
| `insights-panel.tsx`, `ecosystem-graph.tsx`, `demo-control.tsx` | Supporting dashboard widgets. |

## Major route areas

Persona workspaces (`buyer/`, `seller/`, `agent/`), commerce (`sourcing/`, `deals/`, `orders/`, `negotiations/`, `marketplace/`), money (`payments/`, `escrow/`, `finance-settlement/`, `financials/`), compliance (`compliance/`, `compliance-regulatory/`, `sanctions-screening/`), logistics (`customs/`, `logistics-shipment/`, `shipments/`, `carriers/`, **`trade-ops/`**), intelligence (`intelligence-hub/`), and admin (`organization/`, `platform/`, `settings/`, `oversight/`, `executive/`, `profile/`). See the root README for the full route table.

## `trade-ops/` — Trade Operations Control Center

The flagship shipment-centric surface over the **live** `trade-service`. `trade-ops/page.tsx` lists every tenant shipment with live status + lifecycle: server-side pagination, status filter, debounced search, live polling. Data is fetched through `@/api` (React Query → `/trade-bff` BFF; tenant + auth enforced server-side). `_components/` holds async-state gates, status badges, and the new-shipment dialog.

## Conventions

- Pages are `'use client'` and read data through `@/api` (typed React Query) or `@/services/*` singletons — never a raw bearer/tenant header.
- Authorization helpers come from `@/core/authorization` (`canEdit`, persona checks) plus `useAppState`.
- Every prefix here is registered in `@/lib/route-access` (`AUTH_REQUIRED_PREFIXES`).
