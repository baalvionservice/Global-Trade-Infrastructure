# GTOS — P0 Implementation Tickets (08)

> Source of truth: `07-implementation-execution-plan.md`. No new architecture.
> Executable against the existing repo. Each ticket = one GitHub Issue. Paths relative to repo root.
> Verified facts: trade-service has its own `migrate.js` runner (`trade.schema_migrations`); `@baalvion/tenancy` exists with `enableRlsSql`/`withTenantTransaction`; `auth-node` HS256 access fallback at `index.js:106-112,160-161,239-241,267-269`; refresh tokens are HS256 by design and stay.

---

## TICKET P0-1 — `baalvion_app` non-superuser DB role

**Labels:** `P0` `security` `R1` `database`
**Why:** RLS is silently ignored for superusers. Services currently connect as the owning/super role, so enabling RLS (P0-2) does nothing until the connection role changes. This ticket is the precondition for all of R1.

### 1. Files to modify
- `Backend/database/migrations/027_app_role.sql` *(new — global, run as superuser)*
- `Backend/database/migrations/027_app_role.down.sql` *(new)*
- `.env` / `.env.example` of every service with `DB_USER` (start: `Backend/services/commerce/trade-service/.env*`, `commerce-service`, `order-service`, `inventory-service`, `marketplace-service`, `market-service`)
- `Backend/services/commerce/trade-service/config/appConfig.js` *(no code change — confirm `db.user` reads `DB_USER`; it does, line 49)*

### 2. Exact code changes
`Backend/database/migrations/027_app_role.sql`:
```sql
-- 027_app_role.sql — non-superuser runtime role for RLS enforcement (R1).
-- Run ONCE as a superuser/owner. Idempotent. Password injected via psql var, never committed.
--   psql "$ADMIN_DATABASE_URL" -v app_pw="$BAALVION_APP_PASSWORD" -f 027_app_role.sql
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'baalvion_app') THEN
    CREATE ROLE baalvion_app LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  ELSE
    ALTER ROLE baalvion_app NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;

ALTER ROLE baalvion_app PASSWORD :'app_pw';

-- Least-privilege grants across the app schemas (extend list per service rollout).
DO $$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['trade','commerce','orders','inventory','marketplace','market','public'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = s) THEN
      EXECUTE format('GRANT USAGE ON SCHEMA %I TO baalvion_app', s);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO baalvion_app', s);
      EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO baalvion_app', s);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO baalvion_app', s);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT USAGE, SELECT ON SEQUENCES TO baalvion_app', s);
    END IF;
  END LOOP;
END $$;

COMMIT;
```
`Backend/database/migrations/027_app_role.down.sql`:
```sql
-- Reassign owned objects before drop in real environments; dev rollback only.
DROP ROLE IF EXISTS baalvion_app;
```
`.env` change (every runtime service — migrations keep the privileged role):
```diff
- DB_USER=baalvion
- DB_PASSWORD=<privileged_pw>
+ DB_USER=baalvion_app
+ DB_PASSWORD=<baalvion_app_pw>
+ # Migrations only — privileged owner role:
+ MIGRATION_DB_USER=baalvion
+ MIGRATION_DB_PASSWORD=<privileged_pw>
```

### 3. Database migrations
The `027_app_role.sql` above. Apply via `psql` as superuser (NOT the trade-service runner — `CREATE ROLE` is cluster-global, not schema-scoped).

### 4. Tests to add
- `Backend/test/security/db-role.spec.js`:
  - Connect with each service's runtime creds → assert `SELECT current_user` = `baalvion_app`.
  - Assert `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user` → both `false`.

### 5. Rollback plan
- Revert `.env` to privileged role + restart (instant). Role can remain; it is inert until P0-2 RLS exists. `027_app_role.down.sql` only in dev.

### 6. PR breakdown
- **PR-1a:** migration + down + `db-role.spec.js`.
- **PR-1b:** `.env.example` updates + per-service `.env` cutover (one commit per service, behind deploy var).

### 7. Deployment sequence
1. Apply `027_app_role.sql` (superuser) in each environment.
2. Verify grants (`db-role.spec.js`) — role can read existing tables.
3. Flip `DB_USER` per service, restart, smoke-test reads/writes still work (no RLS yet → behaviour unchanged).

---

## TICKET P0-2 — RLS enforcement on hot schemas

**Labels:** `P0` `security` `R1` `database`
**Why:** DB-level fail-closed tenant isolation beneath the existing app-layer Sequelize scoping. Depends on **P0-1**.

### 1. Files to modify
- `Backend/services/commerce/trade-service/migrations/030_rls_tenant_isolation.sql` *(new)*
- `Backend/services/commerce/trade-service/migrations/030_rls_tenant_isolation.down.sql` *(new)*
- `Backend/services/commerce/trade-service/index.js` *(mount tenant GUC on write transactions — see note)*
- Generator script: `Backend/scripts/gen-rls-migration.js` *(new — emits `enableRlsSql` output per service)*
- Repeat migration per service: `commerce-service`, `order-service`, `inventory-service`, `marketplace-service`, `market-service`.

### 2. Exact code changes
`Backend/scripts/gen-rls-migration.js` (uses the package so policy SQL stays canonical):
```js
'use strict';
// node scripts/gen-rls-migration.js trade orders escrows shipments documents payments compliance_cases disputes wallets notifications collections
const { enableRlsSql } = require('../packages/tenancy');
const [schema, ...tables] = process.argv.slice(2);
if (!schema || !tables.length) { console.error('usage: gen-rls-migration <schema> <table...>'); process.exit(1); }
const out = ['BEGIN;', ...tables.map((t) => enableRlsSql(schema, t, { tenantColumn: 'tenant_id' })), 'COMMIT;'].join('\n\n');
process.stdout.write(out + '\n');
```
`trade-service/migrations/030_rls_tenant_isolation.sql` (generated; tenant-scoped tables only — mirrors the `TENANT_EXCLUDED` set in `models/index.js`, so `users/audit_logs/listings/rfqs/deals/quotations/messages/organizations/carriers/refresh_tokens` are NOT included):
```sql
BEGIN;
ALTER TABLE "trade"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trade"."orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "trade"."orders";
CREATE POLICY "tenant_isolation" ON "trade"."orders"
    USING (((current_setting('app.tenant_bypass', true) = 'on') OR (current_setting('app.current_tenant', true) IS NOT NULL AND current_setting('app.current_tenant', true) <> '' AND "tenant_id"::text = current_setting('app.current_tenant', true))))
    WITH CHECK (((current_setting('app.tenant_bypass', true) = 'on') OR (current_setting('app.current_tenant', true) IS NOT NULL AND current_setting('app.current_tenant', true) <> '' AND "tenant_id"::text = current_setting('app.current_tenant', true))));
-- …repeat block for: escrows, shipments, documents, payments, compliance_cases,
--    disputes, wallets, notifications, collections
COMMIT;
```
**GUC bridge (critical):** the existing ALS hooks inject WHERE clauses but do **not** set the Postgres GUC, so RLS would see no tenant and fail-closed on pooled connections. Bridge the existing `tenantContext` ALS into the GUC for transactional work. In `trade-service`, set the GUC at the start of every tenant transaction by routing writes through the package helper. Add to `index.js` after models load:
```js
const { setTenantOnTransaction } = require('@baalvion/tenancy');
const { currentTenant } = require('./middleware/tenantContext');
// Stamp the GUC on EVERY transaction opened by this service (reads + writes),
// translating the service's ALS context → the package's {tenantId,bypass} shape.
db.sequelize.addHook('afterConnect', () => {}); // no-op placeholder; GUC is per-txn, see below
const origTransaction = db.sequelize.transaction.bind(db.sequelize);
db.sequelize.transaction = function patched(optsOrFn, maybeFn) {
  const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
  const opts = typeof optsOrFn === 'function' ? undefined : optsOrFn;
  const wrapped = async (t) => {
    const ctx = currentTenant() || {};
    await setTenantOnTransaction(db.sequelize, t, { tenantId: ctx.tenantId ?? null, bypass: !!ctx.bypass });
    return fn(t);
  };
  return opts ? origTransaction(opts, wrapped) : origTransaction(wrapped);
};
```
> Read paths that do not open a transaction remain protected by the existing ALS WHERE-injection (already shipped + tested). RLS becomes the authoritative backstop for all transactional writes immediately; converting remaining hot reads to `withTenantTransaction` is tracked in P1-8.

### 3. Database migrations
Per-service generated SQL via `gen-rls-migration.js`, applied by each service's own runner (`node migrate.js` for trade) as the **migration role**, not `baalvion_app`.

### 4. Tests to add
- Covered by **P0-3** (cross-tenant probe) — that is this ticket's acceptance gate.
- `trade-service/tests/rls-guc.test.js`: open a `withTenantTransaction({tenantId:'A'})`, `INSERT` a row with `tenant_id='B'` → expect RLS `WITH CHECK` violation.

### 5. Rollback plan
- `node migrate.js down` (trade) / per-service down migration → `disableRlsSql` removes policy + `NO FORCE` + `DISABLE`. App-layer ALS scoping still protects. Revert the `transaction` patch in `index.js`.

### 6. PR breakdown
- **PR-2a:** `gen-rls-migration.js` + trade RLS migration + GUC bridge + `rls-guc.test.js`.
- **PR-2b..2f:** one PR per remaining service (commerce/order/inventory/marketplace/market), each gated by its own probe extension.

### 7. Deployment sequence
1. Deploy GUC bridge (no behaviour change without policies).
2. Apply RLS migration (migration role).
3. Run P0-3 probe → must be green before next service.
4. Repeat per service.

---

## TICKET P0-3 — Cross-tenant CI probe (blocking)

**Labels:** `P0` `security` `R1` `ci` `test`
**Why:** Regression-proof R1. A failing probe blocks merge.

### 1. Files to modify
- `Backend/services/commerce/trade-service/tests/cross-tenant-rls.test.js` *(new)*
- `Backend/test/security/cross-tenant.spec.js` *(new — shared harness)*
- `.github/workflows/ci.yml` *(add required job `security-cross-tenant`)*

### 2. Exact code changes
`trade-service/tests/cross-tenant-rls.test.js` (Jest; service already has `jest.config.js` + `tests/setup.js` + `tests/tenant-isolation.test.js` to mirror):
```js
'use strict';
const request = require('supertest');
const app = require('../index');
const { mintToken } = require('./setup'); // existing helper pattern

const A = { org: 'org-AAA', token: mintToken({ org_id: 'org-AAA', roles: ['organization_admin'] }) };
const B = { org: 'org-BBB', token: mintToken({ org_id: 'org-BBB', roles: ['organization_admin'] }) };

describe('R1 cross-tenant isolation (RLS)', () => {
  let orderB;
  beforeAll(async () => {
    const res = await request(app).post('/v1/orders')
      .set('Authorization', `Bearer ${B.token}`)
      .send({ buyer_org_id: 'org-BBB', total_value: 100, currency: 'USD' });
    orderB = res.body.data;
  });

  test('A cannot list B rows', async () => {
    const res = await request(app).get('/v1/orders').set('Authorization', `Bearer ${A.token}`);
    expect(res.status).toBe(200);
    expect((res.body.data.items || []).some((o) => o.id === orderB.id)).toBe(false);
  });

  test('A gets 404 on B id', async () => {
    const res = await request(app).get(`/v1/orders/${orderB.id}`).set('Authorization', `Bearer ${A.token}`);
    expect(res.status).toBe(404);
  });

  test('A cannot write into B tenant', async () => {
    const res = await request(app).post('/v1/payments')
      .set('Authorization', `Bearer ${A.token}`)
      .send({ order_id: orderB.id, amount: 5, currency: 'USD', tenant_id: 'org-BBB' });
    expect([403, 404]).toContain(res.status);
  });
});
```
`.github/workflows/ci.yml` (new job):
```yaml
  security-cross-tenant:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready" --health-interval 5s --health-timeout 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: psql "$ADMIN_DATABASE_URL" -v app_pw=ci_app_pw -f Backend/database/migrations/027_app_role.sql
        env: { ADMIN_DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres }
      - run: cd Backend/services/commerce/trade-service && node migrate.js
      - run: cd Backend/services/commerce/trade-service && DB_USER=baalvion_app DB_PASSWORD=ci_app_pw npm test -- cross-tenant-rls
```
Mark `security-cross-tenant` as a **required status check** on `main` + `feat/platform-foundation` (branch protection).

### 3. Database migrations
None (consumes P0-1/P0-2).

### 4. Tests to add
The probe itself. Extend `cross-tenant.spec.js` with one block per service as P0-2 rolls out.

### 5. Rollback plan
- Probe is additive; if flaky, mark non-required temporarily (documented exception) — never delete.

### 6. PR breakdown
- **PR-3a:** trade probe + CI job (non-required).
- **PR-3b:** promote to required after first green run.

### 7. Deployment sequence
CI-only. Gates P0-2 per-service completion.

---

## TICKET P0-4 — Remove HS256 access-token fallback (RS256-only)

**Labels:** `P0` `security` `R2` `auth`
**Why:** Close the HS256 islands. `auth-service` already signs RS256; `trade`/`insiders` already reject HS256. Refresh tokens stay HS256 (opaque, per-service, not cross-service) — only **access-token** HS256 verify/sign is removed.

### 1. Files to modify
- `Backend/packages/auth-node/index.js` (lines 106-112, 156-161, 232-242, 256-271)
- `Backend/services/*/config/jwt.js` for `developer`, `agent`, `tenant`, `audit`, `search`, `report` (drop `allowHs256Fallback`/`JWT_ALLOW_HS256_FALLBACK`)
- `Backend/services/identity/rbac-service/config/jwt.js` (prod guard)
- `.env.example` everywhere referencing `JWT_ALLOW_HS256_FALLBACK` (delete the line)

### 2. Exact code changes
`auth-node/index.js` — make RS256 mandatory for access verification, keep refresh HS256:
```diff
@@ default fallback (lines ~106-112)
-  const hs256FallbackDefault = env !== 'production';
-  const allowHs256Fallback =
-    opts.allowHs256Fallback != null
-      ? opts.allowHs256Fallback
-      : (process.env.JWT_ALLOW_HS256_FALLBACK
-          ? process.env.JWT_ALLOW_HS256_FALLBACK === 'true'
-          : hs256FallbackDefault);
+  // R2: HS256 access tokens are permanently disabled. Refresh tokens remain HS256.
+  const allowHs256Fallback = false;
@@ start-up guard (lines ~156-158)
-  if (!canIssueRs256 && env === 'production' && requireRs256InProduction && !allowHs256Fallback) {
-    throw new Error('[auth-node] RS256 keys missing and HS256 fallback disabled — refusing to start in production');
-  }
+  if (!canVerifyRs256) {
+    throw new Error('[auth-node] R2: no RS256 public key configured — refusing to start (HS256 access tokens are disabled)');
+  }
@@ generateAccessToken (lines ~232-242)
   function generateAccessToken(payload) {
     const claims = buildClaims(payload);
-    if (canIssueRs256) {
-      return jwt.sign(claims, privatePem, {
-        algorithm: 'RS256', keyid: ACTIVE_KID, expiresIn: accessExpiresIn, issuer: ISSUER, audience: AUDIENCE,
-      });
-    }
-    const hsOpts = { algorithm: 'HS256', expiresIn: accessExpiresIn };
-    if (opts.hs256IncludeIssuerAudience) { hsOpts.issuer = ISSUER; hsOpts.audience = AUDIENCE; }
-    return jwt.sign(claims, accessSecret, hsOpts);
+    if (!canIssueRs256) throw new Error('[auth-node] R2: RS256 private key required to issue access tokens');
+    return jwt.sign(claims, privatePem, {
+      algorithm: 'RS256', keyid: ACTIVE_KID, expiresIn: accessExpiresIn, issuer: ISSUER, audience: AUDIENCE,
+    });
   }
@@ verifyAccessToken (lines ~256-271)
   function verifyAccessToken(token) {
     const header = (jwt.decode(token, { complete: true }) || {}).header || {};
-    if (canVerifyRs256 && header.alg === 'RS256') {
+    if (header.alg !== 'RS256') throw new Error('[auth-node] R2: only RS256 access tokens are accepted');
+    {
       const pem = publicKeys[header.kid] || publicKeys[ACTIVE_KID];
       if (!pem) throw new Error('Unknown token key id');
       const vo = { algorithms: ['RS256'] };
       if (verifyIssuer) vo.issuer = verifyIssuer;
       if (verifyAudience) vo.audience = verifyAudience;
       return normalize(jwt.verify(token, pem, vo));
     }
-    if (hs256Allowed() && (!header.alg || header.alg === 'HS256')) {
-      return normalize(jwt.verify(token, accessSecret, { algorithms: ['HS256'] }));
-    }
-    throw new Error('Unsupported or untrusted token algorithm');
   }
```
> Keep `verifyRefreshToken`/`generateRefreshToken` (HS256) unchanged — refresh secrets are per-service and never verified cross-service. `hs256Allowed`/`disableRs256` paths and `accessSecret` for access are now dead; remove `hs256Allowed` and the `accessSecret`-based access branches; leave `refreshSecret` intact.

Soft-state service `config/jwt.js` (×6) — drop the fallback option:
```diff
- allowHs256Fallback: process.env.JWT_ALLOW_HS256_FALLBACK === 'true',
```

### 3. Database migrations
None.

### 4. Tests to add
- `Backend/packages/auth-node/test/rs256-only.test.js`:
  - HS256-signed access token → `verifyAccessToken` throws.
  - `alg:none` token → throws.
  - Valid RS256 → passes.
  - `createAuthServer` with no public key → throws on construct.
- Integration: HS256 bearer → `401` against `developer/agent/tenant/audit/search/report` + gateway.

### 5. Rollback plan
- Single-package revert (`git revert` PR-4a) restores fallback; redeploy `auth-node` consumers. Because tokens in flight are already RS256, rollback risk is low.

### 6. PR breakdown
- **PR-4a:** `auth-node` core change + `rs256-only.test.js`.
- **PR-4b:** remove `allowHs256Fallback` from 6 services + rbac guard + `.env.example`.
- **PR-4c:** delete `JWT_ALLOW_HS256_FALLBACK` from deploy manifests.

### 7. Deployment sequence
1. Deploy PR-4a (`auth-node`) — verifiers reject HS256; issuers already RS256.
2. Deploy PR-4b service-by-service; watch `401` rate (expect ~0 — no HS256 issuers remain).
3. Deploy gateway last. Remove env (PR-4c).

---

## TICKET P0-5 — Transactional outbox + persistent webhook idempotency

**Labels:** `P0` `consistency` `R3` `trade-service`
**Why:** Make order+payment+event atomic; survive crashes; stop in-memory dedup loss. Depends on P0-1/P0-2 (transactions now set the tenant GUC).

### 1. Files to modify
- `Backend/services/commerce/trade-service/migrations/031_outbox_idempotency.sql` *(new)* + `.down.sql`
- `Backend/services/commerce/trade-service/models/outbox_events.js` *(new)*
- `Backend/services/commerce/trade-service/models/processed_webhooks.js` *(new)*
- `Backend/services/commerce/trade-service/models/index.js` (register both)
- `Backend/services/commerce/trade-service/controller/paymentController.js` (`createPayment` → transactional)
- `Backend/services/commerce/trade-service/controller/internalController.js` (DB-backed dedup)
- `Backend/services/commerce/trade-service/services/outboxPublisher.js` *(new — scheduled drain)*
- `Backend/services/commerce/trade-service/index.js` (start publisher)

### 2. Exact code changes
`migrations/031_outbox_idempotency.sql`:
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS trade.outbox_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id   text NOT NULL,
  event_type     text NOT NULL,
  payload        jsonb NOT NULL,
  status         text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','FAILED')),
  attempts       int  NOT NULL DEFAULT 0,
  available_at   timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  sent_at        timestamptz
);
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON trade.outbox_events (status, available_at);

CREATE TABLE IF NOT EXISTS trade.processed_webhooks (
  webhook_id   text PRIMARY KEY,
  event_type   text NOT NULL,
  payload_hash text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- R3 money/order linkage constraints (additive; payments.order_id already exists).
ALTER TABLE trade.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','pending','confirmed','failed','refunded'));
COMMIT;
```
`models/outbox_events.js`:
```js
'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('OutboxEvent', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  tenant_id: { type: DataTypes.TEXT, allowNull: false },
  aggregate_type: { type: DataTypes.TEXT, allowNull: false },
  aggregate_id: { type: DataTypes.TEXT, allowNull: false },
  event_type: { type: DataTypes.TEXT, allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING','SENT','FAILED'), defaultValue: 'PENDING' },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  available_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  sent_at: { type: DataTypes.DATE },
}, { schema: 'trade', tableName: 'outbox_events', underscored: true, timestamps: true, updatedAt: false });
```
`models/processed_webhooks.js`:
```js
'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('ProcessedWebhook', {
  webhook_id: { type: DataTypes.TEXT, primaryKey: true },
  event_type: { type: DataTypes.TEXT, allowNull: false },
  payload_hash: { type: DataTypes.TEXT, allowNull: false },
  processed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { schema: 'trade', tableName: 'processed_webhooks', underscored: true, timestamps: false });
```
`models/index.js` — register + exclude from blunt scoping (outbox/dedup are infra, tenant carried explicitly):
```diff
  db.InsuranceClaim  = require('./insurance_claims')(sequelize, Sequelize.DataTypes);
+ db.OutboxEvent     = require('./outbox_events')(sequelize, Sequelize.DataTypes);
+ db.ProcessedWebhook= require('./processed_webhooks')(sequelize, Sequelize.DataTypes);
@@ TENANT_EXCLUDED
-    'RefreshToken',
+    'RefreshToken',
+    'OutboxEvent', 'ProcessedWebhook',
```
`controller/paymentController.js` — wrap row + outbox in one transaction (GUC set by the P0-2 patch); finance call moves AFTER commit:
```diff
- const { initiatePayment, refFromInitiate } = require('../lib/financeClient');
+ const { initiatePayment, refFromInitiate } = require('../lib/financeClient');
+ const db = require('../models');
@@ createPayment
-        // Local projection row (fast UI reads; reconciled by the finance-events webhook).
-        const payment = await db.Payment.create({ ...body, ...(tenantId ? { tenant_id: tenantId } : {}) });
+        // Atomic: payment row + outbox event commit together (R3).
+        const payment = await db.sequelize.transaction(async (t) => {
+            const p = await db.Payment.create(
+                { ...body, ...(tenantId ? { tenant_id: tenantId } : {}) }, { transaction: t });
+            await db.OutboxEvent.create({
+                tenant_id: tenantId || 'unknown',
+                aggregate_type: 'payment', aggregate_id: String(p.id),
+                event_type: 'gtos.payment.created.v1',
+                payload: { paymentId: p.id, orderId: p.order_id, amount: p.amount, currency: p.currency },
+            }, { transaction: t });
+            return p;
+        });
@@ keep finance.enabled block, but it now runs post-commit; on failure update metadata (unchanged)
```
`controller/internalController.js` — replace in-memory dedup (lines 20-31, 87-93):
```diff
- const seen = new Map();
- const SEEN_MAX = 5000;
- function alreadyProcessed(id) { ... }
+ async function alreadyProcessed(webhookId, eventType, raw) {
+   if (!webhookId) return false;
+   const hash = crypto.createHash('sha256').update(raw).digest('hex');
+   try {
+     await runAs({ bypass: true }, () => db.ProcessedWebhook.create({ webhook_id: webhookId, event_type: eventType, payload_hash: hash }));
+     return false; // inserted → first time
+   } catch (e) {
+     if (e.name === 'SequelizeUniqueConstraintError') return true; // already processed
+     throw e;
+   }
+ }
@@ financeEvents
- if (alreadyProcessed(webhookId)) return res.status(200).json({ ok: true, deduped: true, event: eventType });
+ const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
+ if (await alreadyProcessed(webhookId, eventType, raw)) return res.status(200).json({ ok: true, deduped: true, event: eventType });
```
`services/outboxPublisher.js` (drains to the platform bus via existing `@baalvion/sdk`/realtime seam):
```js
'use strict';
const db = require('../models');
const { runAs } = require('../middleware/tenantContext');
const POLL_MS = Number(process.env.OUTBOX_POLL_MS || 2000);
const BATCH = 50;
async function drainOnce(publish) {
  return runAs({ bypass: true }, async () => {
    const rows = await db.OutboxEvent.findAll({
      where: { status: 'PENDING' }, order: [['available_at','ASC']], limit: BATCH,
    });
    for (const ev of rows) {
      try {
        await publish(ev.event_type, { ...ev.payload, _eventId: ev.id, _tenantId: ev.tenant_id });
        await ev.update({ status: 'SENT', sent_at: new Date() });
      } catch (e) {
        await ev.update({ attempts: ev.attempts + 1, available_at: new Date(Date.now() + 1000 * 2 ** Math.min(ev.attempts, 6)),
          status: ev.attempts + 1 >= 10 ? 'FAILED' : 'PENDING' });
      }
    }
  });
}
function startOutboxPublisher(publish) {
  const timer = setInterval(() => drainOnce(publish).catch((e) => console.error('[outbox]', e.message)), POLL_MS);
  timer.unref();
  return () => clearInterval(timer);
}
module.exports = { startOutboxPublisher, drainOnce };
```

### 3. Database migrations
`031_outbox_idempotency.sql` via `node migrate.js`. RLS on the two infra tables is **not** applied (tenant carried in-column; publisher runs `bypass`).

### 4. Tests to add
- `tests/outbox-atomicity.test.js`: force `OutboxEvent.create` to throw → assert `Payment` row also absent (rollback).
- `tests/webhook-idempotency.test.js`: POST same `X-Webhook-Id` twice → second returns `deduped:true`; row applied once. Restart sim (new process, same DB) → still deduped.
- `tests/outbox-publisher.test.js`: seed PENDING → `drainOnce(spy)` → `SENT`, publish called once; failing publish → backoff + FAILED after 10.

### 5. Rollback plan
- `node migrate.js down` drops tables + `payment_status` col. Revert controller PRs → `createPayment` reverts to pre-txn insert, dedup reverts to in-memory. Outbox rows are inert if publisher stopped.

### 6. PR breakdown
- **PR-5a:** migration + 2 models + index registration.
- **PR-5b:** `createPayment` transactional + atomicity test.
- **PR-5c:** DB-backed webhook dedup + idempotency test.
- **PR-5d:** outbox publisher + wiring + test.

### 7. Deployment sequence
1. PR-5a (tables) → 2. PR-5c (dedup, safe alone) → 3. PR-5b (transactional create) → 4. PR-5d (publisher). Verify crash-between-write test in staging.

---

## TICKET P0-6 — Payment → Order saga cascade

**Labels:** `P0` `consistency` `R3` `trade-service`
**Why:** Java `payments.transaction.*` events currently update only `trade.payments`; `trade.orders` never advances. Cascade payment terminal states onto the linked order, atomically + idempotently. Depends on P0-5 (persistent dedup, `payment_status` column).

### 1. Files to modify
- `Backend/services/commerce/trade-service/controller/internalController.js` (`applyPaymentProjection` → also update order, in one txn)
- `Backend/services/commerce/trade-service/services/orderSaga.js` *(new — state-transition rules)*
- `Backend/services/commerce/trade-service/migrations/032_order_saga_state.sql` *(new)* + `.down.sql`
- `Backend/services/commerce/trade-service/models/order_saga_state.js` *(new)* + index registration
- `Backend/services/commerce/trade-service/tests/payment-order-saga.test.js` *(new)*

### 2. Exact code changes
`migrations/032_order_saga_state.sql`:
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS trade.order_saga_state (
  order_id   text PRIMARY KEY,
  tenant_id  text NOT NULL,
  state      text NOT NULL,
  last_event text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
```
`services/orderSaga.js` (pure mapping — no I/O, unit-testable):
```js
'use strict';
// Maps a terminal payment event → (order.payment_status, order.status, saga.state).
const MAP = {
  'payments.transaction.completed': { payment_status: 'confirmed', order_status: 'payment_confirmed', state: 'PAYMENT_CONFIRMED' },
  'payments.transaction.failed':    { payment_status: 'failed',    order_status: null,                 state: 'FAILED' },
  'payments.transaction.reversed':  { payment_status: 'refunded',  order_status: null,                 state: 'COMPENSATING' },
};
function orderTransitionFor(eventType) { return MAP[eventType] || null; }
module.exports = { orderTransitionFor };
```
`controller/internalController.js` — extend the projection to cascade in one transaction:
```diff
+ const { orderTransitionFor } = require('../services/orderSaga');
@@ applyPaymentProjection — replace the single-row save with a txn that also advances the order
   return runAs({ bypass: true }, async () => {
-     const payment = await db.Payment.findOne({ where: { provider_tx_id: String(ref) } });
-     if (!payment) return { matched: false, ref };
-     payment.status = status;
-     if (status === 'completed' && !payment.settled_at) payment.settled_at = new Date();
-     payment.metadata = { ...(payment.metadata || {}), lastFinanceEvent: eventType, financeUpdatedAt: new Date().toISOString() };
-     await payment.save();
-     return { matched: true, ref, paymentId: payment.id, status };
+     return db.sequelize.transaction(async (t) => {
+       const payment = await db.Payment.findOne({ where: { provider_tx_id: String(ref) }, transaction: t });
+       if (!payment) return { matched: false, ref };
+       payment.status = status;
+       if (status === 'completed' && !payment.settled_at) payment.settled_at = new Date();
+       payment.metadata = { ...(payment.metadata || {}), lastFinanceEvent: eventType, financeUpdatedAt: new Date().toISOString() };
+       await payment.save({ transaction: t });
+
+       const tr = orderTransitionFor(eventType);
+       if (tr && payment.order_id != null) {
+         const order = await db.Order.findByPk(payment.order_id, { transaction: t });
+         if (order) {
+           order.payment_status = tr.payment_status;
+           if (tr.order_status) order.status = tr.order_status;
+           await order.save({ transaction: t });
+           await db.OrderSagaState.upsert({
+             order_id: String(order.id), tenant_id: order.tenant_id || payment.tenant_id || 'unknown',
+             state: tr.state, last_event: eventType, updated_at: new Date(),
+           }, { transaction: t });
+         }
+       }
+       return { matched: true, ref, paymentId: payment.id, status, orderAdvanced: !!tr };
+     });
   });
```
> Idempotency is already guaranteed upstream by P0-5's `processed_webhooks` (the handler short-circuits before projection on replay). The terminal-state writes are themselves idempotent (re-applying `confirmed` is a no-op), so even a same-txn retry is safe.

`models/index.js`:
```diff
+ db.OrderSagaState = require('./order_saga_state')(sequelize, Sequelize.DataTypes);
@@ TENANT_EXCLUDED add 'OrderSagaState'
```

### 3. Database migrations
`032_order_saga_state.sql` via `node migrate.js`.

### 4. Tests to add
- `tests/order-saga.unit.test.js`: `orderTransitionFor` mapping table (pure).
- `tests/payment-order-saga.test.js`: seed order+payment(`provider_tx_id`); POST signed `payments.transaction.completed` webhook → order.`payment_status='confirmed'`, `status='payment_confirmed'`, saga row `PAYMENT_CONFIRMED`. Replay same webhook id → no double-apply (dedup). `failed`/`reversed` paths.

### 5. Rollback plan
- `node migrate.js down` drops `order_saga_state`. Revert controller PR → projection reverts to payment-only update. Orders already advanced stay advanced (forward-only, safe).

### 6. PR breakdown
- **PR-6a:** migration + model + `orderSaga.js` + unit test.
- **PR-6b:** internalController cascade + saga integration test.

### 7. Deployment sequence
1. After P0-5 in staging. 2. PR-6a (schema + pure logic). 3. PR-6b (cascade). 4. Replay a known Java payment event in staging → confirm order advances + idempotent. 5. Enable reconciliation (P1-2) to assert drift=0.

---

## P0 GLOBAL DEPLOYMENT ORDER

```
P0-1 (role) ─► P0-2 (RLS + GUC bridge) ─► P0-3 (probe, blocking) ──┐
                                                                    ├─► production unblock gate
P0-4 (RS256-only) ───────────────────────────────────────────────-┤
P0-5 (outbox + dedup) ─► P0-6 (saga cascade) ─► reconciliation ───-┘
```
- P0-1→2→3 are strictly sequential (R1).
- P0-4 is independent — can run in parallel with the R1 track.
- P0-5→6 are sequential (R3); P0-5 depends on P0-1/2 (transactions set the GUC).
- **Gate:** all six green + cross-tenant probe required + zero HS256 `401` anomalies + staging reconciliation drift=0 → production GO.
