# GTOS — Global Trade Operating System

## Data Architecture: DDD Model, Polyglot Persistence & Event-Driven Backbone

> **Author:** Data Architect, Enterprise Architecture Council
> **Status:** Design baseline for Phases 4 / 6 / 7. **MUST extend the current platform, not replace it.**
> **Ground truth referenced:** `trade-service` (Node/Express/Sequelize, schema `trade`, :3025, 28 typed models + generic `trade.collections` JSONB; tenant via `tenant_id` column + AsyncLocalStorage hooks; cross-tenant tables `listings/rfqs/deals/quotations/messages/carriers/organizations` excluded from tenant scoping); Java finance suite (account:3016 … trust-score:3046, Flyway migrations); RBAC :3005; events `baalvion:events` (Redis Streams via `@baalvion/events` + `@baalvion/sdk`, transport-swappable to **Kafka**/NATS); `@baalvion/events` already ships an **outbox + idempotent-consumer** primitive (`packages/events/src/outbox.ts`); canonical `PlatformEvent{id,type,payload,orgId,userId,timestamp,traceId}` with wire fields `_type/_payload/_correlationId/_orgId/_userId/_eventId/_timestamp/_source/_event`; subject convention `<context>.<aggregate>.<event>` (`packages/events/src/domain.ts`); audit-service :3032 WORM SHA-256 hash chain consuming `baalvion:events`.

> **Reading guide.** Part 1 is the DDD model (bounded contexts, aggregates, value objects, domain events, context map, ID strategy, consistency). Part 2 is the polyglot persistence strategy (store-per-context with justification + CDC). Part 3 is the target Kafka topology and the order→settlement saga. Markers: **[REUSE]** = existing service/schema, **[NEW]** = net-new, **[REPLACE]** = stub to be extracted.

---

# PART 1 — DOMAIN-DRIVEN DESIGN MODEL (Phase 4)

## 1.0 — Strategic premise

`trade-service` today is a **CRUD monolith over schema `trade`** with a `trade.collections` JSONB escape hatch. The 28 models are anemic record stores. The DDD work is to **extract bounded contexts** along the seams already visible in the model list, give each a real aggregate with invariants, and integrate them **only through versioned domain events on the bus** — never through shared tables or cross-schema joins.

Two non-negotiable rules govern the model:

1. **Aggregates are the transaction boundary.** One aggregate = one Postgres transaction = one consistency unit. Anything spanning aggregates is **eventual consistency via events + saga**, never a distributed transaction.
2. **References cross contexts by ID, never by foreign key.** A `Shipment` holds an `orderId` (a string), not a Sequelize `belongsTo(Order)`. Cross-context invariants are enforced by the owning context and communicated by events.

## 1.1 — Bounded Contexts (aligned to services)

| # | Bounded Context | Owning service | Schema / store | Status |
|---|---|---|---|---|
| BC-1 | **Identity & Organization** | identity (auth :3001 + RBAC :3005) | `auth`, `rbac` | [REUSE] |
| BC-2 | **Catalog & Classification** | catalog-service [NEW] | `catalog` (PG) + OpenSearch | [NEW] |
| BC-3 | **Sourcing & RFQ** | sourcing-service [extract] | `sourcing` | [REPLACE] from `trade.rfqs/quotations` |
| BC-4 | **Trade Lifecycle (Orders/Deals)** | trade-service [REUSE/extract] | `trade.orders/deals` | [REUSE] |
| BC-5 | **Logistics & Shipping** | logistics-service [extract] | `logistics` | [REPLACE] from `trade.shipments/carriers/freight_quotes` |
| BC-6 | **Ports & Terminals** | port-service [NEW] | `ports` (PG) + ClickHouse | [NEW] |
| BC-7 | **Trade Documents** | document-service [extract] | `documents` (PG) + S3 | [REPLACE] from `trade.documents/bills_of_lading/...` |
| BC-8 | **Quality & Inspection** | inspection-service [NEW] | `inspection` | [NEW] |
| BC-9 | **Warehousing & Inventory** | inventory-service [NEW] | `inventory` (PG) + ClickHouse | [NEW] |
| BC-10 | **Supplier Lifecycle** | supplier-service [NEW] | `supplier` | [NEW] |
| BC-11 | **Banking & Trade Finance** | Java finance suite (account/trade-finance/credit/payment-rails :3016–3042) | per-service (Flyway) | [REUSE] |
| BC-12 | **Payments & Settlement** | payment-rails-service :3042 + ledger | `payments`, `ledger` | [REUSE] |
| BC-13 | **Government Gateway / Customs** | customs-service [NEW] | `customs` | [NEW] |
| BC-14 | **Compliance & Sanctions** | risk-service :3035 + aml :3045 + sanctions | `risk`, `aml` | [REUSE] |
| BC-15 | **Trade Resolution (Disputes)** | dispute-service :3044 [extract] | `dispute` | [REUSE]/[REPLACE] |
| BC-16 | **Insurance** | insurance-service [extract] | `insurance` | [REPLACE] from `trade.insurance_policies/claims` |
| BC-17 | **Sustainability / ESG** | esg-service [NEW] | `esg` (PG ledger) + ClickHouse | [NEW] |
| BC-18 | **Network Trade Graph** | network-service [NEW] | **Neo4j** + `network` PG mirror | [NEW] |
| BC-19 | **Audit** | audit-service :3032 | `audit` (WORM) | [REUSE] |
| BC-20 | **Read-Model / CQRS (Command Tower)** | projection-service [NEW] | OpenSearch + ClickHouse + Redis | [NEW] |

> **Shared kernel** is deliberately tiny: `@baalvion/types` (PlatformEvent, EventType, TenantRef, Money, CountryCode) + `@baalvion/events` (envelope + outbox). Everything else is context-local.

## 1.2 — Aggregates, Entities, Value Objects, Domain Events

Naming: domain events are `<context>.<entity>.<action>`. They are emitted via the existing **transactional outbox** (`event_outbox` table written in the same tx as the aggregate mutation) and relayed to the bus by `relayOutbox()`.

### Shared Value Objects (in `@baalvion/types`, immutable)

| VO | Shape | Invariant |
|---|---|---|
| `Money` | `{ amount: bigint /*minor units*/, currency: CurrencyCode }` | amount is integer minor units; never float; arithmetic only between equal currencies |
| `CurrencyCode` | ISO 4217 string | ∈ enumerated set |
| `CountryCode` | ISO 3166-1 alpha-2 | ∈ enumerated set |
| `HSCode` | `{ hs6: string, hts10?: string }` | hs6 is 6 digits; hts10 country-qualified |
| `GTIN` | `{ value: string, kind: 'GTIN-8'|'GTIN-12'|'GTIN-13'|'GTIN-14' }` | mod-10 check digit valid |
| `Incoterm` | `{ rule: 'EXW'|'FCA'|'FOB'|'CIF'|'CFR'|'DAP'|'DDP'|..., namedPlace: string, version: '2020' }` | rule ∈ Incoterms 2020 |
| `Quantity` | `{ value: Decimal, uom: UnitOfMeasure }` | value ≥ 0; uom from normalized registry |
| `Tenor` | `{ days: number, basis: 'sight'|'usance', startEvent: string }` | days ≥ 0 |
| `PortCall` | `{ unlocode: UNLOCODE, eta?: Instant, etd?: Instant, terminalId?: string }` | etd ≥ eta |
| `UNLOCODE` | 5-char UN/LOCODE | matches port registry |
| `LatLng` | `{ lat: number, lng: number }` | lat ∈ [-90,90], lng ∈ [-180,180] |
| `WeightVolume` | `{ grossKg, netKg, cbm }` | netKg ≤ grossKg |
| `TenantRef` | `{ orgId: string, tier: 'platform'|'country'|'organization' }` | matches RBAC tenancy tree |

---

### BC-1 — Identity & Organization [REUSE]

- **Aggregate `Organization`** (root). Entities: `Membership`, `ApiKey`. VOs: `Slug`, `Plan`, `TenantRef`. Invariants: exactly one owner; slug globally unique; plan ∈ catalog.
- **Aggregate `User`** (root). Entities: `Session`, `MfaFactor`, `RefreshToken`. Invariant: a session belongs to exactly one user+org.
- **Domain events:** `org.organization.created` (already `org.created`), `org.membership.granted`, `org.membership.revoked`, `identity.user.registered`, `identity.session.started`, `identity.session.revoked`.

### BC-2 — Catalog & Classification [NEW]

- **Aggregate `Product`** (root). Entities: `SKU` (variant), `ProductMedia`, `ClassificationResult`. VOs: `GTIN`, `HSCode`, `UnitOfMeasure`, `Money` (list price by Incoterm). Invariants: every published SKU has a valid GTIN check digit and at least one `ClassificationResult` (HS6); a dual-use/controlled HS code blocks publish until compliance clears.
- **Aggregate `PriceIndex`** (root). VOs: `Money`, `Quantity`. Invariant: index point is monotonic in `asOf` per (commodity, market).
- **Domain events:** `catalog.product.created`, `catalog.product.published`, `catalog.product.classified`, `catalog.sku.price_changed`, `catalog.product.withdrawn`, `catalog.priceindex.point_recorded`.

### BC-3 — Sourcing & RFQ [REPLACE]

- **Aggregate `RFQ`** (root). Entities: `RFQLineItem` (HSCode + Quantity + Incoterm + delivery window). VOs: `Incoterm`, `HSCode`, `Quantity`, `DeliveryWindow`. Invariants: RFQ cannot be `awarded` without ≥1 received quotation; line items immutable after publish.
- **Aggregate `Quotation`** (root). Entities: `QuoteLine`. VOs: `Money`, `Tenor`, `ValidityWindow`. Invariant: a quotation references exactly one `rfqId`; total = Σ lines.
- **Aggregate `ReverseAuction`** (root). Entities: `Bid`. Invariant: idempotent bid (auction+bidder+round unique); tie-break recorded.
- **Domain events:** `sourcing.rfq.published`, `sourcing.rfq.cancelled`, `sourcing.quotation.submitted`, `sourcing.quotation.shortlisted`, `sourcing.rfq.awarded`, `sourcing.auction.bid_placed`, `sourcing.auction.closed`.

### BC-4 — Trade Lifecycle (Orders / Deals) [REUSE — anchor context]

- **Aggregate `Order`** (root). Entities: `OrderLine`, `Allocation`, `MilestoneSchedule`. VOs: `Money` (per-market FX-resolved), `Incoterm`, `HSCode`, `CountryCode`. **Invariants:** an `Order` is `placed` only with a valid Incoterm + named place + at least one priced line; FX-resolved total persisted in **market currency** (the production-readiness P0 fix) plus base USD; state machine `draft → placed → financed → in_fulfilment → in_transit → cleared → delivered → settled → closed` is **forward-only**; cancellation only before `financed`.
- **Aggregate `Deal`** (root, cross-tenant). Entities: `DealParty`, `TermSheet`, `CounterOffer`. Invariant: a deal converts to exactly one `Order` on acceptance.
- **Domain events:** `trade.order.placed`, `trade.order.financed`, `trade.order.line_allocated`, `trade.order.in_transit`, `trade.order.cleared`, `trade.order.delivered`, `trade.order.settled`, `trade.order.cancelled`, `trade.deal.term_sheet_signed`, `trade.deal.converted`.

### BC-5 — Logistics & Shipping [REPLACE]

- **Aggregate `Shipment`** (root). Entities: `ShipmentLeg`, `ContainerAssignment`, `TrackingEvent`, `DemurrageClock`. VOs: `PortCall`, `Incoterm`, `WeightVolume`, `Instant`. **Invariants:** legs form a connected path origin→destination; a shipment cannot be `gated_in` without an assigned container; demurrage clock starts at `discharged` and stops at `gate_out`.
- **Aggregate `Container`** (root). Entities: `SealEvent`, `IoTReading` (cold-chain). VOs: `ContainerNo` (ISO 6346 + check digit), `ReeferSetpoint`, `LatLng`. Invariant: a container is in exactly one location/custody at a time (custody is forward-only event log).
- **Aggregate `Carrier`** (root, reference data). VOs: `SCAC`, `IMO`.
- **Domain events:** `logistics.shipment.booked`, `logistics.shipment.gate_in`, `logistics.shipment.loaded`, `logistics.shipment.departed`, `logistics.shipment.arrived`, `logistics.container.discharged`, `logistics.shipment.gate_out`, `logistics.shipment.delivered`, `logistics.container.coldchain_breach`, `logistics.demurrage.accrued`.

### BC-6 — Ports & Terminals [NEW]

- **Aggregate `Port`** (root, reference). Entities: `Terminal`, `Berth`, `ContainerYard`. VOs: `UNLOCODE`, `LatLng`, `Capacity`. Invariant: berth allocation windows non-overlapping per berth.
- **Aggregate `VesselSchedule`** (root). Entities: `BerthWindow`. VO: `PortCall`. Invariant: a berth window references a free berth slot.
- **Domain events:** `port.berth.allocated`, `port.vessel.arrived`, `port.vessel.departed`, `port.yard.dwell_recorded`.

### BC-7 — Trade Documents [REPLACE]

- **Aggregate `TradeDocument`** (root, polymorphic by `docType` ∈ invoice|packing_list|bill_of_lading|awb|certificate_of_origin|insurance_cert|inspection_cert). Entities: `DocumentVersion`, `Signature`, `DiscrepancyNote`. VOs: `ContentHash` (SHA-256, content-addressed → S3 + audit chain), `DocType`, `IssueDate`. **Invariants:** every version is immutable and content-addressed; an eBL (`electronicBL=true`) has **exactly one holder** at a time and title transfer is a forward-only ledger (MLETR-aligned); a document referenced by an `lc.examined` cannot be mutated.
- **Domain events:** `document.tradedocument.issued`, `document.tradedocument.versioned`, `document.tradedocument.signed`, `document.ebl.title_transferred`, `document.tradedocument.discrepancy_flagged`, `document.tradedocument.surrendered`.

### BC-8 — Quality & Inspection [NEW]

- **Aggregate `Inspection`** (root). Entities: `InspectionItem`, `Defect`, `Sample`, `Photo`. VOs: `AQL`, `InspectionResult` (pass/conditional/fail), `Standard`. Invariant: result is derivable only from completed items vs AQL plan.
- **Domain events:** `inspection.inspection.scheduled`, `inspection.inspection.started`, `inspection.inspection.completed`, `inspection.inspection.failed`, `inspection.certificate.issued`.

### BC-9 — Warehousing & Inventory [NEW]

- **Aggregate `StockItem`** (root, per warehouse+SKU+lot). Entities: `Reservation`, `Movement`, `ColdChainLog`. VOs: `Quantity`, `LotNo`, `BinLocation`, `Temperature`. **Invariant:** `available = onHand − reserved ≥ 0` (no oversell); movements are double-entry (out of one bin, into another).
- **Aggregate `Warehouse`** (root, reference). Entities: `Zone`, `Bin`. VO: `LatLng`, `Capacity`.
- **Domain events:** `inventory.stock.received`, `inventory.stock.reserved`, `inventory.stock.picked`, `inventory.stock.shipped`, `inventory.stock.adjusted`, `inventory.coldchain.breach`.

### BC-10 — Supplier Lifecycle [NEW]

- **Aggregate `Supplier`** (root). Entities: `FactoryProfile`, `Certification`, `CapacityProfile`, `QualificationGate`, `ScorecardEntry`. VOs: `AEOStatus`, `RiskScore`, `CertValidity`. Invariant: a supplier cannot be `qualified` with an expired mandatory certification or an open sanctions hit.
- **Domain events:** `supplier.supplier.onboarded`, `supplier.supplier.qualified`, `supplier.certification.expired`, `supplier.supplier.scored`, `supplier.supplier.suspended`.

### BC-11 / BC-12 — Banking, Trade Finance, Payments & Settlement [REUSE — Java + ledger]

- **Aggregate `Bank`** (root, reference). Entities: `CorrespondentRelationship`, `MultiCurrencyAccount`. VOs: `BIC` (SWIFT, ISO 9362), `IBAN`, `CurrencyCode`. Invariant: a correspondent relationship is directed (nostro/vostro) and currency-scoped.
- **Aggregate `LetterOfCredit`** (root, in trade-finance-service). Entities: `LCAmendment`, `DocumentPresentation`, `ExaminationResult`. VOs: `Money`, `Tenor`, `Incoterm`, `UCP600Rule`. **Invariants:** UCP 600 examination is the only path from `presented → honoured|refused`; amount drawn ≤ LC value; expiry/latest-shipment dates enforced.
- **Aggregate `Payment`** (root) + **`LedgerEntry`** (root, immutable double-entry). VOs: `Money`, `Rail` (SWIFT|SEPA|ACH|UPI|Pix|MPesa), `SettlementInstruction`. **Invariants:** ledger is append-only and balanced (Σ debits = Σ credits per transaction); `(provider, event_id)` unique for webhook idempotency (the proven gateway pattern); payment status forward-only.
- **Domain events:** `lc.issued`, `lc.amended`, `lc.documents_presented`, `lc.examined`, `lc.honoured`, `lc.refused`, `payment.initiated`, `payment.authorized`, `payment.captured`, `payment.failed`, `payment.settled`, `ledger.entry.posted`.

### BC-13 — Government Gateway / Customs [NEW]

- **Aggregate `CustomsFiling`** (root, per declaration). Entities: `DeclarationLine`, `DutyAssessment`, `TariffApplication`, `Attachment`. VOs: `HSCode`, `Money` (duty), `CustomsRegime`, `CountryCode`, `FilingReference`. **Invariants:** every declaration line carries a valid HS10; duty = Σ(line value × tariff rate) under the applicable treaty; a filing cannot be `submitted` to a single-window without all mandatory attachments.
- **Aggregate `CustomsAuthority`** (root, reference). Entities: `SingleWindowEndpoint`, `TariffSchedule`.
- **Aggregate `Treaty`** (root, reference). Entities: `RuleOfOrigin`, `PreferenceMargin`. Invariant: preference applied only if rules-of-origin satisfied (ties to CoO document).
- **Domain events:** `customs.filing.drafted`, `customs.filing.submitted`, `customs.filing.accepted`, `customs.filing.queried`, `customs.filing.rejected`, `customs.duty.assessed`, `customs.goods.released`, `customs.goods.held`.

### BC-14 — Compliance & Sanctions [REUSE]

- **Aggregate `ScreeningCase`** (root). Entities: `Match`, `Adjudication`. VOs: `RiskScore`, `MatchScore` (Jaro-Winkler), `Watchlist`. Invariant: a case is `cleared` only by a recorded adjudication; auto-block on score above threshold.
- **Domain events:** `compliance.screening.requested`, `compliance.screening.hit`, `compliance.screening.cleared`, `compliance.screening.blocked`, `compliance.party.flagged`.

### BC-15 — Trade Resolution (Disputes) [REUSE/REPLACE]

- **Aggregate `Dispute`** (root). Entities: `Claim`, `Evidence`, `MediationSession`, `ArbitrationAward`. VOs: `Money` (claimed), `Tier` (negotiation|mediation|arbitration), `EvidenceHash`. Invariant: tier escalation is forward-only; an award is final and references the resolved `orderId`.
- **Domain events:** `dispute.claim.filed`, `dispute.evidence.submitted`, `dispute.mediation.opened`, `dispute.arbitration.opened`, `dispute.resolution.awarded`, `dispute.dispute.closed`.

### BC-16 — Insurance [REPLACE]

- **Aggregate `Policy`** (root). Entities: `Cover`, `Endorsement`. VOs: `Money` (sum insured/premium), `Incoterm`, `CoverageWindow`. Invariant: cover bound to a shipment value ≤ sum insured.
- **Aggregate `Claim`** (root). Entities: `ClaimEvidence`, `Adjustment`. Invariant: claim ≤ sum insured; references a bound policy.
- **Domain events:** `insurance.policy.bound`, `insurance.policy.endorsed`, `insurance.claim.filed`, `insurance.claim.adjusted`, `insurance.claim.settled`.

### BC-17 — Sustainability / ESG [NEW]

- **Aggregate `CarbonLedger`** (root, append-only per org/shipment). Entities: `EmissionEntry`, `Offset`, `CBAMDeclaration`. VOs: `CO2e` (kg), `EmissionFactor`, `Scope` (1/2/3), `HSCode`. **Invariants:** carbon ledger is append-only; CBAM declaration sums embedded emissions for covered HS codes; offsets cannot exceed gross emissions for net-zero claims.
- **Domain events:** `carbon.entry.recorded`, `carbon.offset.retired`, `esg.cbam.declared`, `esg.scope3.estimated`.

### BC-18 — Network Trade Graph [NEW — the killer context]

- **Aggregate `Party`** (root, graph node mirror). Entities: `RelationshipEdge`. VOs: `PartyRef`, `OwnershipPercent`, `RelationshipType` (owns|controls|trades_with|banks_with|ships_for|correspondent_of). Invariant: edges are directed and weighted; ownership percentages on an `owns` fan-out ≤ 100% per parent.
- **Domain events:** `network.party.upserted`, `network.edge.created`, `network.edge.removed`, `network.beneficialowner.resolved`, `network.sanctions.exposure_detected`.

## 1.3 — Context Map

```
                         ┌──────────────────────────────────────────────┐
   [Shared Kernel]       │ @baalvion/types (PlatformEvent, Money,        │
                         │ CountryCode, HSCode, TenantRef) + events      │
                         └──────────────────────────────────────────────┘

 Identity (BC-1) ──upstream(Conformist)──▶ every context (auth/RBAC verify-only)

 Catalog (BC-2) ──S──▶ Sourcing (BC-3) ──S──▶ Trade Lifecycle (BC-4)   [Customer/Supplier]
                                                     │
        ┌────────────────────────────────────────────┼─────────────────────────────────┐
        ▼ (Pub/Sub)            ▼ (Pub/Sub)            ▼ (Pub/Sub)        ▼ (Pub/Sub)
 Logistics (BC-5)        Trade Finance/Payments   Documents (BC-7)   Insurance (BC-16)
        │  ▲                  (BC-11/12)               │                   │
        ▼  │ ACL                  │                    ▼                   ▼
   Ports (BC-6)              Customs (BC-13) ◀──ACL── Documents (CoO drives RoO)
        │                         │  ▲
        ▼                         ▼  │ ACL
 Inventory (BC-9)         Compliance/Sanctions (BC-14) ──feeds──▶ Network Graph (BC-18)
        ▲                                                              ▲   ▲
        │                                                              │   │ (CDC projection)
 Supplier (BC-10) ──▶ Compliance (BC-14)                     all contexts emit → Network + ESG (BC-17)

 Dispute (BC-15) ◀── consumes lifecycle/doc/payment events
 Audit (BC-19) ◀── consumes ALL (WORM)        Read-Model/CQRS (BC-20) ◀── consumes ALL
```

**Relationship legend & key ACLs:**

| Relationship | Pattern | Notes |
|---|---|---|
| Identity → all | **Conformist** | every service consumes auth/RBAC tokens verify-only; no second issuer |
| Catalog → Sourcing → Trade | **Customer/Supplier** (`S`=Supplier) | downstream Trade negotiates the contract it needs from upstream Catalog |
| Trade → {Logistics, Finance, Documents, Insurance} | **Published Language / Pub-Sub** | the order lifecycle events are the published language |
| Documents → Customs | **Anti-Corruption Layer** | CoO/RoO data translated into customs' tariff/preference model; customs never reads `documents` schema |
| Customs → external Single Window | **ACL** per authority | adapter normalizes each government API into `CustomsFiling` |
| Compliance ↔ Network Graph | **Shared model via events** | sanctions hits become graph edges; graph exposure paths feed screening |
| Finance (Java) → Trade (Node) | **ACL (HMAC finance-events bridge)** | the existing byte-identical `WebhookSigner` bridge `POST /v1/internal/finance-events` |
| Read-Model → all | **Open Host / CQRS projection** | consumes events; owns no source-of-truth |

## 1.4 — Canonical IDs & cross-context reference strategy

- **ID format:** prefixed UUIDv7 strings — `org_…`, `usr_…`, `prd_…`, `sku_…`, `ord_…`, `shp_…`, `cnt_…` (container), `prt_…` (port), `bnk_…`, `pay_…`, `led_…`, `doc_…`, `ins_…` (inspection), `whs_…`, `cus_…` (customs filing), `trt_…` (treaty), `pol_…` (insurance policy), `inv_…` (invoice). UUIDv7 keeps time-ordering for index locality; the prefix makes cross-context references self-describing in logs and events.
- **Cross-context references are IDs, not FKs.** A `Shipment` stores `orderId: "ord_…"`. There is **no database foreign key across schemas/services**. Referential integrity across contexts is the responsibility of the owning aggregate + saga, validated at the boundary (Zod/schema) on event ingest.
- **Natural keys are VOs, not identifiers:** GTIN, UN/LOCODE, BIC, container number, HS code are value objects that *describe*; the system identifier is always the prefixed UUID.
- **Tenant key on every aggregate:** `orgId` (= `tenant_id` column today). Cross-tenant aggregates (`Deal`, `RFQ`, `Listing`, `Carrier`, `Port`, `Bank`, `Treaty`) are explicitly marked and excluded from RLS tenant scoping, exactly as the current `trade-service` excludes `listings/rfqs/deals/quotations/messages/carriers/organizations`.

## 1.5 — Eventual consistency, outbox & idempotency

- **Transactional outbox (already shipped).** Every aggregate mutation writes the domain event to an `event_outbox` table **in the same transaction** (`OutboxStore.enqueue(event, tx)` from `packages/events/src/outbox.ts`). A relay worker calls `relayOutbox()` every 1–2s, publishing with `FOR UPDATE SKIP LOCKED` so multiple replicas are safe and ordering is preserved (stop-at-first-failure). This guarantees an event is emitted **iff** its mutation committed — no dual-write drift.
- **Idempotency keys.** Producers set `event.id` (= outbox row id). Consumers wrap handlers with `idempotent(handler, seen)` using the **Redis `SET NX EX` seen-store** (`redisSeenStore`) so duplicate deliveries (at-least-once bus) are processed exactly once. Command APIs additionally accept a client `Idempotency-Key` header mapped to a unique constraint, so retried HTTP requests don't create duplicate aggregates.
- **Sagas for multi-aggregate workflows.** The order→settlement flow (Part 3.7) is a **choreographed saga**: each context reacts to the previous context's event and emits the next, with **compensating events** (`payment.refunded`, `logistics.shipment.cancelled`, `customs.filing.withdrawn`) when a downstream step fails. No 2-phase commit anywhere.
- **Read models are eventually consistent** and explicitly labelled with `asOf`/freshness so the Command Tower (BC-20) can render last-known on partial outage.

---

# PART 2 — DATABASE STRATEGY (Phase 6) — Polyglot Persistence

## 2.0 — Principles

1. **Schema-per-service in one (or sovereign-partitioned) Postgres cluster.** Each context owns its schema; no cross-schema joins. This preserves the current `trade-service` model (schema `trade`) and the Java Flyway model.
2. **PostgreSQL is the system of record for anything financial, transactional, or legally dispositive** (orders, ledger, LC, customs filings, carbon ledger, eBL title). Typed tables — never JSONB — for money and state. **`trade.collections` JSONB stays for the long tail** (alerts, risk_signals, saved views) where a bespoke table isn't warranted yet.
3. **Every other store is a derived projection or a specialized index**, rebuildable from Postgres + the event log. Losing a search/analytics/graph store is recoverable; losing a SoR is not.
4. **RLS + partitioning + PITR** are mandatory on the SoR. RLS via `@baalvion/tenancy` (`app.current_tenant` GUC, `FORCE ROW LEVEL SECURITY`, **NOSUPERUSER `baalvion_app` role**). Time/tenant partitioning on high-volume tables (`trade.orders`, `logistics.tracking_events`, `ledger.entries`).

## 2.1 — Store-per-context matrix

| Service / Context | Primary store | Secondary store(s) | Rationale |
|---|---|---|---|
| identity / RBAC (BC-1) | **PostgreSQL** (`auth`,`rbac`) | **Redis** (sessions, JTI revocation, rate-limit) | transactional auth; Redis for hot session/lockout state |
| catalog (BC-2) | **PostgreSQL** (`catalog`) | **OpenSearch** (product/SKU search, facets, autocomplete) | PG = SoR for SKU/price; OpenSearch = relevance, HS/GTIN fuzzy, multi-attr facets |
| sourcing (BC-3) | **PostgreSQL** (`sourcing`) | **OpenSearch** (RFQ/quote search) + **Redis** (auction bid latches, single-flight) | bids need idempotent atomic latch (Redis) + auditable record (PG) |
| trade-lifecycle (BC-4) | **PostgreSQL** (`trade`) | **ClickHouse** (lifecycle analytics) + **Redis** (FX cache 30s) | order/deal = strict integrity; FX via `@baalvion/cache` 30s profile |
| logistics (BC-5) | **PostgreSQL** (`logistics`) | **ClickHouse** (tracking/IoT time-series, demurrage) + **Redis** (live position) | millions of tracking/cold-chain readings → ClickHouse; PG holds shipment SoR |
| ports (BC-6) | **PostgreSQL** (`ports`) | **ClickHouse** (yard dwell, berth utilization) | reference data in PG; telemetry/throughput analytics in ClickHouse |
| documents (BC-7) | **PostgreSQL** (`documents` metadata + eBL title ledger) | **Object Storage S3** (binaries, content-addressed) + **OpenSearch** (full-text/OCR) | binaries in S3 keyed by SHA-256; PG owns the title-transfer ledger; OpenSearch for discovery |
| inspection (BC-8) | **PostgreSQL** (`inspection`) | **S3** (photos/evidence) | inspection records SoR; media in object storage |
| inventory (BC-9) | **PostgreSQL** (`inventory`) | **ClickHouse** (movement/cold-chain time-series) + **Redis** (available-to-promise cache) | no-oversell needs PG transactions; movement history → ClickHouse |
| supplier (BC-10) | **PostgreSQL** (`supplier`) | **OpenSearch** (supplier discovery) + **Neo4j** (n-tier supply graph) | qualification SoR in PG; n-tier traceability is graph |
| banking/finance (BC-11) | **PostgreSQL** (Java, Flyway) | **Neo4j** (correspondent-banking graph) | money SoR stays Java/PG; settlement routing topology is graph |
| payments/ledger (BC-12) | **PostgreSQL** (`payments`,`ledger`) | **ClickHouse** (settlement analytics) | double-entry ledger = ACID PG; volume analytics offloaded |
| customs (BC-13) | **PostgreSQL** (`customs`) | **OpenSearch** (HS/tariff lookup) | legally dispositive filings in PG; tariff/HS search in OpenSearch |
| compliance/sanctions (BC-14) | **PostgreSQL** (`risk`,`aml` cases) | **OpenSearch** (watchlist name-matching) + **Neo4j** (exposure paths) | adjudication SoR PG; name-match in OpenSearch; ownership/exposure paths in graph |
| dispute (BC-15) | **PostgreSQL** (`dispute`) | **S3** (evidence vault) | claims/awards SoR; evidence content-addressed in S3 |
| insurance (BC-16) | **PostgreSQL** (`insurance`) | **ClickHouse** (loss-ratio analytics) | policies/claims SoR |
| esg (BC-17) | **PostgreSQL** (`esg` carbon ledger) | **ClickHouse** (emissions analytics, CBAM rollups) | append-only ledger in PG; heavy aggregation in ClickHouse |
| network graph (BC-18) | **Neo4j** | **PostgreSQL** (`network` party mirror for CDC source) | graph IS the model; PG mirror only as CDC/event landing |
| audit (BC-19) | **PostgreSQL** (`audit`, WORM hash-chain) | — | immutability + tamper-evidence (already built) |
| read-model/CQRS (BC-20) | **OpenSearch** + **ClickHouse** | **Redis** (hot KPI cache) | pure projections; rebuildable from events |

## 2.2 — Why Neo4j is the killer store (graph over SQL)

The NETWORK trade graph (BC-18) is the one place a relational model genuinely breaks down. The queries the platform must answer are **variable-depth traversals** that in SQL become unbounded recursive CTEs that explode combinatorially:

- **Beneficial-ownership resolution** ("who ultimately controls counterparty X above 25%?") — recursive ownership unwind.
- **Sanctions exposure paths** ("is there ANY path of ≤4 hops from this buyer to a sanctioned entity through ownership, banking, or shipping edges?") — the exact 50% Rule / indirect-exposure problem.
- **Correspondent-banking routing** ("shortest settlement path from bank A to bank B given currency + nostro/vostro edges").
- **n-tier supply-chain traceability** ("trace this lot back through all sub-suppliers to raw-material origin for CBAM / forced-labour due diligence").

Example Cypher (sanctions exposure path — justifies the graph DB):

```cypher
// Indirect sanctions exposure: any path ≤4 hops to a sanctioned party
MATCH (buyer:Party {id: $buyerId})
MATCH path = (buyer)-[:OWNS|CONTROLS|BANKS_WITH|SHIPS_FOR|CORRESPONDENT_OF*1..4]-(target:Party)
WHERE target.sanctioned = true
RETURN buyer.id, target.id, [r IN relationships(path) | type(r)] AS hops,
       length(path) AS distance
ORDER BY distance ASC
LIMIT 25;
```

```cypher
// Beneficial-ownership unwind above 25% (50%-Rule style)
MATCH (c:Party {id: $counterpartyId})
MATCH p = (c)<-[o:OWNS*1..6]-(owner:Party)
WITH owner, reduce(pct = 1.0, r IN relationships(p) | pct * r.percent) AS effectivePct
WHERE effectivePct >= 0.25
RETURN owner.id, owner.name, effectivePct ORDER BY effectivePct DESC;
```

The same in Postgres is a recursive CTE with manual cycle guards and no native shortest-path — correct but orders of magnitude slower and unmaintainable at depth. **Graph is justified specifically by variable-depth pathfinding + relationship-centric queries**, not by node count.

## 2.3 — Data residency / sovereign partitioning

- Tenancy tree is `platform → country → organization` (RBAC). **Country-level data residency** is enforced by **sovereign Postgres partitions/clusters** keyed on `CountryCode`: EU-resident orgs land in an EU cluster, IN orgs in an IN cluster (DPDP), etc. Customs filings and KYC/AML data are pinned to the authority's jurisdiction.
- OpenSearch/ClickHouse projections are region-pinned per cluster; cross-region read models are aggregated only on de-identified rollups.
- Neo4j holds the global graph but **edge payloads carry residency tags**; jurisdiction-restricted attributes are referenced by ID and resolved from the residency-pinned SoR.

## 2.4 — Backup, PITR & DR

- **PostgreSQL (all SoR):** continuous WAL archiving + base backups → **PITR** to any second; daily logical dumps for portability. DR drill is already proven (540-table row-for-row restore in the Beta RC work) — extend the same `bootstrap`/restore harness per new schema.
- **Object Storage:** versioned buckets + cross-region replication + object-lock (WORM) on the evidence/eBL vault to match the audit chain's immutability.
- **OpenSearch / ClickHouse / Neo4j:** snapshots for fast recovery, but the authoritative recovery path is **rebuild-from-events** (replay) + CDC re-projection — these stores are never the only copy of dispositive data.
- **Audit chain:** WORM + hash-chain verify endpoint already detects tamper / inserted / removed rows.

## 2.5 — CDC / Debezium → search & analytics projection strategy

Two complementary projection paths, both feeding off the **same outbox/event backbone** so there is one source of truth:

1. **Domain-event projection (preferred for cross-context read models).** The CQRS projection-service (BC-20) consumes `gtos.*` topics and builds OpenSearch documents + ClickHouse rows + Redis KPI snapshots. This is semantic, versioned, and decoupled from table shape.
2. **Debezium CDC (for high-fidelity table mirroring + Neo4j hydration).** Debezium tails Postgres logical replication (`pgoutput`) per schema → Kafka Connect → topics `gtos.cdc.<schema>.<table>`. Sinks:
   - **OpenSearch sink** for full-text/faceted mirrors of catalog, documents, supplier.
   - **ClickHouse sink** for `logistics.tracking_events`, `ledger.entries`, `esg.emission_entries` time-series.
   - **Neo4j sink** to hydrate/maintain the graph: `network` PG mirror + party/edge changes from `supplier`, `risk`, `payments` CDC become `MERGE` upserts on nodes/edges.
   - Customs/finance CDC is **internal-only** (residency + sensitivity), not projected to global read models.

CDC topics use **transaction metadata** for ordering and the **outbox event topics** for business meaning — the two never disagree because the outbox row is written in the CDC-captured transaction.

---

# PART 3 — EVENT-DRIVEN ARCHITECTURE ON KAFKA (Phase 7)

## 3.0 — Migration: Redis Streams → Kafka (transport swap, not rewrite)

The application API never changes. `@baalvion/events` is **transport-swappable** and already supports Kafka. The swap is config + topic mapping:

1. **Keep the `PlatformEvent` envelope** (`id/type/payload/orgId/userId/timestamp/traceId` + wire fields `_type/_payload/_correlationId/...`). `sdk.events.publish/subscribe` stays byte-compatible.
2. **Dual-write / mirror phase.** Stand up Kafka; run a **MirrorMaker-style bridge** that copies `baalvion:events` (Redis Stream) → Kafka topics while producers still write Redis. Then flip `EVENT_TRANSPORT=kafka` per service so producers write Kafka directly; the bridge keeps legacy Redis consumers (notification, audit) alive until they switch.
3. **Stream → topic mapping.** The single `baalvion:events` stream fans out to the per-domain topics below, keyed by the dotted `event.type` → `gtos.<domain>.<entity>.<version>`. Subject `subjectFor(type)` already returns the dotted type, so the mapping is a deterministic function.
4. **Consumer-group parity.** Existing groups (`notification`, `audit-service`) become Kafka consumer groups with the same idempotent semantics (Redis seen-store still dedups across the swap).
5. **Cutover gate:** offsets verified equal, audit hash-chain continuous across the boundary, then retire the Redis transport.

## 3.1 — Topic taxonomy & conventions

- **Naming:** `gtos.<domain>.<entity>.<version>` e.g. `gtos.trade.order.v1`.
- **Partition key:** `aggregateId` for strict per-aggregate ordering (default), **or** `orgId` for tenant-affinity where cross-aggregate-per-tenant ordering matters (e.g. ledger, audit). Documented per topic below.
- **Retention vs compaction:**
  - **Event/fact topics** (lifecycle, payments, customs) → time-retention (default 30d hot, then tiered/long-term to object storage for replay).
  - **State/reference topics** (catalog SKU current state, port/bank reference, network graph nodes) → **log compaction** (latest value per key is the materialized current state).
- **Schema:** **Avro or Protobuf in a Schema Registry**, one subject per topic-value (`gtos.trade.order.v1-value`), **BACKWARD_TRANSITIVE** compatibility (consumers on old schema can read new events; additive fields only; never remove/repurpose). Envelope is a shared Avro record; payload is the per-event schema.

## 3.2 — Topic catalog (12 concrete topics)

| # | Topic | Partition key | Retention | Producer (owner) | Consumers (group) |
|---|---|---|---|---|---|
| T1 | `gtos.identity.org.v1` | orgId | compacted | identity/RBAC | catalog, trade, billing, network-graph, read-model, audit |
| T2 | `gtos.catalog.product.v1` | productId | compacted | catalog-service | sourcing, search-projector, compliance (controlled-HS), read-model, audit |
| T3 | `gtos.sourcing.rfq.v1` | rfqId | 90d | sourcing-service | trade-lifecycle, supplier, read-model, audit |
| T4 | `gtos.trade.order.v1` | orderId | 365d | trade-service | finance, logistics, documents, insurance, customs, esg, dispute, read-model, audit |
| T5 | `gtos.logistics.shipment.v1` | shipmentId | 365d | logistics-service | ports, customs, insurance, documents, esg, read-model, audit |
| T6 | `gtos.logistics.tracking.v1` | containerId | 30d (→tier) | logistics/IoT ingest | clickhouse-sink, coldchain-alerting, read-model |
| T7 | `gtos.documents.tradedoc.v1` | documentId | 365d | document-service | finance (LC exam), customs (CoO), trade, search-projector, audit |
| T8 | `gtos.finance.lc.v1` | lcId | 365d | trade-finance-service (Java) | trade-lifecycle, payments, documents, read-model, audit |
| T9 | `gtos.payments.settlement.v1` | paymentId | 365d | payment-rails + ledger | trade-lifecycle, dispute, esg(none), read-model, audit |
| T10 | `gtos.customs.filing.v1` | filingId | 365d | customs-service | logistics(release), trade, esg(CBAM), read-model, audit |
| T11 | `gtos.compliance.screening.v1` | caseId | 365d | risk/aml/sanctions | trade(gate), sourcing(gate), network-graph, read-model, audit |
| T12 | `gtos.network.graph.cdc.v1` | partyId | compacted | network-service + Debezium CDC | neo4j-sink, exposure-analyzer, read-model, audit |

> Plus infrastructure topics: `gtos.esg.carbon.v1` (carbon.entry.recorded → ClickHouse + CBAM), `gtos.cdc.<schema>.<table>` (Debezium), and the DLQ/retry families in §3.4.

## 3.3 — Producers, consumers & ownership rules

- **Single-writer per topic.** Exactly one service produces to each business topic (the aggregate owner). Cross-context reactions are **consume-then-produce-your-own-topic**, never write to someone else's topic. (Debezium CDC topics are the only exception and are sink-only.)
- **Consumer groups** are per *purpose*, not per service instance: `cg.notification`, `cg.audit`, `cg.read-model`, `cg.neo4j-sink`, `cg.clickhouse-sink`, `cg.search-projector`, `cg.coldchain-alert`, `cg.saga-order`. Each scales horizontally by partition.
- **Idempotent consumers** everywhere (Redis `SET NX EX` seen-store on `event.id`), so re-delivery and replay are safe.

## 3.4 — DLQ, retry & poison-message strategy

- **Retry topics with backoff tiers** (Confluent pattern): `gtos.<domain>.<entity>.v1.retry.5s`, `.retry.1m`, `.retry.15m`. A consumer that fails transiently re-publishes to the next retry tier with an incremented `_retryCount` header; a delayed re-consumer feeds it back to the main handler.
- **Poison messages** (non-transient: schema violation, business-rule impossibility) go straight to **`gtos.<domain>.<entity>.v1.dlq`** with headers `_error`, `_stacktraceHash`, `_originalOffset`, `_consumerGroup`.
- **Parking & triage.** The DLQ is consumed by a `cg.dlq-triage` worker that persists to a `dead_letters` table + raises an `ExceptionQueueItem` to the Command Tower. Reprocessing is a deliberate operator action (re-publish from DLQ to source topic after fix).
- **Max-attempts cap** (e.g. 5) prevents infinite retry loops; the cap is per-topic configurable.

## 3.5 — Replay & event-sourced rebuild

- **Offset reset replay.** Any projection (OpenSearch search index, ClickHouse analytics, Neo4j graph, Command-Tower KPIs) is rebuilt by creating a **new consumer group** and `--reset-offsets --to-earliest` over the relevant topics — the live read model is unaffected until the rebuilt one is promoted (blue/green projection).
- **Long-term replay store.** Hot retention is 30–365d; older events are **tiered to object storage** (Kafka tiered storage / S3) so a full historical rebuild is always possible.
- **Audit re-derivation.** audit-service re-consumes from earliest to re-derive the WORM hash chain and prove it matches the on-disk chain (tamper detection across replay).
- **Event-sourced aggregates** (ledger, eBL title, carbon ledger, dispute) can be **fully reconstructed** from their topic by folding events in offset order — the Postgres SoR is then a snapshot/optimization, not the only truth.

## 3.6 — Delivery semantics & ordering

- **Bus default = at-least-once** + **idempotent consumers** (the pragmatic, proven choice). Producers run **idempotent producer** (`enable.idempotence=true`, `acks=all`) so producer retries don't duplicate within a partition.
- **Exactly-once (EOS)** is reserved for the **ledger/settlement consumer** (BC-12): Kafka transactions (`read-process-write` with transactional producer) so a payment event → ledger entry is atomic and never double-posted. Everywhere else, at-least-once + dedup is cheaper and sufficient.
- **Ordering** is guaranteed **per partition = per aggregate** (partition key = aggregateId). Cross-aggregate ordering is *not* assumed; sagas use event causality (`traceId`/`_correlationId`) + state, not global order.

## 3.7 — Saga: order → payment → shipment → customs → settlement (choreography)

Choreographed (no central orchestrator); each step reacts and emits the next. `traceId` threads the whole flow; compensations on failure.

```
trade.order.placed (T4)
   ├─▶ finance: requests LC/financing ─▶ lc.issued (T8) ─▶ trade.order.financed (T4)
   │                                   └─(refused)─▶ trade.order.cancelled  [COMPENSATE]
   ▼
trade.order.financed (T4)
   ├─▶ compliance: screening.requested ─▶ compliance.screening.cleared (T11)
   │                                    └─(blocked)─▶ trade.order.cancelled [COMPENSATE: lc.cancelled]
   ▼
compliance.screening.cleared
   ├─▶ logistics: shipment.booked ─▶ logistics.shipment.gate_in/loaded/departed (T5)
   ▼
logistics.shipment.departed
   ├─▶ documents: bill_of_lading issued ─▶ document.tradedocument.issued (T7)
   │       └─▶ finance: documents_presented ─▶ lc.examined ─▶ lc.honoured (T8)
   ▼
logistics.shipment.arrived (T5)
   ├─▶ customs: filing.submitted ─▶ customs.filing.accepted ─▶ customs.goods.released (T10)
   │                              └─(rejected/held)─▶ ExceptionQueue [COMPENSATE: hold shipment]
   ▼
customs.goods.released
   ├─▶ logistics.shipment.delivered (T5)
   ▼
trade.order.delivered (T4)
   ├─▶ payments: settlement.initiated ─▶ payment.captured ─▶ payment.settled (T9, EOS→ledger.entry.posted)
   ▼
trade.order.settled ─▶ trade.order.closed (T4)
   └─▶ esg: carbon.entry.recorded (per leg) ; network: edges upserted ; audit: WORM
```

**Compensation events:** `payment.refunded`, `lc.cancelled`, `logistics.shipment.cancelled`, `customs.filing.withdrawn`, `inventory.stock.released`. Each compensation is itself an idempotent event on its owner's topic. Because each step is at-least-once + idempotent, a saga step can be safely retried or replayed without double-effecting.

---

## Appendix A — How this extends (not replaces) the current platform

- The `PlatformEvent` envelope, outbox, idempotent-consumer, audit WORM chain, RBAC verify-only model, tenant `tenant_id`+RLS, and Java↔Node HMAC finance bridge are **all reused unchanged**.
- New contexts are **extracted along existing model seams** (`trade.shipments`→logistics, `trade.documents/bills_of_lading`→documents, `trade.rfqs/quotations`→sourcing) with the monolith's tables becoming the migration source.
- Kafka is a **transport swap behind `@baalvion/events`**, so no producer/consumer application code is rewritten — only `EVENT_TRANSPORT` + topic mapping change.
- `trade.collections` JSONB remains the sanctioned long-tail store; only money/state/dispositive data is promoted to typed tables.
