# GTOS — P1 Services Production-Readiness Audit (09)

> Scope: the six scaffolded services under `Backend/services/trade/`. Code review only — no regeneration.
> Verdict: **NOT production-ready.** 6 CRITICAL functional breakers, 7 HIGH, 9 MEDIUM. Three CRITICALs (C1/C2/C4) mean the services do not correctly serve a single authenticated, tenant-scoped request as written.

---

## 1. CRITICAL DEFECTS (block boot / break every request / data corruption)

### C1 — Tenant context is resolved BEFORE auth runs → every request is tenant-less
`middleware/tenant.js` `resolve()` reads `req.auth`, but `index.js` mounts `app.use(tenant)` **globally**, while `authMiddleware` runs **per-route** (in `routes/*.js`) — i.e. *after* the ALS scope is already established. At resolve time `req.auth` is `undefined`, so `tenantId` is always `null`. Result: `requireTenant` rejects every write (400), and reads run with no tenant.
- **Affects:** all six. **Files:** every `index.js` (mounts `tenant` before routes) + every `middleware/tenant.js`.
- **Fix:** resolve tenant *after* auth. Either (a) make auth global before `tenant`, or (b) have `tenant` decode/verify the token itself (as the original `trade-service/middleware/tenantContext.js` does), or (c) move `tenant` into each route chain after `authMiddleware`.

### C2 — RLS reads return ZERO rows: GUC is only set inside transactions, reads are not transactional
The GUC bridge in every `models/index.js` patches `sequelize.transaction` to `SET app.current_tenant`. But all read paths (`findAll`/`findByPk`/`findAndCountAll` in every controller) run **outside** a transaction → the GUC is never set on the pooled connection → with `FORCE ROW LEVEL SECURITY` + the `baalvion_app` role, the policy evaluates `current_tenant IS NULL` → **fail-closed → empty result set** (and stale GUC bleed across pooled connections if a prior txn left one set).
- **Affects:** product, tradedoc, quality, supplier, order-execution. **Files:** every controller read + `models/index.js`.
- **Fix:** wrap reads in `withTenantTransaction(db.sequelize, …)`, OR keep the original `trade-service` Sequelize `beforeFind` WHERE-injection hooks as the primary read filter (RLS as backstop), OR pin a per-request connection with the GUC set. Combine with C1 (no tenant → still empty).

### C3 — `trade.orders` table collision between order-execution-service and trade-service
`order-execution-service/migrations/001_init.sql` does `CREATE TABLE IF NOT EXISTS trade.orders` with `id uuid`, `lines jsonb`, new status enum. The existing `trade-service` owns `trade.orders` with `id INTEGER autoincrement`, `product/quantity/price`, different enums (`models/orders.js`). `IF NOT EXISTS` means whichever migrates first wins and the other service's model silently mismatches the live table → insert/read failures, enum violations.
- **Files:** `order-execution-service/migrations/001_init.sql`, `models/orders.js`.
- **Fix:** decide ownership. Either order-execution **reuses** the existing table (drop its `CREATE`, add only the new columns via `ALTER … ADD COLUMN IF NOT EXISTS` matching trade-service types incl. `id INTEGER`), or use a distinct table (`trade.execution_orders`). Do not ship two definitions of one table.

### C4 — Migrations cannot run as the app role; boot auto-migrate will fail
`migrate.js` uses `db.sequelize`, which `models/index.js` builds from `config.db.user` = `baalvion_app` (`NOSUPERUSER`, not owner). `ENABLE/FORCE ROW LEVEL SECURITY`, `CREATE POLICY`, `CREATE TABLE` require ownership. `index.js` also auto-runs `run()` on boot in dev. → migration errors or silently un-applied RLS.
- **Affects:** all (graph: Neo4j auth is fine, but the 5 Postgres services). **Files:** every `migrate.js`, every `index.js` (boot auto-migrate).
- **Fix:** `migrate.js` must build its own Sequelize from `MIGRATION_DB_USER`/`MIGRATION_DB_PASSWORD` (owner), not reuse the app-role connection. Remove boot-time auto-migrate in production (`bootstrapMigrations` already gates non-prod, but even dev uses the app role).

### C5 — network-graph: parameterized variable-length path bound is invalid Cypher
`graph/queries.js` `shortestPath` and `sanctionPath` use `shortestPath((a)-[*..$maxHops]-(b))`. Neo4j does **not** allow a parameter as the upper bound of a variable-length relationship — this throws `Invalid input` at runtime. Every `/paths` and `/sanctions/path/:orgId` call fails.
- **Files:** `network-graph-service/graph/queries.js`.
- **Fix:** inline a validated integer bound (`maxHops` clamped to e.g. 1–8) into the query string, or use `apoc.path.expandConfig`/`maxLevel`.

### C6 — supplier-lifecycle consumer double-counts on event redelivery (non-idempotent)
`workers/eventConsumer.js` `applyInspection`: on an existing scorecard it does `quality_kpi + 1` / `- 5`. The SDK transport is at-least-once (XAUTOCLAIM redelivery) and there is **no event-id dedup** → a redelivered `gtos.quality.inspection.completed.v1` mutates the KPI again → corrupted scorecards.
- **Files:** `supplier-lifecycle-service/workers/eventConsumer.js`.
- **Fix:** add a persistent `processed_events(event_id)` dedup table (pattern: notification-service `notif:processed:<id>` or order-execution `processed_webhooks`), check before apply; or make the fold deterministic from the full inspection set rather than incremental.

---

## 2. HIGH-RISK DEFECTS

### H1 — finance-events: dedup row committed BEFORE cascade, and 200 returned on cascade error
`order-execution-service/controller/internalController.js`: `alreadyProcessed()` inserts the `processed_webhooks` row in its own committed transaction, then `cascade()` runs separately. If `cascade` throws, the webhook is permanently marked processed and the endpoint returns `200` → Java never retries → **order never advances** (silent divergence — the exact R3 failure mode this service exists to prevent).
- **Fix:** make dedup-insert + cascade one transaction (insert dedup row inside the cascade txn), and return non-2xx on cascade failure so the sender retries. Same risk pattern applies to any future webhook consumer.

### H2 — No graceful shutdown; outbox interval + consumer + connections leak
`order-execution-service` starts `setInterval` (outbox) + an event subscription; no `SIGTERM`/`SIGINT` handler drains the publisher, unsubscribes, or closes Sequelize/Neo4j/SDK. On redeploy: in-flight outbox drains are interrupted mid-publish, subscriptions orphan in the consumer group, connections leak.
- **Affects:** all six. **Files:** every `index.js`.
- **Fix:** add a shutdown hook: `clearInterval` (publisher stop fn is already returned but discarded), `stopEventConsumer()`, `sequelize.close()` / `neo4j.close()`, then `server.close()`.

### H3 — /health/ready lies when SDK / consumer / publisher failed to start
Every `index.js` wraps SDK init + consumer/publisher start in `try { … } catch { warn 'degraded' }`, then listens anyway. `/health/ready` only checks `sequelize.authenticate()`. A service whose event consumer never started (or whose outbox publisher is dead) reports **ready** while silently dropping all event delivery.
- **Affects:** all six. **Files:** every `index.js`, `/health/ready`.
- **Fix:** track SDK/consumer/publisher state; `/health/ready` returns 503 if a required background worker is down. At minimum log at `error` and expose the state.

### H4 — No observability: no /metrics, no structured request logging
`prom-client` is in every `package.json` but unused. The baseline `trade-service` ships `middleware/metrics.js` + `/metrics` + `observability/authTrace.js`. None of the six expose metrics, request-duration histograms, or per-request structured logs (handlers never call `sdk.logger`; errors go to `console.*`). No traceId propagation into logs.
- **Affects:** all six. **Files:** add `middleware/metrics.js` + `/metrics` route + request logger; every `index.js`.

### H5 — network-graph: HTTP node/edge writes are user-exposed and weakly scoped
`POST /v1/nodes` and `POST /v1/edges` are open to any authenticated tenant member. `createEdge` (controller `createEdge`) does **no tenant scoping** of `fromId`/`toId` — a caller can link arbitrary node ids across tenants. The graph is meant to be a projection written by the consumer.
- **Files:** `network-graph-service/routes/graphRoutes.js`, `controller/graphController.js`.
- **Fix:** restrict write endpoints to an internal/admin role (or HMAC-internal only), and validate that both edge endpoints belong to the caller's `orgId` (or are global nodes like `SanctionedEntity`).

### H6 — Mass-assignment on update endpoints
`product-registry` `updateProduct` does `p.update(req.body)`; supplier/quality/tradedoc similar update/patch paths pass `req.body` largely unvalidated. A caller can set unintended columns (e.g. `org_id`, `status`, `hs_code`). RLS `WITH CHECK` blocks cross-tenant `org_id` writes (once C1/C2 fixed) but not other field tampering or status-machine bypass.
- **Files:** `product-registry-service/controller/productController.js` (`updateProduct`), plus any raw-`req.body` `.update()`.
- **Fix:** zod-validate an allowlist of mutable fields per endpoint; never spread raw body into `.update()`.

### H7 — No tests anywhere
Every `package.json` declares `"test": "jest --forceExit --runInBand"` but there are **zero** test files, no `jest.config.js`, no `tests/setup.js`. `npm test` fails. No cross-tenant probe (the P0-3 requirement), no saga test, no idempotency test.
- **Affects:** all six. **Fix:** see §4.

---

## 3. MEDIUM-RISK DEFECTS

### M1 — Missing indexes on `org_id` and FK columns (RLS predicate + join cost)
The RLS policy filters `org_id = current_setting(...)` on every row; `org_id` is unindexed on `product.products` (only `hs_code` indexed), `product.hs_doc_requirements`, all `tradedoc`/`quality`/`supplier` tables. Postgres does **not** auto-index FK columns: `tradedoc.signatures.document_id`, `quality.defects.inspection_id`, `quality.capa.inspection_id`, `supplier.qualification_docs.supplier_id`, `supplier.scorecards.supplier_id` are all unindexed → seq-scans on includes/cascades.
- **Files:** every `migrations/001_init.sql`.
- **Fix:** add `CREATE INDEX … (org_id)` per tenant table and an index on each FK column.

### M2 — Missing down migrations (rollback impossible)
Only `order-execution-service` has `001_init.down.sql`. network-graph, product, tradedoc, quality, supplier have none → no clean revert of RLS/tables.
- **Fix:** add `001_init.down.sql` per service (drop policies → `NO FORCE`/`DISABLE` → drop tables).

### M3 — Unbounded growth: `processed_webhooks`, `outbox_events` (SENT), graph `_Migration`
No retention/cleanup job for `processed_webhooks` or `SENT` outbox rows. They grow forever.
- **Fix:** scheduled prune (e.g. delete `processed_webhooks` > 30d, `SENT` outbox > 7d).

### M4 — Rate limiter is in-memory, not cluster-safe
`middleware/rateLimit.js` uses express-rate-limit's default in-memory store; per-instance counters under multiple replicas. (Baseline trade-service has the same caveat documented.)
- **Fix:** Redis store (`rate-limit-redis`) for production.

### M5 — trade-documentation "issue" persists no artifact
`documentController.issueDocument` computes checksum + `storage_key` but the `// TODO: persist snapshot to S3` is unimplemented → an "issued" document has no retrievable artifact; checksum guards nothing.
- **Files:** `trade-documentation-service/controller/documentController.js` + `config.storage`.
- **Fix:** write the snapshot to object storage before flipping to `issued`; or block issuance until storage is wired.

### M6 — No maker-checker on irreversible/regulated actions
`tradedoc` issue/void and `supplier` blacklist are single-actor. GTOS doc 05 requires dual-control on document issuance + blacklist.
- **Fix:** add an approval/second-actor gate (V2 per roadmap, but flag now).

### M7 — No cross-service HTTP client / retries
`trade-documentation` (`productRegistryUrl`) and `supplier-lifecycle` (`networkGraphUrl`, `trustScoreUrl`) declare dependencies in config but no resilient client (timeout/retry/circuit-breaker) exists. When wired, calls will be unguarded.
- **Fix:** use `sdk.http` (resilient client) when these calls are implemented.

### M8 — `emitSafe` fire-and-forget on domain mutations risks lost events
product/tradedoc/quality/supplier emit via `emitSafe` *after* commit (fail-open). A crash or bus outage between commit and publish loses the event with no outbox to recover it. Acceptable for non-critical signals but the supplier scorecard + tradedoc dossier consumers depend on them.
- **Fix:** for events that drive downstream state (quality→supplier, order→tradedoc), use the transactional outbox pattern (order-execution shows it), not `emitSafe`.

### M9 — `supplier.transition`/`blacklist` use `s.previous('stage')` after `update` (unreliable fromStage)
`emitSafe(..., { fromStage: s.previous('stage') })` is read after the in-place update; the reported `fromStage` may be the post-update value depending on Sequelize change-tracking.
- **Fix:** capture `const fromStage = s.stage` before the update.

---

## 4. REQUIRED FIXES (ordered; gate production)

| # | Fix | Defects closed | Effort |
|---|-----|----------------|--------|
| F1 | Reorder middleware: auth before tenant (or tenant decodes token) | C1 | S |
| F2 | Wrap reads in `withTenantTransaction` (or restore `beforeFind` WHERE-injection hooks) | C2 | M |
| F3 | Reconcile `trade.orders` ownership (reuse existing table or rename) | C3 | M |
| F4 | `migrate.js` connects as `MIGRATION_DB_USER`; drop boot auto-migrate under app role | C4 | S |
| F5 | Fix Cypher var-length bounds (inline clamped int / APOC) | C5 | S |
| F6 | Add `processed_events` dedup to supplier consumer; idempotent fold | C6 | S |
| F7 | finance-events: dedup+cascade in one txn; non-2xx on failure | H1 | S |
| F8 | Graceful shutdown (clear interval, unsubscribe, close pools) — all `index.js` | H2 | S |
| F9 | Readiness reflects SDK/consumer/publisher health | H3 | S |
| F10 | Add `middleware/metrics.js` + `/metrics` + request logger — all services | H4 | M |
| F11 | Restrict graph write endpoints + scope edges by tenant | H5 | S |
| F12 | Allowlist-validate update payloads (zod) | H6 | M |
| F13 | Add tests: cross-tenant probe, saga, idempotency, lifecycle SM, RLS-empty-without-context | H7 | L |
| F14 | Add `org_id` + FK indexes to every migration | M1 | S |
| F15 | Add `001_init.down.sql` per service | M2 | S |
| F16 | Retention jobs for dedup/outbox tables | M3 | S |
| F17 | Redis rate-limit store (prod) | M4 | S |
| F18 | Implement tradedoc S3 persistence (or block issue) | M5 | M |
| F19 | Outbox (not emitSafe) for state-driving domain events | M8 | M |

---

## 5. EXACT FILES TO MODIFY

**All six (cross-cutting):**
- `*/index.js` — middleware order (F1), graceful shutdown (F8), readiness (F9), metrics+logger mount (F10), remove/guard boot auto-migrate (F4).
- `*/middleware/tenant.js` — resolve after auth or self-verify token (F1).
- `*/migrate.js` — owner-role connection (F4).
- `*/migrations/001_init.sql` — `org_id` + FK indexes (F14); add `*/migrations/001_init.down.sql` (F15).
- `*/middleware/metrics.js` *(new)*, `*/middleware/rateLimit.js` (Redis store, F17).
- `*/tests/*` + `*/jest.config.js` + `*/tests/setup.js` *(new)* (F13).

**Per service:**
- `models/index.js` (product, tradedoc, quality, supplier, order-exec) — read-path tenancy strategy (F2).
- `*/controller/*Controller.js` — wrap reads (F2); allowlist update payloads (F6/H6).
- `order-execution-service/migrations/001_init.sql` + `models/orders.js` — table-collision reconciliation (F3).
- `order-execution-service/controller/internalController.js` — atomic dedup+cascade, non-2xx on failure (F7).
- `order-execution-service/services/outboxPublisher.js` — expose/stop the interval handle for F8.
- `network-graph-service/graph/queries.js` — Cypher bounds (F5).
- `network-graph-service/routes/graphRoutes.js` + `controller/graphController.js` — write authz + edge scoping (F11).
- `supplier-lifecycle-service/workers/eventConsumer.js` — dedup + idempotent fold (F6); `controller/supplierController.js` — capture `fromStage` pre-update (M9).
- `trade-documentation-service/controller/documentController.js` — S3 persistence (F18); switch order/quality-driven consumers to outbox (F19).
- `quality-inspection-service/controller/inspectionController.js` — outbox for `inspection.completed` (F19).

---

### Bottom line
The scaffolds are structurally sound and convention-correct, but **C1 + C2 together mean no tenant-scoped endpoint works as written** (writes rejected, reads empty), **C3 corrupts the order table**, **C4 blocks RLS migration**, and **C5 breaks every graph path query**. These four are must-fix before any integration testing. C6/H1 are the data-integrity defects that would pass a smoke test and fail in production. Everything in §3 is real but schedulable.
