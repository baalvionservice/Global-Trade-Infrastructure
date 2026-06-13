# 07 — Production-Readiness: The Money Spine (Code-Grounded)

> **Scope:** This document grades the GTOS order→money spine against the **actual source tree**, not the design intent.
> Every ✅ IMPLEMENTED claim cites a real file. Lower-confidence platform facts are marked
> `[from project knowledge, NOT verified in this pass]`.
> **Companion docs:** [00-MASTER-BLUEPRINT-AND-CTO-VERDICT.md](00-MASTER-BLUEPRINT-AND-CTO-VERDICT.md) ·
> [01-gap-report-and-microservices.md](01-gap-report-and-microservices.md) ·
> [03-data-ddd-db-events.md](03-data-ddd-db-events.md) ·
> [08-p0-implementation-tickets.md](08-p0-implementation-tickets.md) ·
> [09-p1-services-readiness-audit.md](09-p1-services-readiness-audit.md)
>
> Anchor service under examination: `Backend/services/trade/order-execution-service` (**OES**, schema `oms`).

**Legend:** ✅ IMPLEMENTED (cite) · 🟡 DESIGNED (stub/partial) · ❌ MISSING · 🔌 INTEGRATION-REQUIRED (real code, not wired to a real external system)

---

## 1. Executive verdict

**NOT production-money-ready.** The integrity scaffolding is real and unit-tested; the money rail is not.

1. ✅ **Real today:** server-computed money truth (subtotal+duty+tax+FX, client total ignored), a fail-closed sanctions gate that runs *before* any money row is written, a forward-only order saga, a transactional outbox + inbox-idempotency, and detection-only reconciliation — all pure and unit-tested.
2. ✅ **Real today (Java):** a double-entry ledger with idempotent journal posting and a transactional outbox to Kafka.
3. 🔌 **Simulated, NOT real:** payment **completion** is produced by [`workers/paymentSimulator.js`](../../../../../Backend/services/trade/order-execution-service/workers/paymentSimulator.js) — there is **no real PSP / payment rail**. The order→paid loop closes on a synthetic `payments.transaction.completed` event.
4. ❌ **Absent for regulated go-live:** real sanctions list data, KYC/IDV, customs filing, e-B/L (MLETR), carrier tracking, money-transmission licensing.
5. **Bottom line:** the *mechanics* of financial integrity are proven in code; the *trusted external counterparties* (bank, screening vendor, customs, carrier) are all still seams.

---

## 2. System decomposition — 7 domains

| # | Domain | Owning code | Grade | Evidence |
|---|--------|-------------|-------|----------|
| 1 | **Money truth** (pricing/duty/tax/FX) | OES `services/pricing.js`, `tax.js`, `providers/fx.js` | ✅ IMPLEMENTED | Pure, deterministic, unit-tested; client total never trusted |
| 2 | **Counterparty screening** (R8) | OES `services/counterpartyScreening.js` + `screeningPolicy.js` + `sanctionsClient.js` | ✅ gate / 🔌 data | Fail-closed hard gate in code; **calls `risk-service`** for verdicts, watchlist data is the seam |
| 3 | **Order lifecycle / saga** | OES `services/orderSaga.js`, `workers/eventConsumer.js` | ✅ IMPLEMENTED | Forward-only `ORDER_FLOW`, terminal `PAYMENT_TRANSITIONS` cascade |
| 4 | **Payment initiation** | OES `services/paymentClient.js` → `payment-service` | 🔌 INTEGRATION-REQUIRED | Real HTTP client; downstream completion is **simulated** |
| 5 | **Settlement ledger** (double-entry) | Java `ledger-service/LedgerService.java` | ✅ posting / 🟡 invariant | Idempotent 2-leg journal + outbox; **no global Σlegs==0 validation** |
| 6 | **Reliability** (outbox/inbox/redrive/reconcile) | OES `services/outboxPublisher.js`, `reconciliation.js`, `leaderLock.js`, `workers/outboxRedrive.js`, `models/processed_webhooks.js` | ✅ IMPLEMENTED | Transactional outbox + inbox + leader-guarded redrive + drift sweep |
| 7 | **Payment rail / PSP** | `workers/paymentSimulator.js` | ❌ real rail MISSING | Env-gated DEV simulator; **no real bank/PSP integration** |

### Service tree context (verified directory layout)

- **Node** `commerce/*`: commerce, order, payment, ledger, fulfillment, inventory, market, trade-service
- **Node** `trade/*`: **order-execution** (this doc), product-registry, supplier-lifecycle, quality-inspection, trade-documentation, network-graph
- **Node** `identity/*`: auth-gateway, auth-service, oauth, rbac, session
- **Node** `infrastructure/*`: audit, notification, proxy, realtime, report, search
- **Node** `platform/*`: admin, dashboard, realtime, tenant
- **Java** `financial-services-java/*`: account, aml, audit, common-security, credit, deal-room, dispute, escrow, fx, **ledger**, payment-rails, payment, reconciliation, reporting, **risk**, settlement, smart-contract, trade-finance, trade-intelligence, trust-score, wallet
  - **Note:** there is **no `sanctions-service` dir** — sanctions screening lives inside **`risk-service`** (`POST /api/v1/sanctions/screen`).

---

## 3. Architecture diagram — the verified money path

```text
  CLIENT (untrusted: any total[] it sends is IGNORED)
    │  POST /trade/v1/orders   [gateway → :3052  — from project knowledge, NOT verified in this pass]
    ▼
┌───────────────────────────── order-execution-service (schema: oms) ─────────────────────────────┐
│                                                                                                  │
│  (1) FAIL-CLOSED SANCTIONS GATE  ── BEFORE any money-truth row is written ──                      │
│      counterpartyScreening.screenCounterparties({tenantId, parties})                              │
│        → sanctionsClient.screen()  ──HTTP──►  risk-service  POST /api/v1/sanctions/screen         │
│        → screeningPolicy.decide({blockOnPotential, failOpen=false})                               │
│        decision = BLOCK  if CONFIRMED_MATCH | POTENTIAL_MATCH | (engine error && !failOpen)       │
│        ── BLOCK ⇒ order is refused; NO money row, NO saga row, NO outbox row ──                   │
│                                                                                                  │
│  (2) SERVER MONEY TRUTH (pure)                                                                    │
│      pricing.computeOrderPricing(): subtotal = Σ round2(qty×price)                                │
│        tax.computeLineTaxes(): duty on goods value, import VAT on (value+duty), per HS chapter    │
│        totalValue = round2(subtotal+duty+tax)                                                     │
│        fx = providers/fx.getRate()  (Frankfurter/ECB live, static fallback, SSRF-allowlisted)     │
│        baseCurrencyAmount = round2(totalValue × fx)   ──►  persisted on oms.orders                │
│                                                                                                  │
│  (3) SAGA (forward-only)  orderSaga.ORDER_FLOW: draft→placed→payment_confirmed→…→closed           │
│                                                                                                  │
│  (4) TRANSACTIONAL OUTBOX  ── money row + outbox row committed in ONE tx ──                       │
│      oms.outbox_events(PENDING)  ──outboxPublisher.drainOnce──►  sdk.events.publish               │
│        emits  gtos.order.payment_requested.v1                                                     │
└──────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                            │ paymentClient.initiate()  ──HTTP──►
                                            ▼
                              payment-service  POST /api/v1/payments/initiate
                              { idempotencyKey, sourceAccountId, destinationAccountId,
                                amount, currency, paymentScheme }
                                            │  (Java drives Kafka choreography)
                                            ▼
                              ┌──────────────── Kafka ────────────────┐
                              │  PaymentInitiatedListener (ledger)     │
                              │  EscrowEventListener      (ledger)     │
                              └──────────────────┬─────────────────────┘
                                                 ▼
                              ledger-service  LedgerService.postEntry()
                                DOUBLE ENTRY: 1 debit acct / 1 credit acct
                                idempotent by (tenant, transactionRef)
                                ── enqueueOutbox → LedgerOutboxRelay → Kafka
                                   ledger.entry.posted / ledger.entry.reversed ──
                                                 │
                  signed finance-events webhook  │ keyed by idempotencyKey
                  (inbox dedupe: oms.processed_webhooks)
                                                 ▼
                       OES eventConsumer / webhook → saga advance
                       payments.transaction.completed
                         ⇒ payment_status=confirmed, status=payment_confirmed, state=PAYMENT_CONFIRMED

  ┌─────────── DETECTION-ONLY LOOP (never mutates money) ───────────┐
  │ reconciliation.reconcileOnce()  every RECONCILE_POLL_MS          │
  │   MONEY_TRUTH_DRIFT | FX_DRIFT | SAGA_DRIFT | STATE_DRIFT        │
  │   + stuck/failed outbox  → emit oms.order.reconciliation.drift.v1│
  │   leader-guarded (pg advisory lock 521001) — one replica sweeps  │
  └─────────────────────────────────────────────────────────────────┘

  ⚠ DEV ONLY: paymentSimulator.js (PAYMENT_SIMULATOR=true) subscribes gtos.order.>
     and publishes payments.transaction.completed itself — NO real rail.
```

---

## 4. Data + event flow model

### 4.1 `oms` schema (verified from models)

**`oms.orders`** — every money figure is **server-computed**, never client-supplied
([`models/orders.js`](../../../../../Backend/services/trade/order-execution-service/models/orders.js)):

| Column | Type | Role |
|--------|------|------|
| `id` | UUID PK | order id |
| `tenant_id` | TEXT (not null) | tenancy stamp |
| `deal_id`, `buyer_org_id`, `seller_org_id` | TEXT | party refs (ID, not FK) |
| `lines` | JSONB | order lines (qty, unit_price, hs_code) |
| `subtotal`, `duty_amount`, `tax_amount`, `total_value` | DECIMAL(20,2) | money truth (order currency) |
| `currency`, `base_currency` | STRING(10) | quote + platform base |
| `base_currency_amount` | DECIMAL(20,2) | `round2(total_value × fx)` |
| `fx_rate_used` | DECIMAL(18,8) | rate persisted for audit |
| `destination_country` | STRING(2) | drives duty/VAT |
| `status` | ENUM | `draft…closed/cancelled` (forward-only) |
| `payment_status` | ENUM | `unpaid/pending/confirmed/failed/refunded` |

**`oms.order_saga_state`** — `order_id` PK, `state`, `last_event`, `tenant_id`
([`models/order_saga_state.js`](../../../../../Backend/services/trade/order-execution-service/models/order_saga_state.js)).

**`oms.outbox_events`** — `id` UUID PK, `event_type`, `payload` JSONB, `status ENUM(PENDING,SENT,FAILED)`, `attempts`, `available_at`, `last_error`, `sent_at`
([`models/outbox_events.js`](../../../../../Backend/services/trade/order-execution-service/models/outbox_events.js)).

**`oms.processed_webhooks`** (inbox) — `webhook_id` PK, `event_type`, `payload_hash`, `processed_at`
([`models/processed_webhooks.js`](../../../../../Backend/services/trade/order-execution-service/models/processed_webhooks.js)).

### 4.2 Ledger journal (Java, verified from `LedgerService.java`)

Per `JournalEntry`: `tenantId`, `transactionRef`, **`debitAccountId` / `creditAccountId`** (single leg each), `amount`, `currency`, `entryType`, `status` (`POSTED`/`REVERSED`), `postedAt`, `relatedTransactionId` (reversal link).

- **Idempotent:** `findByTenantAndTransactionRef` short-circuits a duplicate post.
- **Reversal mirrors legs:** swaps debit/credit, marks original `REVERSED`.
- **Balance:** `getAccountBalance` = `Σdebits − Σcredits` per account.
- **⚠ LIMITATION:** entries are **2-leg only** (one debit account, one credit account). There is **no multi-leg balanced-journal validation**, and the `balanced` flag on `AccountBalanceResponse` is a **per-account report** (debits==credits *for that account*), **NOT a global Σlegs==0 invariant** across the journal.

### 4.3 Money-truth invariant equations (enforced by `reconciliation.checkOrder`)

```text
MONEY_TRUTH_DRIFT  ⇔  | total_value − round2(subtotal + duty_amount + tax_amount) | > 0.01
FX_DRIFT           ⇔  | base_currency_amount − round2(total_value × fx_rate_used) | > 0.01
SAGA_DRIFT         ⇔  payment_status='confirmed'  AND  saga.state ≠ 'PAYMENT_CONFIRMED'
STATE_DRIFT        ⇔  payment_status='confirmed'  AND  order.status ∉ POST_PAYMENT_STATES
```
Reconciliation is **detection-only** — it logs + emits `oms.order.reconciliation.drift.v1`; it **never auto-corrects** money (server-computed figures that don't reconcile mean a bug or tampering for a human to resolve).

### 4.4 The THREE idempotency layers (all verified)

| Layer | Key | Where | Purpose |
|-------|-----|-------|---------|
| 1 — Payment initiation | `idempotencyKey` | `paymentClient.initiate()` → payment-service | one order ⇒ one payment, even on retry |
| 2 — Ledger posting | `(tenant, transactionRef)` | `LedgerService.postEntry()` | one transactionRef ⇒ one journal entry |
| 3 — Webhook inbox | `oms.processed_webhooks(webhook_id, payload_hash)` | OES webhook handler | one completion ⇒ one saga advance |

Plus **outbox dedupe** downstream via `_eventId` injected on every publish (`outboxPublisher` / `outboxRedrive`).

---

## 5. Production-readiness gap table

| Domain | Grade | The hard gap |
|--------|-------|--------------|
| Money truth | ✅ | None in logic. Duty/VAT schedules in `tax.js` are **representative defaults**, NOT live national tariffs — must sync from an authoritative source. |
| FX | ✅ / 🔌 | Real live source (Frankfurter/ECB) + static fallback + circuit breaker. Gap: no enterprise-grade rate vendor / no rate-of-record contract. |
| Sanctions gate | ✅ / 🔌 | Gate logic is fail-closed and correct. Gap: `risk-service` needs a **real sanctions list** (OFAC/EU/UN/HMT) with refresh + audit, not a mock watchlist. |
| Saga | ✅ | Forward-only + cascade verified. Gap: compensation paths (`reversed`→`COMPENSATING`) defined but the refund/unwind flow is not exercised end-to-end with a real rail. |
| Payment initiation | 🔌 | Real HTTP client + idempotency key. Gap: completion is **simulated** — no real PSP. |
| Ledger | ✅ / 🟡 | Idempotent double-entry + outbox→Kafka. Gap: **no global balanced-journal (Σlegs==0) invariant**; 2-leg only. |
| Reliability | ✅ | Outbox + inbox + leader-guarded redrive + drift sweep all present and tested. |
| Real rail / PSP | ❌ | No bank/PSP integration. `paymentSimulator.js` stands in. |
| Tenancy / RLS | 🟡 | `[from project knowledge, NOT verified in this pass]` baalvion_app role + FORCE RLS on 16 tables + GUC bridge; **read-path GUC cutover still GATED.** |
| Auth (R2) | 🟡 | `[from project knowledge, NOT verified in this pass]` RS256 closed, HS256 islands eliminated. |
| Gateway route | 🟡 | `[from project knowledge, NOT verified in this pass]` `/trade/v1/orders → :3052`. |
| KYC / IDV, customs, e-B/L, carrier tracking, MTL | ❌ | None present — see §7. |

---

## 6. Known integrity issues remediated **this session**

These three were the reliability holes in the money spine. **All three now have landed code** (verified in tree); they are marked *remediation completed this session* rather than aspirational.

**(a) Ledger Kafka publish-swallow → transactional outbox** ✅
The previous fire-and-forget `kafkaTemplate.send` swallowed async failures (an entry could commit without its event ever reaching Kafka). Now `LedgerService.enqueueOutbox()` persists a `LedgerOutbox` row **in the same transaction** as the journal entry, and a separate `LedgerOutboxRelay` publishes synchronously with retry. Serialization failure throws → the whole transaction rolls back, so **an entry can never commit without its outbox event**.
Evidence: [`LedgerService.java`](../../../../../Backend/services/commerce/financial-services-java/ledger-service/src/main/java/com/baalvion/ledger/service/LedgerService.java) (`enqueueOutbox`, lines ~43–63, 97, 156).

**(b) OES outbox detection-without-redrive → redrive worker** ✅
`reconciliation.js` only *detected* stuck-`PENDING` / parked-`FAILED` rows; nothing ever retried them. New [`workers/outboxRedrive.js`](../../../../../Backend/services/trade/order-execution-service/workers/outboxRedrive.js) claims eligible rows with `FOR UPDATE SKIP LOCKED` + a forward lease, re-publishes through the **existing** `sdk.events.publish` path (never a second bus), bounded-backoff retries, and emits `oms.outbox.redrive.exhausted.v1` past the attempt cap. Money-safe: it only re-emits the already-persisted payload, never recomputes money.

**(c) Single-instance reconciler/redrive → advisory-lock leader guard** ✅
With >1 OES replica each sweep ran N times (duplicate drift alerts / racing redrive). New [`services/leaderLock.js`](../../../../../Backend/services/trade/order-execution-service/services/leaderLock.js) wraps each tick in a Postgres **session-scoped** `pg_try_advisory_lock` on a dedicated connection (keys `RECONCILIATION=521001`, `OUTBOX_REDRIVE=521002`); non-leaders get `false` and skip cleanly. The lock lives in the scheduling wrapper, not in `reconcileOnce`/`redriveOnce`, so the detection logic stays pure + testable.

> **Residual after (a)–(c):** the ledger's missing global balanced-journal invariant (§4.2) is **not** closed by these — it remains a 🟡 ledger gap.

---

## 7. "Cannot be faked" constraints (Step 8)

These cannot be satisfied by more code in this repo — they require real external counterparties, legal acts, or licenses. **Each is a hard precondition for regulated go-live.**

| Constraint | Why it can't be faked |
|------------|-----------------------|
| **Real PSP / payment rail** | Money actually moves only through a licensed processor/bank. `paymentSimulator.js` is a stand-in. |
| **Real sanctions list** | Strict-liability screening needs authoritative OFAC/EU/UN/HMT data with provenance + refresh + audit, not a mock watchlist in `risk-service`. |
| **KYC / IDV** | Onboarding identity must be verified by a real IDV provider; no IDV exists in-tree. |
| **Customs filing** | A customs declaration is a **legal act** filed with a national authority (single-window) — not an internal record. |
| **Electronic Bill of Lading (e-B/L)** | A title document of value; must run on an **MLETR-compliant** platform for legal negotiability. |
| **Carrier tracking** | Real shipment state comes from carriers/ports (EDI/API), not a status enum. |
| **Money-transmission licensing** | Operating the money leg requires MTL/EMI/PI licensing in each corridor — a legal/regulatory gate, not engineering. |

---

## 8. Phased go-live roadmap

**Phase 0 — Integrity hardening (largely DONE this session)**
✅ ledger transactional outbox · ✅ OES outbox redrive · ✅ advisory-lock leader guard.
Remaining: add the **global balanced-journal (Σlegs==0) invariant** to the ledger; confirm RLS **read-path GUC cutover** `[from project knowledge, NOT verified in this pass]`; exercise the saga **compensation/refund** path end-to-end.

**Phase 1 — One real rail + one corridor**
Replace `paymentSimulator.js` with **one** real PSP behind `payment-service`; pick **one** corridor (e.g. EUR domestic). Wire the **real `risk-service` sanctions list** for that corridor. Prove the full loop on real money in sandbox/limited-live, with idempotency layers 1–3 and reconciliation watching.

**Phase 2 — AML depth**
Move from a single screen-at-placement gate to ongoing AML: transaction monitoring, case management (`aml`, `trust-score` Java modules), adverse-media, periodic re-screening. Real watchlist refresh + audit trail.

**Phase 3 — Cross-border (customs / e-B/L)**
Integrate single-window **customs filing** and an **MLETR e-B/L** platform; real **carrier tracking**. This unlocks the actual *global-trade* claim beyond domestic payment.

**Phase 4 — Scale + DR**
Multi-region, ledger partitioning, exactly-once posture verification under load, DR drill on the money tables (the outbox/inbox/redrive primitives make this tractable), corridor-by-corridor **MTL/licensing** rollout.

---

### Appendix — files cited (relative to repo root)

- `Backend/services/trade/order-execution-service/services/`: `orderSaga.js`, `counterpartyScreening.js`, `screeningPolicy.js`, `sanctionsClient.js`, `paymentClient.js`, `reconciliation.js`, `outboxPublisher.js`, `leaderLock.js`, `pricing.js`, `tax.js`
- `Backend/services/trade/order-execution-service/providers/fx.js`
- `Backend/services/trade/order-execution-service/workers/`: `eventConsumer.js`, `paymentSimulator.js`, `outboxRedrive.js`
- `Backend/services/trade/order-execution-service/models/`: `orders.js`, `order_saga_state.js`, `outbox_events.js`, `processed_webhooks.js`
- `Backend/services/trade/order-execution-service/config/appConfig.js` (sanctions fail-closed defaults, lines ~75–88)
- `Backend/services/commerce/financial-services-java/ledger-service/src/main/java/com/baalvion/ledger/service/LedgerService.java`
- `Backend/services/commerce/financial-services-java/ledger-service/src/main/java/com/baalvion/ledger/kafka/`: `PaymentInitiatedListener.java`, `EscrowEventListener.java`
