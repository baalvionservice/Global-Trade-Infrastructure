# GTOS — Implementation Execution Plan (07)

> Implementation-only. No redesign. Aligns to 00–06. Ground-truth verified against `Backend/` + `Frontend/Global-Trade-Infrastructure-main/`.
> Port baseline: highest in use = 3046. New services assigned 3047+.

---

## CRITICAL RISKS

| ID | Risk | Current state (verified) | Exit criterion |
|----|------|--------------------------|----------------|
| **R1** | Cross-tenant data leakage | `@baalvion/tenancy` proven in `search-service` only; 0 other services adopt it; 0 schemas have RLS policies; services connect as superuser → RLS would be bypassed even if enabled. | Every tenant-scoped schema has `ENABLE + FORCE ROW LEVEL SECURITY`; all services connect as `baalvion_app` (`NOSUPERUSER NOBYPASSRLS`); CI cross-tenant probe is green and blocking. |
| **R2** | HS256 auth islands | `auth-service` signs RS256-only; `trade-service`/`insiders` reject HS256. HS256 fallback still live in `@baalvion/auth-node/index.js:267-270` + 6 soft-state services (`developer`, `agent`, `tenant`, `audit`, `search`, `report`) + `JWT_ALLOW_HS256_FALLBACK` env. | `algorithms: ['RS256']` enforced in every verifier; HS256 branch deleted from `auth-node`; `JWT_ALLOW_HS256_FALLBACK` removed; startup fails if any HS256 path reachable. |
| **R3** | Order ↔ payment ↔ finance divergence | Anemic CRUD; payment row inserted before Java call (no txn); payment-completion webhook never cascades to `trade.orders`; in-memory webhook dedup (lost on crash); no reconciliation. Java side already has outbox+saga+Kafka. | Transactional outbox in trade domain; persistent webhook idempotency; saga that cascades payment state → order state atomically; nightly reconciliation with drift alarm = 0. |

---

## P0 TASKS

> Block production. Do before any new service ships.

### P0-1 — Lock the DB role (R1 precondition)
- Create role `baalvion_app` `NOSUPERUSER NOBYPASSRLS`; grant CRUD on app schemas only.
- Repoint every service `DATABASE_URL` to `baalvion_app`. Keep migration role separate (`baalvion_migrator`, owner).
- **Files:** `Backend/database/migrations/0xx_app_role.sql`, all service `.env`/`.env.example`.
- **Gate:** `SELECT current_user` from a live service returns `baalvion_app`; `rolbypassrls = false`.

### P0-2 — Enforce RLS on hot schemas (R1)
- Apply `enableRlsSql(schema, table, { tenantColumn })` migrations to: `trade.*`, `commerce.*`, `orders.*`, `inventory.*`, `marketplace.*`, `market.*`.
- Mount `tenantMiddleware({ resolve: req => req.auth?.org_id, bypassRoles: ['super_admin'] })` + `requireTenant` in each service.
- Wrap every data path in `withTenantTransaction` / `withTenantClient`. Remove ad-hoc `orgId` filters once RLS proven.
- **Per-service order:** `trade-service` → `commerce-service` → `order-service` → `inventory-service` → `marketplace-service` → `market-service`.
- **Gate:** P0-3.

### P0-3 — Cross-tenant CI probe (R1, blocking)
- Test: seed org A + org B rows; auth as A; assert every `GET`/list/`GET :id` returns **0** B rows and `404` on B ids; assert cross-tenant `INSERT`/`UPDATE` blocked.
- Run in CI as required check on `Backend/**`.
- **Files:** `Backend/test/security/cross-tenant.spec.js`, `.github/workflows/*` required check.

### P0-4 — Delete HS256 everywhere (R2)
- Remove HS256 branch in `Backend/packages/auth-node/index.js:259-270` → `algorithms: ['RS256']` unconditionally; throw if no RS256 key present.
- Delete `allowHs256Fallback` / `JWT_ALLOW_HS256_FALLBACK` from `developer`, `agent`, `tenant`, `audit`, `search`, `report` services + `rbac-service` prod guard.
- Add startup assertion: refuse boot if any verifier configured with HS256.
- **Gate:** Integration test — HS256-signed token → `401` on all 6 services + gateway.

### P0-5 — Trade transactional outbox + persistent idempotency (R3)
- New table `trade.outbox_events` (pattern from Java `payment-service/domain/OutboxEvent.java`).
- New table `trade.processed_webhooks` (replace in-memory `Map` in `internalController.js:25-31`).
- Rewrite `paymentController.createPayment`: order/payment row(s) + outbox row in a **single** `withTenantTransaction`. No business state visible until commit.
- Scheduled publisher drains `PENDING` outbox → Redis Streams `baalvion:events` (via `sdk.events`) → `SENT`.
- **Gate:** Kill process between row-write and finance-call; restart; assert no orphan/duplicate.

### P0-6 — Payment→Order saga cascade (R3)
- Consumer on `payments.transaction.completed|failed|reversed` updates linked `trade.orders.payment_status` + `status` in one txn; idempotent via `processed_webhooks`.
- Persist webhook dedup before applying projection.
- **Gate:** Payment completes → order reaches `payment_confirmed` within SLA; replayed event = no-op.

---

## P1 TASKS

> Required for V1. New domain services + reconciliation.

- **P1-1** — `order-execution-service` (:3052): saga orchestrator owning order lifecycle state machine + outbox relay (extract from trade-service).
- **P1-2** — Nightly **reconciliation** job: compare `trade.orders` ↔ `trade.payments` ↔ Java ledger; emit `gtos.finance.reconciliation.drift.v1`; dashboard + alarm. (Java `reconciliation-service` exists — wire Node order state into it.)
- **P1-3** — `network-graph-service` (:3047, Neo4j) — relationship-edge authz feed for R1 (graph-gated visibility).
- **P1-4** — `product-registry-service` (:3048) — canonical product/HS-code master.
- **P1-5** — `trade-documentation-service` (:3049) — B/L, CoO, packing list, LC docs, e-sign seam.
- **P1-6** — `quality-inspection-service` (:3050) — inspection orders, AQL, CAPA.
- **P1-7** — `supplier-lifecycle-service` (:3051) — onboarding→qualification→scorecard→offboarding.
- **P1-8** — RLS rollout to remaining tenant schemas (`cms`, `ir`, `marketplace` deal-room, etc.).
- **P1-9** — Frontend nav extension per 02: Network, Products, Trade Docs, Quality, Suppliers L1 sections (additive to `src/core/routes.ts`).
- **P1-10** — Key rotation runbook: dual-publish via `JWT_ADDITIONAL_PUBLIC_KEYS`/`JWT_ACTIVE_KID`; document JWKS cache TTL.

---

## P2 TASKS

> V2 hardening / scale.

- **P2-1** — GraphRAG sanctions-path reasoning over `network-graph-service` (per 06).
- **P2-2** — ClickHouse projections for product/supplier/quality analytics.
- **P2-3** — OpenSearch indexers for product registry + supplier directory + trade docs.
- **P2-4** — Maker-checker (dual-control) on document issuance + supplier blacklist (per 05).
- **P2-5** — gRPC hot paths for graph queries + product lookups (per 06).
- **P2-6** — WORM audit chain for issued trade documents.
- **P2-7** — Per-tenant RLS → cell-based sharding precursors (V3 seam, per 04).
- **P2-8** — Contract tests (Pact) for all five new services against gateway.

---

## SERVICE SPECIFICATIONS

> All Node services: Express + Sequelize (graph = neo4j-driver), `@baalvion/auth-node` (RS256-only), `@baalvion/tenancy` (RLS), `@baalvion/sdk` events (Redis Streams `baalvion:events`). Schema-per-service. Tenant column `org_id` (UUID) on every table except graph (tenant is a node property/edge guard).

### S1 — network-graph-service `:3047` (Neo4j)
- **Purpose:** Relationship graph of trade entities (orgs, people, products, shipments, banks, vessels, sanctioned entities). Powers cross-tenant visibility gating (R1), sanctions path-finding, supplier/buyer discovery.
- **Store:** Neo4j 5 (bolt). Mirror of authoritative rows; **not** system of record — projection from domain events.
- **Tenant model:** Every node carries `orgId`; every read query is parameterized with caller `orgId` + `relationship-edge` rule. Super_admin bypass via explicit flag.
- **Depends on:** `auth-service` (verify), event bus (ingest projections from order/supplier/product/finance domains).
- **Consumers:** marketplace discovery, compliance (sanctions path), supplier-lifecycle (network risk), AI command layer (GraphRAG).

### S2 — product-registry-service `:3048`
- **Purpose:** Canonical product master: SKU/GTIN, HS code (6/8/10), classification, attributes, unit-of-measure, hazmat flags, country-of-origin rules, document requirements per HS+destination.
- **Store:** PostgreSQL schema `product`.
- **Depends on:** `auth-service`, `@baalvion/tenancy`. Publishes to graph + search indexer.
- **Consumers:** trade-service (order line items), trade-documentation (doc requirement resolution), quality-inspection (spec linkage), marketplace.

### S3 — trade-documentation-service `:3049`
- **Purpose:** Generate/store/version trade documents: Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, LC docs, Inspection Cert refs. Template engine + e-sign seam + immutable issued-version store.
- **Store:** PostgreSQL schema `tradedoc` (metadata) + S3 (rendered PDF/XML, WORM at V2).
- **Depends on:** `product-registry-service` (doc requirements), `order-execution-service` (order context), `auth-service`, `@baalvion/tenancy`.
- **Consumers:** orders, compliance, banking (LC), customs gateway.

### S4 — quality-inspection-service `:3050`
- **Purpose:** Inspection orders, sampling plans (AQL), checklists, defect capture, pass/fail, CAPA, inspector assignment, cert issuance (feeds trade-documentation).
- **Store:** PostgreSQL schema `quality`.
- **Depends on:** `product-registry-service` (specs), `order-execution-service` (PO linkage), `supplier-lifecycle-service` (scorecard feed), `auth-service`, `@baalvion/tenancy`.
- **Consumers:** supplier scorecards, trade-documentation (inspection cert), orders (release gate).

### S5 — supplier-lifecycle-service `:3051`
- **Purpose:** Supplier onboarding → KYC/qualification → risk scoring → performance scorecard → renewal/offboarding/blacklist. State machine + document checklist + scorecard aggregation.
- **Store:** PostgreSQL schema `supplier`.
- **Depends on:** `network-graph-service` (network risk), `quality-inspection-service` (quality KPI), finance trust-score (`:3046`), `auth-service`, `@baalvion/tenancy`.
- **Consumers:** sourcing, marketplace, compliance.

### S6 — order-execution-service `:3052` (R3)
- **Purpose:** Authoritative order lifecycle state machine + outbox relay + saga coordination across payment/finance/docs/quality. Extracts orchestration out of anemic trade-service.
- **Store:** PostgreSQL schema `trade` (shared with trade-service; owns `orders`, `outbox_events`, `processed_webhooks`, `order_saga_state`).
- **Depends on:** Java finance suite (HMAC bridge + Kafka/Redis events), `trade-documentation-service`, `quality-inspection-service`, `auth-service`, `@baalvion/tenancy`.

---

## DATABASE MODELS

> DDL is illustrative-canonical; `org_id UUID NOT NULL` + RLS policy via `enableRlsSql` on every tenant table. Timestamps `created_at/updated_at timestamptz default now()`.

### R1 / R3 infrastructure (schema `trade`)
```sql
CREATE TABLE trade.outbox_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL,
  aggregate_type  text NOT NULL,            -- 'order' | 'payment'
  aggregate_id    uuid NOT NULL,
  event_type      text NOT NULL,            -- 'gtos.order.created.v1' ...
  payload         jsonb NOT NULL,
  status          text NOT NULL DEFAULT 'PENDING'  -- PENDING|SENT|FAILED
                  CHECK (status IN ('PENDING','SENT','FAILED')),
  attempts        int  NOT NULL DEFAULT 0,
  available_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  sent_at         timestamptz
);
CREATE INDEX ON trade.outbox_events (status, available_at);

CREATE TABLE trade.processed_webhooks (
  webhook_id    text PRIMARY KEY,           -- X-Webhook-Id
  event_type    text NOT NULL,
  payload_hash  text NOT NULL,
  processed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE trade.order_saga_state (
  order_id      uuid PRIMARY KEY,
  org_id        uuid NOT NULL,
  state         text NOT NULL,              -- CREATED|PAYMENT_PENDING|PAYMENT_CONFIRMED|FAILED|COMPLETED|COMPENSATING
  last_event    text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- orders gains explicit, constrained money linkage
ALTER TABLE trade.orders
  ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','pending','confirmed','failed','refunded')),
  ADD CONSTRAINT orders_status_chk
    CHECK (status IN ('draft','placed','payment_confirmed','in_fulfillment','shipped','delivered','closed','cancelled'));
ALTER TABLE trade.payments
  ADD CONSTRAINT payments_order_fk FOREIGN KEY (order_id) REFERENCES trade.orders(id),
  ADD CONSTRAINT payments_status_chk
    CHECK (status IN ('pending','processing','completed','failed','refunded'));
```

### S2 — product (schema `product`)
```sql
CREATE TABLE product.products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  sku           text NOT NULL,
  gtin          text,
  name          text NOT NULL,
  hs_code       text NOT NULL,             -- 6/8/10 digit
  uom           text NOT NULL,
  origin_country char(2),
  hazmat        boolean NOT NULL DEFAULT false,
  attributes    jsonb NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired','draft')),
  UNIQUE (org_id, sku)
);
CREATE TABLE product.hs_doc_requirements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  hs_prefix     text NOT NULL,
  dest_country  char(2) NOT NULL,
  doc_type      text NOT NULL,             -- 'certificate_of_origin' ...
  mandatory     boolean NOT NULL DEFAULT true
);
```

### S3 — tradedoc (schema `tradedoc`)
```sql
CREATE TABLE tradedoc.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  order_id      uuid,
  doc_type      text NOT NULL,             -- commercial_invoice|packing_list|bill_of_lading|certificate_of_origin|lc|inspection_cert
  status        text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','issued','signed','void')),
  version       int  NOT NULL DEFAULT 1,
  storage_key   text,                      -- S3 object key (immutable once issued)
  checksum      text,
  issued_at     timestamptz,
  issued_by     uuid,
  metadata      jsonb NOT NULL DEFAULT '{}',
  UNIQUE (org_id, doc_type, order_id, version)
);
CREATE TABLE tradedoc.signatures (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  document_id   uuid NOT NULL REFERENCES tradedoc.documents(id),
  signer_id     uuid NOT NULL,
  signature     text NOT NULL,
  signed_at     timestamptz NOT NULL DEFAULT now()
);
```

### S4 — quality (schema `quality`)
```sql
CREATE TABLE quality.inspections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  order_id      uuid,
  product_id    uuid,
  supplier_id   uuid,
  type          text NOT NULL,             -- incoming|in_process|pre_shipment|container_loading
  aql_level     text,
  status        text NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled','in_progress','passed','failed','cancelled')),
  inspector_id  uuid,
  scheduled_at  timestamptz,
  result        jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE quality.defects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  inspection_id uuid NOT NULL REFERENCES quality.inspections(id),
  severity      text NOT NULL CHECK (severity IN ('critical','major','minor')),
  description   text NOT NULL,
  qty           int  NOT NULL DEFAULT 1
);
CREATE TABLE quality.capa (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  inspection_id uuid NOT NULL REFERENCES quality.inspections(id),
  action        text NOT NULL,
  owner_id      uuid,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','closed')),
  due_at        timestamptz
);
```

### S5 — supplier (schema `supplier`)
```sql
CREATE TABLE supplier.suppliers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  legal_name    text NOT NULL,
  country       char(2) NOT NULL,
  stage         text NOT NULL DEFAULT 'prospect'
                CHECK (stage IN ('prospect','onboarding','qualified','active','suspended','offboarded','blacklisted')),
  risk_score    numeric(5,2),
  trust_score   int,                       -- mirror of finance trust-score-service
  metadata      jsonb NOT NULL DEFAULT '{}',
  UNIQUE (org_id, legal_name, country)
);
CREATE TABLE supplier.qualification_docs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  supplier_id   uuid NOT NULL REFERENCES supplier.suppliers(id),
  doc_type      text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  expires_at    timestamptz
);
CREATE TABLE supplier.scorecards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  supplier_id   uuid NOT NULL REFERENCES supplier.suppliers(id),
  period        text NOT NULL,             -- '2026-Q2'
  quality_kpi   numeric(5,2),
  otd_kpi       numeric(5,2),              -- on-time delivery
  defect_ppm    int,
  composite     numeric(5,2),
  UNIQUE (org_id, supplier_id, period)
);
```

### S1 — network-graph (Neo4j)
```cypher
// Node labels (all carry orgId + sourceId)
(:Organization {id, orgId, name, country})
(:Person       {id, orgId, name})
(:Product      {id, orgId, sku, hsCode})
(:Shipment     {id, orgId, blNumber})
(:Bank         {id, orgId, swift})
(:SanctionedEntity {id, listSource, name})     // global, no orgId

// Edge types
(:Organization)-[:SUPPLIES {since}]->(:Organization)
(:Organization)-[:BUYS_FROM {since}]->(:Organization)
(:Organization)-[:OWNS]->(:Product)
(:Organization)-[:SHIPPED]->(:Shipment)
(:Organization)-[:BANKS_WITH]->(:Bank)
(:Person)-[:DIRECTOR_OF]->(:Organization)
(:Organization)-[:MATCHES_SANCTION {score}]->(:SanctionedEntity)

// Constraints
CREATE CONSTRAINT org_id IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE;
CREATE INDEX org_tenant IF NOT EXISTS FOR (o:Organization) ON (o.orgId);
```

---

## EVENT MODELS

> Topic convention (per 03): `gtos.<domain>.<entity>.<verb>.<version>`. Transport: Redis Streams `baalvion:events` via `@baalvion/sdk` (V2 → Kafka). Envelope carries `traceId`, `tenantId` (=`org_id`), `eventId`, `occurredAt`.

| Topic | Producer | Consumers | Payload (core) |
|-------|----------|-----------|----------------|
| `gtos.order.created.v1` | order-execution | graph, docs, quality | `{ orderId, orgId, buyerOrgId, sellerOrgId, lines[], totalValue, currency }` |
| `gtos.order.payment_confirmed.v1` | order-execution | docs, fulfillment, analytics | `{ orderId, orgId, paymentId, amount, currency }` |
| `gtos.order.failed.v1` | order-execution | graph, analytics | `{ orderId, orgId, reason }` |
| `payments.transaction.completed` *(existing, Java)* | payment-service | order-execution (saga) | `{ id, tenantId, ledgerJournalId, amount }` |
| `payments.transaction.failed` *(existing, Java)* | payment-service | order-execution (saga) | `{ id, tenantId, failureReason }` |
| `payments.transaction.reversed` *(existing, Java)* | payment-service | order-execution | `{ id, tenantId }` |
| `gtos.finance.reconciliation.drift.v1` | reconciliation | dashboard, alerting | `{ orgId, orderId, paymentId, orderState, paymentState, ledgerState }` |
| `gtos.product.upserted.v1` | product-registry | graph, search, docs | `{ productId, orgId, sku, hsCode }` |
| `gtos.tradedoc.issued.v1` | trade-documentation | compliance, banking, audit | `{ documentId, orgId, orderId, docType, version, checksum }` |
| `gtos.quality.inspection.completed.v1` | quality-inspection | supplier-lifecycle, docs, orders | `{ inspectionId, orgId, supplierId, result, passed }` |
| `gtos.supplier.stage_changed.v1` | supplier-lifecycle | graph, sourcing, compliance | `{ supplierId, orgId, fromStage, toStage }` |
| `gtos.supplier.scorecard.published.v1` | supplier-lifecycle | sourcing, analytics | `{ supplierId, orgId, period, composite }` |
| `gtos.graph.edge.created.v1` | network-graph | compliance (sanctions) | `{ orgId, edgeType, fromId, toId }` |

**Idempotency:** every consumer keys on `eventId` via persistent `processed_webhooks`/`processed_events`. **Ordering:** per-aggregate via `aggregate_id` partition key.

---

## API CONTRACTS

> Base `/v1`. Auth: `Authorization: Bearer <RS256>` verified by `@baalvion/auth-node`. `X-Tenant-Id` resolved from `org_id` claim by `tenantMiddleware`. Envelope: `{ success, data, error, meta }`. Errors: `401` unauth, `403` cross-tenant/RBAC, `404` not-found (incl. cross-tenant masking), `409` state conflict, `422` validation.

### network-graph-service `:3047`
```
POST   /v1/nodes                      Upsert node            { label, id, props }
POST   /v1/edges                      Create edge            { type, fromId, toId, props }
GET    /v1/nodes/:id/neighbors        1-hop neighbors        ?type=&direction=
GET    /v1/paths                      Shortest path          ?fromId=&toId=&maxHops=
GET    /v1/sanctions/path/:orgId      Sanction exposure path → { paths[], maxScore }
POST   /v1/query                      Parameterized Cypher   (allowlisted templates only)
```

### product-registry-service `:3048`
```
GET    /v1/products                   List/filter            ?hsCode=&status=&q=
POST   /v1/products                   Create                 { sku, name, hsCode, uom, ... }
GET    /v1/products/:id               Get
PATCH  /v1/products/:id               Update
POST   /v1/products/:id/retire        Retire
GET    /v1/hs/:hsCode/requirements    Doc requirements       ?dest=US → { docs[] }
```

### trade-documentation-service `:3049`
```
GET    /v1/documents                  List                   ?orderId=&docType=&status=
POST   /v1/documents                  Create draft           { orderId, docType, payload }
GET    /v1/documents/:id              Get (+ presigned URL)
POST   /v1/documents/:id/issue        Render + freeze        → status=issued, checksum
POST   /v1/documents/:id/sign         E-sign                 { signerId, signature }
POST   /v1/documents/:id/void         Void                   (maker-checker at V2)
GET    /v1/orders/:orderId/dossier    All docs for order
```

### quality-inspection-service `:3050`
```
GET    /v1/inspections                List                   ?orderId=&supplierId=&status=
POST   /v1/inspections                Schedule               { orderId, productId, supplierId, type, aqlLevel }
GET    /v1/inspections/:id            Get
POST   /v1/inspections/:id/start      → in_progress
POST   /v1/inspections/:id/result     Submit                 { passed, defects[], notes }
POST   /v1/inspections/:id/capa       Open CAPA              { action, ownerId, dueAt }
```

### supplier-lifecycle-service `:3051`
```
GET    /v1/suppliers                  List                   ?stage=&country=&q=
POST   /v1/suppliers                  Create prospect        { legalName, country }
GET    /v1/suppliers/:id              Get (+ risk, trust)
POST   /v1/suppliers/:id/transition   Stage change           { toStage, reason }
POST   /v1/suppliers/:id/docs         Add qualification doc  { docType, expiresAt }
GET    /v1/suppliers/:id/scorecard    Latest/period          ?period=2026-Q2
POST   /v1/suppliers/:id/blacklist    Blacklist (maker-checker V2)
```

### order-execution-service `:3052`
```
POST   /v1/orders                     Create (txn: order+outbox)  { lines[], buyerOrgId, sellerOrgId }
GET    /v1/orders/:id                 Get (+ saga state, payment_status)
POST   /v1/orders/:id/confirm-payment Initiate payment saga
GET    /v1/orders/:id/timeline        Event/saga timeline
POST   /v1/internal/finance-events    Java HMAC webhook (persistent dedup → saga)
```

---

## DEPLOYMENT PLAN

> Sequenced by dependency + risk. Each step independently revertible. No new service ships before P0 green.

1. **P0-1** `baalvion_app` role + `DATABASE_URL` repoint (all services). Verify `current_user`.
2. **P0-2** RLS migrations on `trade/commerce/orders/inventory/marketplace/market`; mount tenant middleware service-by-service.
3. **P0-3** Cross-tenant CI probe → required, blocking. **Do not proceed until green.**
4. **P0-4** Delete HS256 from `auth-node` + 6 soft-state services; redeploy gateway last.
5. **P0-5** `trade.outbox_events` + `processed_webhooks` + transactional `createPayment` + publisher.
6. **P0-6** Payment→Order saga cascade; verify replay safety.
7. **P1-1/P1-2** `order-execution-service` (:3052) + reconciliation wiring + drift alarm.
8. **P1-3** `network-graph-service` (:3047) + Neo4j; backfill from domain events.
9. **P1-4** `product-registry-service` (:3048) — prerequisite for docs + quality.
10. **P1-5** `trade-documentation-service` (:3049).
11. **P1-6** `quality-inspection-service` (:3050).
12. **P1-7** `supplier-lifecycle-service` (:3051).
13. **P1-9** Frontend nav extension (additive to `routes.ts`/`roles.ts`).
14. **P2** GraphRAG, ClickHouse, OpenSearch indexers, maker-checker, gRPC, WORM, Pact.

**Per-service deploy checklist:** schema migration (as `baalvion_migrator`) → RLS enabled+forced → service connects as `baalvion_app` → tenant middleware mounted → RS256-only verifier → cross-tenant probe extended → event consumer idempotent → catalog descriptor + compose + pm2 entry → health green.

---

## 12-MONTH ROADMAP

### MVP (Months 0–3) — Production unblock
- R1: `baalvion_app` role + RLS on hot schemas + blocking cross-tenant CI (P0-1→3).
- R2: HS256 deleted platform-wide; RS256-only enforced (P0-4).
- R3: transactional outbox + persistent idempotency + payment→order saga (P0-5/6).
- `order-execution-service` live; nightly reconciliation with drift=0.
- **Exit:** all three blockers closed; CTO GO/NO-GO gates pass.

### V1 (Months 3–7) — Domain expansion
- `network-graph-service` (relationship-edge authz + sanctions path).
- `product-registry-service`, `trade-documentation-service`, `quality-inspection-service`, `supplier-lifecycle-service` live + event-integrated.
- RLS extended to all remaining tenant schemas.
- Frontend nav: Network, Products, Trade Docs, Quality, Suppliers sections.
- Key-rotation runbook operational.
- **Exit:** five new contexts in production; doc dossier per order; supplier scorecards publishing.

### V2 (Months 7–12) — Intelligence + hardening + scale
- GraphRAG sanctions reasoning; AI command layer over graph (human-in-loop for money/title/customs).
- ClickHouse analytics + OpenSearch indexers (product/supplier/docs).
- Maker-checker (dual-control) on doc issuance + supplier blacklist; WORM audit chain.
- gRPC hot paths (graph/product); Pact contract tests across new services.
- Redis Streams → Kafka cutover; cell-based RLS sharding seam (V3 precursor).
- **Exit:** SOC2/ISO27001 control coverage for new domains; scale + AI features GA-ready.
