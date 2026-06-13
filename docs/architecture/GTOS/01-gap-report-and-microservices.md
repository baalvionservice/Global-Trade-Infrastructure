# GTOS — Global Trade Operating System

## Architecture Gap Report & Phase-5 Microservices Catalog

> **Author:** Global Trade Domain Architect (+ CTO gap lens), Enterprise Architecture Council
> **Status:** Design baseline for Phase 5. **MUST extend the current platform, not replace it.**
> **Ground truth referenced:** GTI frontend (`src/core/routes.ts`, `roles.ts`); `trade-service` (Node/Express/Sequelize, schema `trade`, :3025, 28 models + generic `trade.collections`); Java finance suite (account:3016 … trust-score:3046); RBAC :3005; events `baalvion:events` (Redis Streams, transport-swappable); audit-service :3032 WORM; catalog `baalvion.io/v1`; Traefik gateway `/api/v1/<domain>/<service>/*`.

---

## How to read this document

- **Part 1** is a brutal, section-by-section gap report. Each block names the **single biggest risk** explicitly.
- **Part 2** is the expanded `baalvion.io/v1` service catalog for every new service, with bounded-context boundaries and reuse-vs-replace calls.
- A capability already covered by an existing service is marked **[REUSE]**; net-new is **[NEW]**; an existing surface that is a stub to be replaced is **[REPLACE]**.

A recurring theme drives the whole design: **`trade-service` is today a CRUD monolith over schema `trade` with a generic `trade.collections` JSONB escape hatch.** ~17 of its 28 models (orders, deals, rfqs, quotations, escrows, shipments, payments, disputes, documents, compliance, listings, carriers, bills_of_lading, customs_entries, certificates_of_origin, carbon_footprints, insurance) are **anemic record stores with no domain engine behind them** — no UCP 600 examination, no Incoterms cost allocation, no HS classification, no sanctions screening, no eBL title transfer, no demurrage clock. The Java finance suite has the money engines but is **not wired into the trade lifecycle**. GTOS Phase 5 extracts bounded contexts out of the monolith and wires the engines together.

---

# PART 1 — ARCHITECTURE GAP REPORT

## 1.1 — Existing GTI sections (14)

### 1. COMMAND (`/dashboard`, `/executive/command`, buyer/seller/agent dashboards)

| Axis | Gap |
|---|---|
| **Capabilities** | Dashboards are role landing pages, not a control tower. No cross-domain KPI rollup (exposure, working capital locked in LC/escrow, in-transit value, demurrage accruing, sanctions-hit queue, doc-discrepancy backlog). No drill-through from KPI → underlying entity. |
| **Workflows** | No "exception → action" workflow (e.g. a flagged shipment that cannot be cleared and dispatched from Command). No saved views per role/tenant. |
| **Entities** | No `KPISnapshot`, `ExceptionQueueItem`, `AlertSubscription`. |
| **Integrations** | Pulls from a single backend; no aggregation across trade-service + Java finance + new domains. No event-driven materialized read model. |
| **Ops** | No defined freshness SLO for KPIs; no degraded-mode (dashboard should render last-known on partial outage). |
| **Biggest risk** | **Command is cosmetic.** Executives will trust numbers that are stitched client-side from inconsistent sources → wrong capital/exposure decisions. Needs a CQRS read-model fed by `baalvion:events`. |

### 2. MARKETPLACE (`/marketplace`, `/marketplace/prices`, `/discovery/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | Listings live in `trade.listings` (cross-tenant) with no HS/HTS classification, no GTIN, no unit-of-measure normalization, no Incoterm-qualified pricing. "Market Prices" has no reference-price/index feed. |
| **Workflows** | No listing → compliance pre-screen (dual-use/sanctioned commodity) before publish. No buyer-side restricted-party screen on counterparty. |
| **Entities** | No `Product`, `SKU`, `ClassificationResult`, `PriceIndex`. |
| **Integrations** | No product-registry, no classification-service, no sanctions screen at discovery time. |
| **Ops** | Search relevance/latency SLO undefined; no per-tenant catalog isolation guarantees on the cross-tenant table. |
| **Biggest risk** | **Listing a sanctioned/dual-use commodity to a restricted party** with zero pre-publish screening = strict-liability export-control violation. |

### 3. SOURCING & RFQ (`/buyer/rfqs`, `/seller/rfqs`, `/sourcing/*`, `/suppliers`)

| Axis | Gap |
|---|---|
| **Capabilities** | RFQs/quotations are flat records. No structured line items with HS code + UoM + Incoterm + delivery terms. No reverse-auction engine behind `/sourcing/auctions`. `/suppliers` is a list, not a lifecycle. |
| **Workflows** | No RFQ → multi-quote comparison → award → contract draft chain. No supplier qualification gate before award (capacity, certs, AEO, sanctions). |
| **Entities** | No `SupplierProfile`, `FactoryProfile`, `Certification`, `CapacityProfile`, `RFQLineItem`. |
| **Integrations** | No tie to quality-inspection, classification, or supplier-risk scoring. |
| **Ops** | Auction needs idempotent bid handling + tie-break audit; none defined. |
| **Biggest risk** | **Awarding to an unqualified/unscreened supplier** because supplier lifecycle data doesn't exist → counterparty + quality + compliance risk concentrated at award. |

### 4. NEGOTIATIONS (`/deals`, `/negotiations/contracts`, `/messages`)

| Axis | Gap |
|---|---|
| **Capabilities** | `trade.deals` + `trade.messages` are CRUD. The Java **deal-room:3040** and **smart-contract:3041** exist but the GTI deal room isn't wired to them. No Incoterms 2020 clause library, no term-sheet versioning, no e-signature. |
| **Workflows** | No counter-offer state machine reconciling price/qty/Incoterm/payment-terms; no "agreed terms → contract → order" promotion with provenance. |
| **Entities** | No `TermSheet`, `ClauseInstance`, `Signature`, `ContractVersion` in the trade plane. |
| **Integrations** | No esign-service; no doc-center link; no event on "deal agreed" to trigger order + finance. |
| **Ops** | No tamper-evident negotiation log (legal disputes need it; audit-service consumes events but deal mutations don't emit). |
| **Biggest risk** | **Non-repudiation gap.** Agreed terms aren't cryptographically bound to a signed artifact → unenforceable contracts and dispute exposure. |

### 5. ORDERS & EXECUTION (`/orders`)

| Axis | Gap |
|---|---|
| **Capabilities** | `trade.orders` is a record. No order state machine (created→confirmed→in-production→ready→shipped→delivered→closed), no milestone/SLA tracking, no link to PO/contract/Incoterm cost split. |
| **Workflows** | No order amendment with re-approval; no partial-shipment / split-order handling; no settlement trigger on milestone. |
| **Entities** | No `OrderMilestone`, `Amendment`, `IncotermCostAllocation`. |
| **Integrations** | Orders don't drive logistics, finance (LC/escrow), or doc generation. |
| **Ops** | **No idempotency keys** on order/payment mutations; no outbox → events are best-effort. No reconciliation of order ↔ ledger. |
| **Biggest risk** | **Order ↔ money divergence.** Without an outbox + reconciliation, an order can show "paid" while ledger/escrow says otherwise. This is the platform's #1 financial-integrity risk. |

### 6. LOGISTICS (`/logistics/*`, shipments, carriers, bills_of_lading, freight_quotes)

| Axis | Gap |
|---|---|
| **Capabilities** | Shipments/B-L are records. No eBL (MLETR/electronic title), no container tracking (ISO 6346), no milestone events from carriers, no **demurrage/detention** clock, no port/terminal congestion awareness. |
| **Workflows** | No booking → B-L issuance → title transfer → release-against-payment. No customs hand-off. |
| **Entities** | No `ContainerEvent`, `eBLTitleHolder`, `DemurrageAccrual`, `BerthSchedule`. |
| **Integrations** | No carrier EDI/API, no port-community-system, no ports-terminals-service. |
| **Ops** | No event idempotency for duplicate carrier milestones; no clock authority for demurrage. |
| **Biggest risk** | **Paper B-L + no demurrage engine** = silent six-/seven-figure D&D leakage and fraud-prone title transfer. eBL (MLETR) is the strategic gap. |

### 7. FINANCE & TREASURY (`/finance/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | Java suite (ledger:3014, escrow:3017, settlement:3018, recon:3019, wallet:3039, fx:3038, credit:3037, **trade-finance:3036**, payment-rails:3042) has the engines, but: no **UCP 600 document examination** workflow for LCs, no SWIFT MT/MX (MT700/710/750/760, ISO 20022 MX) connectivity, no correspondent-bank network, no multi-currency nostro/vostro modeling. |
| **Workflows** | No LC issuance → advise → presentation → examination → discrepancy/acceptance → settlement. No guarantee (URDG 758) lifecycle surfaced. |
| **Entities** | No `LetterOfCredit`, `DocumentaryPresentation`, `Discrepancy`, `CorrespondentRelationship`, `NostroAccount`, `SwiftMessage`. |
| **Integrations** | No bank-network / SWIFT gateway; trade docs not wired to LC examination. |
| **Ops** | Reconciliation exists (3019) but isn't fed by trade events; no idempotent SWIFT message ingestion. |
| **Biggest risk** | **No UCP 600 examination + no SWIFT rail** = the platform cannot actually do documentary trade finance; it only records that finance happened elsewhere. |

### 8. COMPLIANCE & RISK (`/compliance/*`, `trade.compliance`)

| Axis | Gap |
|---|---|
| **Capabilities** | `trade.compliance` + Java **aml:3045**, **risk:3035**, **trust-score:3046** exist, but no continuous **sanctions/restricted-party screening** (OFAC SDN, EU consolidated, UN, UK/HMT) across counterparties/banks/vessels, no dual-use/export-control (ECCN/EU dual-use list) classification, no denied-vessel screening, no CBAM compliance. |
| **Workflows** | No screen-at-onboarding + continuous rescreen on list updates; no hit adjudication/false-positive workflow with maker-checker; no AEO/C-TPAT status tracking. |
| **Entities** | No `ScreeningResult`, `WatchlistHit`, `Adjudication`, `ExportControlClassification`, `AEORecord`. |
| **Integrations** | aml-service not wired to onboarding/marketplace/orders; no watchlist ingestion pipeline. |
| **Ops** | No list-freshness SLO; no audit of who cleared a hit; no replay on retroactive list additions. |
| **Biggest risk** | **Strict-liability sanctions exposure.** Screening that is point-in-time (or absent) rather than continuous = transacting with a newly-listed party undetected. |

### 9. INTELLIGENCE (`/intelligence/*`, `/discovery/signals`)

| Axis | Gap |
|---|---|
| **Capabilities** | Java **trade-intelligence:3043** exists but isn't surfaced. No demand forecast, supplier-risk, price-index, lane-risk, or trade-graph analytics fed from live events. |
| **Workflows** | No "signal → recommended action → execute" loop into Command. |
| **Entities** | No `Signal`, `ForecastSeries`, `GraphInsight`. |
| **Integrations** | No feature store; no network-graph-service to mine relationships. |
| **Ops** | Model freshness/lineage undefined. |
| **Biggest risk** | **Intelligence is decorative** without a trade graph + feature pipeline; recommendations won't be trustworthy. |

### 10. GOVERNANCE & ADMIN (`/governance/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | RBAC :3005 exists (super_admin>country_admin>org_admin>end_user + ABAC PDP) but new domains define no resources/permissions; no policy for cross-org trade-graph visibility; no maker-checker (4-eyes) for high-risk actions (LC issuance, sanctions clearance, payment release). |
| **Workflows** | No approval-chain engine; no segregation-of-duties enforcement. |
| **Entities** | No `ApprovalChain`, `DualControlRequest`. |
| **Integrations** | New services must register permissions in RBAC; none do yet. |
| **Ops** | No periodic access recertification. |
| **Biggest risk** | **No dual control on money/compliance** → single compromised admin can release payments or clear sanctions hits. |

### 11. IDENTITY & SECURITY (`/identity/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | Counterparties (banks, customs, governments, carriers) need machine identities + mTLS/signed-message identity, not just human users. No KYB (know-your-business) beyond KYC. |
| **Workflows** | No org-onboarding identity proofing tied to compliance screen; no key management for esign/SWIFT/eBL signing. |
| **Entities** | No `MachineIdentity`, `SigningKey`, `KYBRecord`. |
| **Integrations** | No KMS/HSM abstraction for document/eBL/SWIFT signing. |
| **Ops** | Key rotation/runbook undefined. |
| **Biggest risk** | **No signing-key custody story** → eBL title transfer and e-signatures cannot be legally trusted. |

### 12. INFRASTRUCTURE & OPS (`/infra/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | Catalog + Traefik + events + audit exist; but no standard for new-service onboarding (outbox, idempotency, DLQ, tracing) — it's per-service ad hoc. No DLQ/replay tooling for `baalvion:events`. |
| **Workflows** | No service-lifecycle runbook per tier; no chaos/DR drill for trade plane. |
| **Entities** | n/a (platform). |
| **Integrations** | Tracing (traceId is in PlatformEvent) but no enforced propagation across HTTP + events. |
| **Ops** | No golden-signal dashboards per service; SLOs declared in catalog but not measured/alerted. |
| **Biggest risk** | **Operational drift.** 17+ new services without enforced outbox/idempotency/DLQ standards will reproduce the monolith's "best-effort events" problem at 17× the surface. |

### 13. SOVEREIGN COMMAND (`/sovereign/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | Sovereign/national-operator surfaces have no government-gateway, single-window adapter, or national-trade-statistics view. No data-residency / sovereign-tenant isolation guarantees. |
| **Workflows** | No national single-window submission, no customs-authority messaging, no trade-ministry reporting. |
| **Entities** | No `SovereignTenant`, `NationalSingleWindowSubmission`, `RegulatoryReport`. |
| **Integrations** | No government-gateway-service; no per-jurisdiction adapter. |
| **Ops** | Data-residency SLO and sovereign key custody undefined. |
| **Biggest risk** | **Sovereign promises with no isolation/residency enforcement** → regulatory and contractual breach with state customers. |

### 14. SETTINGS / ADMINISTRATION (`/settings/*`)

| Axis | Gap |
|---|---|
| **Capabilities** | No tenant-level configuration of Incoterm defaults, currency, jurisdictions, watchlist sources, doc templates, signing authorities. |
| **Workflows** | No config change → audit → effective-dating. |
| **Entities** | No `TenantPolicy`, `DocTemplate`, `JurisdictionConfig`. |
| **Ops** | Config changes not audited/versioned. |
| **Biggest risk** | **Unversioned config** silently changes compliance/finance behavior with no audit trail. |

---

## 1.2 — New domains to integrate (11)

### A. PRODUCTS (Registry/Master/SKU/Catalog/Classification/GTIN/Intelligence/Compliance)

| Axis | Gap |
|---|---|
| **Capabilities** | No product master at all today (listings are free-form). Need canonical product/SKU, HS/HTS classification with confidence + ruling references, GTIN validation (GS1 check digit), UoM normalization, product-level export-control (dual-use/ECCN), product intelligence (substitutes, price index). |
| **Workflows** | Create product → classify (HS6 + national HTS extension) → screen (dual-use) → enrich (GTIN/UoM) → publish to marketplace. Reclassification on tariff-schedule updates. |
| **Entities** | `Product`, `SKU`, `ClassificationResult`, `GTIN`, `HSCode`, `HTSExtension`, `ExportControlFlag`, `PriceIndexPoint`. |
| **Integrations** | classification-service, sustainability (CBAM goods scope), compliance (dual-use). Feeds marketplace + RFQ line items + customs declarations + CBAM. |
| **Ops** | Classification is decision-grade → needs provenance, model/ruleset version, reproducibility, human-override audit. |
| **Biggest risk** | **Misclassification cascades.** A wrong HS code propagates into duties, CBAM scope, export-control, and customs filings — every downstream filing inherits the error. |

### B. TRADE DOCUMENTATION (Doc Center, CI, Packing List, B/L, AWB, CoO, Insurance/Inspection Certs, Digital Signatures, Validation, eDocs Exchange)

| Axis | Gap |
|---|---|
| **Capabilities** | `trade.documents` is a blob row. No structured doc generation (UN/CEFACT-aligned commercial invoice, packing list), no template engine, no validation against UCP 600/ISBP/eUCP, no digital signature, no eDocs interchange (UN/EDIFACT, ISO 20022, DCSA/eBL). |
| **Workflows** | Generate → validate (data + UCP/ISBP rules) → sign → exchange → present (to LC examination) → archive (WORM). Cross-checking (CI vs PL vs B/L vs LC) for discrepancies. |
| **Entities** | `Document`, `DocumentTemplate`, `DocumentSet`, `ValidationFinding`, `Signature`, `ExchangeTransaction`. |
| **Integrations** | esign-service, edocs-exchange-service, banking-network (LC presentation), customs (single-window), audit (WORM). |
| **Ops** | Documents are legal evidence → immutability + signature verification + retention SLO + reproducible render. |
| **Biggest risk** | **Discrepant documents reach LC presentation** because there's no automated cross-document consistency + UCP/ISBP validation → LC rejected, payment delayed/denied. |

### C. QUALITY & INSPECTION (Factory Audits, Product/Pre-Shipment Inspection, Lab Testing, Quality Certs, Corrective Actions, Compliance Testing)

| Axis | Gap |
|---|---|
| **Capabilities** | None today. Need inspection booking, AQL sampling plans, checklist execution, lab-result capture, pass/fail gating, CAPA tracking, certificate issuance. |
| **Workflows** | Schedule inspection → execute checklist (mobile/offline) → result → gate shipment release → CAPA on fail → re-inspect. Pre-shipment inspection (PSI) as a release gate. |
| **Entities** | `Inspection`, `AuditReport`, `LabTest`, `QualityCertificate`, `CorrectiveAction`, `SamplingPlan`. |
| **Integrations** | supplier-lifecycle (performance scoring), orders (release gate), doc-center (cert issuance). |
| **Ops** | Offline capture + later reconciliation; result immutability; inspector identity/attestation. |
| **Biggest risk** | **No release gate** → defective goods ship and are paid for; quality risk has no enforcement point. |

### D. WAREHOUSING (Warehouse Network, Inventory Control, Fulfillment/Distribution Centers, Cold Chain, Stock Intelligence, Operations)

| Axis | Gap |
|---|---|
| **Capabilities** | No WMS. Need warehouse/location model, lot/batch/serial inventory, putaway/pick/pack, cold-chain telemetry + excursion alerts, ATP/available-to-promise, cycle counts. |
| **Workflows** | Receive → putaway → store (with cold-chain monitoring) → pick/pack → ship; bonded-warehouse customs status. |
| **Entities** | `Warehouse`, `Location`, `StockLot`, `InventoryMovement`, `ColdChainReading`, `Reservation`. |
| **Integrations** | logistics (inbound/outbound), orders (ATP), customs (bonded status), ports-terminals (yard handoff). |
| **Ops** | Inventory is money → needs strict idempotent movements + reconciliation vs ledger; telemetry ingestion at scale. |
| **Biggest risk** | **Inventory inaccuracy + unmonitored cold chain** → overselling and spoilage liability with no audit trail. |

### E. SUPPLIER LIFECYCLE (Onboarding, Factory Profiles, Certifications, Capacity, Performance, Risk, Discovery)

| Axis | Gap |
|---|---|
| **Capabilities** | `/suppliers` is a list. Need structured onboarding (KYB + screening), factory profiles, cert registry with expiry, capacity modeling, performance scorecards (OTD, defect rate), risk scoring, discovery/matching. |
| **Workflows** | Onboard → KYB + sanctions screen → qualify (certs/capacity/audit) → approve → monitor performance → periodic re-qualification → offboard. |
| **Entities** | `SupplierProfile`, `FactoryProfile`, `Certification`, `CapacityProfile`, `PerformanceScore`, `SupplierRiskRating`. |
| **Integrations** | compliance (screening), quality (audit results), network-graph, trust-score:3046, RFQ (qualification gate). |
| **Ops** | Cert-expiry alerting; re-screen on watchlist updates; scorecard lineage. |
| **Biggest risk** | **Stale qualification.** An approved supplier whose cert lapsed or who got sanctioned post-onboarding keeps transacting. |

### F. BANKING NETWORK (Bank Registry, Correspondent Banking, SWIFT, Multi-Currency Accounts, FX Marketplace, Liquidity, Settlement Network)

| Axis | Gap |
|---|---|
| **Capabilities** | Java money engines exist but no **bank network**: no bank registry (BIC/LEI), correspondent (nostro/vostro) graph, SWIFT MT/MX connectivity, multi-currency account modeling, FX marketplace surfacing, liquidity routing. |
| **Workflows** | Onboard bank → establish correspondent relationship → route LC/payment via SWIFT → settle → reconcile. |
| **Entities** | `Bank`, `CorrespondentRelationship`, `NostroVostroAccount`, `SwiftMessage`, `FXQuote`, `LiquidityPosition`. |
| **Integrations** | swift-connectivity-service, fx:3038, settlement:3018, ledger:3014, trade-finance:3036, sanctions (screen every counterparty bank + MT field 50/59). |
| **Ops** | Idempotent SWIFT ingestion (dedup on message ref); sanctions screen on every message; reconciliation SLA. |
| **Biggest risk** | **Unscreened correspondent/payment chain** → sanctioned intermediary bank in the payment path = direct OFAC violation. |

### G. GOVERNMENT GATEWAY (Customs Authorities, Trade Ministries, Port Authorities, National Single Window, Tax Agencies, Regulatory APIs, Government Messaging)

| Axis | Gap |
|---|---|
| **Capabilities** | None. Need per-jurisdiction adapters to National Single Windows (UN/CEFACT, WCO Data Model), customs declaration submission, duty/tax computation hooks, government messaging (async, signed). |
| **Workflows** | Build declaration (from product HS + order + docs) → submit to single window → receive status/assessment → pay duty → obtain release. |
| **Entities** | `CustomsAuthority`, `SingleWindowSubmission`, `CustomsDeclaration`, `DutyAssessment`, `RegulatoryMessage`. |
| **Integrations** | products (HS), trade-docs, banking (duty payment), ports (release), sustainability (CBAM declaration). |
| **Ops** | Per-jurisdiction adapter versioning; signed messaging + non-repudiation; submission idempotency + status reconciliation. |
| **Biggest risk** | **Tight coupling to N heterogeneous government APIs.** One adapter must not take down the platform; needs an adapter pattern + circuit breakers + outbox, or customs becomes a single point of failure. |

### H. TRADE RESOLUTION (Claims, Arbitration, Mediation, Case Mgmt, Resolution Workflows, Evidence Vault)

| Axis | Gap |
|---|---|
| **Capabilities** | `trade.disputes` + Java **dispute:3044** exist but thin. Need claim intake, tiered resolution (negotiation→mediation→arbitration), case management, tamper-evident **evidence vault**, settlement integration. |
| **Workflows** | File claim → evidence collection (signed, hash-chained) → mediation → arbitration → award → settlement/escrow release. |
| **Entities** | `Claim`, `Case`, `EvidenceItem`, `ResolutionStep`, `Award`. |
| **Integrations** | escrow:3017 (hold/release), trade-docs (evidence), audit (WORM), esign (settlement agreement). |
| **Ops** | Evidence immutability + chain-of-custody + retention; arbitrator identity/conflict checks. |
| **Biggest risk** | **Evidence tampering or chain-of-custody gaps** → awards unenforceable; the vault must be WORM + hash-chained like audit-service. |

### I. SUSTAINABILITY & ESG (Carbon Ledger, Emissions, ESG Reporting, Analytics, CBAM, Green Trade Metrics)

| Axis | Gap |
|---|---|
| **Capabilities** | `trade.carbon_footprints` is a record. Need an auditable **carbon ledger** (factor-based + activity data), Scope 1/2/3 attribution, **CBAM** embedded-emissions calculation + quarterly declaration, ESG reporting, green-trade scoring. |
| **Workflows** | Capture activity (shipment lane, product, energy) → apply emission factors (versioned) → ledger entry → CBAM report → declaration to government gateway. |
| **Entities** | `EmissionFactor`, `CarbonLedgerEntry`, `CBAMDeclaration`, `ESGReport`, `GreenScore`. |
| **Integrations** | products (CBAM goods scope + embedded emissions), logistics (lane/mode emissions), government-gateway (CBAM filing), reporting:3024. |
| **Ops** | Emission-factor versioning + recompute lineage; CBAM declaration reconciliation; immutable ledger. |
| **Biggest risk** | **CBAM non-compliance.** Wrong/unauditable embedded-emissions = financial penalties and import refusal into the EU; the carbon ledger must be as rigorous as the financial ledger. |

### J. PORTS & TERMINALS (Port/Terminal Registry, Congestion, Berth Scheduling, Container Yard, Intelligence)

| Axis | Gap |
|---|---|
| **Capabilities** | None. Need port/terminal registry (UN/LOCODE), congestion + dwell intelligence, berth scheduling, container yard (ISO 6346) status, port-community-system integration. |
| **Workflows** | Track vessel/container → berth/yard status → gate-in/out events → feed demurrage clock + ETA. |
| **Entities** | `Port`, `Terminal`, `BerthSlot`, `YardSlot`, `CongestionIndex`, `GateEvent`. |
| **Integrations** | logistics (demurrage, ETA), intelligence (lane risk), carriers, network-graph. |
| **Ops** | High-volume event ingestion; idempotent gate events; ETA freshness SLO. |
| **Biggest risk** | **No congestion/dwell awareness** → ETAs and demurrage estimates are blind; D&D and missed-connection costs go undetected. |

### K. NETWORK (top-level — Buyers/Sellers/Suppliers/Manufacturers/Banks/Insurers/Carriers/Ports/Warehouses/Customs Authorities/Governments/Inspectors/Trade Agents)

| Axis | Gap |
|---|---|
| **Capabilities** | No first-class network/party model or **trade graph**. Each party type is implicit/scattered. Need a unified party entity (Profiles, Relationships, Permissions, Compliance status, Activity history, graph connections). |
| **Workflows** | Onboard party → KYB/screen → establish relationships (buys-from, banks-with, ships-via) → maintain compliance status → traverse graph for risk/discovery. |
| **Entities** | `Party` (polymorphic by type), `Relationship` (typed edges), `PartyComplianceStatus`, `ActivityEvent`, `TradeGraphNode/Edge`. |
| **Integrations** | Every domain references parties; compliance status flows from aml/sanctions; graph feeds intelligence + supplier discovery. |
| **Ops** | Graph consistency from events; per-tenant graph visibility (RBAC/ABAC); recompute on relationship change. |
| **Biggest risk** | **Identity fragmentation.** Without one party model + graph, the same sanctioned entity appears as three unlinked records and screening misses it. This is the spine the whole GTOS hangs on. |

---

# PART 2 — PHASE-5 MICROSERVICES CATALOG (`baalvion.io/v1`)

## 2.1 — Cross-cutting platform contract (applies to EVERY new service)

Every service below **MUST**:

1. **Gateway:** be reachable via Traefik at `/api/v1/<domain>/<service>/*` with `stripPrefix`; declare `apis:` paths relative to that mount.
2. **Catalog:** ship a `baalvion.io/v1` descriptor in `Backend/catalog/services/<name>.yaml` (validated by `enforce.mjs`); `dependsOn`/`consumesEvents`/`producesEvents` must be accurate (enforce checks C3/C6).
3. **Tenancy:** scope all tenant data with `@baalvion/tenancy` (AsyncLocalStorage + `tenant_id`) following the trade-service pattern; cross-tenant reference tables (parties, banks, ports, HS codes, emission factors) are explicitly excluded and read-only-shared. Sovereign tenants enforce data residency at the datastore layer.
4. **RBAC:** register `{resource}:{action}` permissions with RBAC :3005 and enforce via the ABAC PDP `POST /v1/authorize` (deny-overrides + obligations). High-risk actions require dual-control obligations.
5. **Events:** publish/consume on `baalvion:events` (Redis Streams) via `@baalvion/events`/`@baalvion/sdk` using `PlatformEvent{id,type,payload,orgId,userId,timestamp,traceId}`. audit-service :3032 auto-consumes for the WORM hash-chain. Propagate `traceId` across HTTP + events.
6. **Reliability standard (non-negotiable for tier-0/1):** transactional **outbox** for event emission, **idempotency keys** on all state-changing APIs, **DLQ + replay** for consumers, structured logs + golden-signal metrics tied to the declared SLO.

Event type namespace convention: `<domain>.<entity>.<action>` (e.g. `product.classification.completed`, `compliance.screening.hit`, `finance.lc.presented`).

---

## 2.2 — Service descriptors

> Format mirrors the live catalog (`trade-service.yaml`). `apis` are shown at the gateway path. Existing services are referenced by their real names/ports.

### network-graph-service  **[NEW]** — the spine

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: network-graph-service
  description: Unified party model + trade graph (parties, typed relationships, compliance status, activity).
  domain: ecosystem
  division: trade
  context: network
  owner: "@baalvion/trade-network"
  tier: tier-0
spec:
  lifecycle: design
  language: go           # high-fanout graph traversals + heavy read concurrency; Go for latency + goroutine fanout
  ingress: internal
  datastores: [postgres, neo4j, redis]   # PG = party system-of-record; Neo4j = graph edges; redis = cache
  dependsOn: [rbac-service, aml-service, trust-score-service]
  consumesEvents: [supplier.onboarded, bank.registered, compliance.screening.completed, order.created, finance.settlement.completed]
  producesEvents: [network.party.created, network.relationship.created, network.compliance.status.changed, network.graph.recomputed]
  apis:
    - /api/v1/ecosystem/network-graph/parties
    - /api/v1/ecosystem/network-graph/parties/{id}/relationships
    - /api/v1/ecosystem/network-graph/graph/traverse
    - /api/v1/ecosystem/network-graph/parties/{id}/compliance-status
  slo: { availability: 0.999, latencyP95Ms: 150 }
  deploy: { chart: baalvion-service, namespace: baalvion-trade, minReplicas: 3, maxReplicas: 12 }
```
**Bounded context:** owns `Party` (polymorphic: buyer/seller/supplier/manufacturer/bank/insurer/carrier/port/warehouse/customs-authority/government/inspector/agent) + typed relationship edges. **Every other service references parties by `partyId`; none owns its own copy.** **Reuse:** trust-score:3046 for ratings, aml:3045 for compliance status (consumed, not duplicated). **Replaces:** the scattered identity in `trade.organizations`/`trade.carriers` (those become party projections).

---

### product-registry-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: product-registry-service
  description: Product/SKU master, GTIN validation, UoM normalization, catalog.
  domain: commerce
  division: trade
  context: products
  owner: "@baalvion/trade-products"
  tier: tier-1
spec:
  lifecycle: design
  language: node          # CRUD-heavy master data; consistent with commerce stack + trade-service
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [classification-service, search-service]
  consumesEvents: [product.classification.completed]
  producesEvents: [product.created, product.updated, sku.created, product.published]
  apis:
    - /api/v1/commerce/product-registry/products
    - /api/v1/commerce/product-registry/products/{id}/skus
    - /api/v1/commerce/product-registry/gtin/validate
  slo: { availability: 0.99, latencyP95Ms: 300 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 10 }
```
**Bounded context:** product/SKU master only. **Reuse:** search-service for catalog search; classification-service for HS. **Replaces:** free-form `trade.listings` product data — listings become references to products.

---

### classification-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: classification-service
  description: HS/HTS classification (HS6 + national extensions), ECCN/dual-use flags, ruling references, confidence + provenance.
  domain: commerce
  division: trade
  context: products
  owner: "@baalvion/trade-products"
  tier: tier-1
spec:
  lifecycle: design
  language: python        # ML/rules classifier + tariff-schedule datasets; Python for model + data tooling
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [ml-service]
  consumesEvents: [product.created]
  producesEvents: [product.classification.completed, product.exportcontrol.flagged]
  apis:
    - /api/v1/commerce/classification/classify
    - /api/v1/commerce/classification/hs/{code}
    - /api/v1/commerce/classification/reclassify
  slo: { availability: 0.99, latencyP95Ms: 800 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** HS/HTS + export-control classification only. Decisions carry `rulesetVersion` + provenance for reproducibility. **Reuse:** ml-service for inference. Feeds products, customs, CBAM, compliance.

---

### trade-document-service  **[REPLACE — promotes `trade.documents`]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: trade-document-service
  description: Doc Center — generate/validate (UCP600/ISBP/eUCP) commercial invoices, packing lists, B/L, AWB, CoO, insurance/inspection certs; cross-document discrepancy checks.
  domain: commerce
  division: trade
  context: trade-docs
  owner: "@baalvion/trade-docs"
  tier: tier-1
spec:
  lifecycle: design
  language: node
  ingress: internal
  datastores: [postgres, s3, redis]   # s3 = rendered artifacts (WORM bucket)
  dependsOn: [esign-service, classification-service, audit-service]
  consumesEvents: [order.confirmed, shipment.created]
  producesEvents: [document.generated, document.validated, document.discrepancy.detected]
  apis:
    - /api/v1/commerce/trade-docs/documents
    - /api/v1/commerce/trade-docs/documents/{id}/validate
    - /api/v1/commerce/trade-docs/document-sets/{id}/cross-check
    - /api/v1/commerce/trade-docs/templates
  slo: { availability: 0.99, latencyP95Ms: 600 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** document data, templates, validation rules. **Reuse:** esign for signing, audit for WORM archive. **Replaces** the `trade.documents` blob store; trade-service stops owning documents.

---

### esign-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: esign-service
  description: Digital/e-signature + signing-key custody (KMS/HSM) for documents, term sheets, eBL title, settlement agreements.
  domain: platform
  division: trade
  context: signatures
  owner: "@baalvion/platform-trust"
  tier: tier-0
spec:
  lifecycle: design
  language: go            # crypto + KMS/HSM integration; Go for performance + strong crypto libs
  ingress: internal
  datastores: [postgres, kms]
  dependsOn: [audit-service, rbac-service]
  consumesEvents: []
  producesEvents: [signature.applied, signature.verified]
  apis:
    - /api/v1/platform/esign/sign
    - /api/v1/platform/esign/verify
    - /api/v1/platform/esign/keys
  slo: { availability: 0.999, latencyP95Ms: 300 }
  deploy: { chart: baalvion-service, namespace: baalvion-platform, minReplicas: 3, maxReplicas: 8 }
```
**Bounded context:** signing + key custody only (single crypto authority for the trade plane; mirrors how CMS is sole crypto authority for content). Used by trade-docs, deal-room (smart-contract:3041), eBL, resolution.

---

### edocs-exchange-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: edocs-exchange-service
  description: Electronic document interchange — UN/EDIFACT, ISO 20022, DCSA/eBL (MLETR) title transfer between parties/banks/customs.
  domain: ecosystem
  division: trade
  context: trade-docs
  owner: "@baalvion/trade-docs"
  tier: tier-1
spec:
  lifecycle: design
  language: java          # message-standard heavy (EDIFACT/ISO20022); reuses JVM message libs alongside finance suite
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [trade-document-service, esign-service, network-graph-service]
  consumesEvents: [document.validated, shipment.created]
  producesEvents: [edocs.exchanged, ebl.title.transferred]
  apis:
    - /api/v1/ecosystem/edocs-exchange/transactions
    - /api/v1/ecosystem/edocs-exchange/ebl/{id}/transfer-title
  slo: { availability: 0.99, latencyP95Ms: 700 }
  deploy: { chart: baalvion-service, namespace: baalvion-trade, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** inter-party document/title transport + eBL title registry (MLETR). **Reuse:** trade-docs (content), esign (title signatures), network-graph (party endpoints).

---

### quality-inspection-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: quality-inspection-service
  description: Factory audits, product/pre-shipment inspections, lab testing, AQL sampling, quality certs, CAPA. Acts as shipment-release gate.
  domain: commerce
  division: trade
  context: quality
  owner: "@baalvion/trade-quality"
  tier: tier-2
spec:
  lifecycle: design
  language: node
  ingress: internal
  datastores: [postgres, s3, redis]
  dependsOn: [supplier-lifecycle-service, trade-document-service]
  consumesEvents: [order.confirmed]
  producesEvents: [inspection.completed, inspection.failed, quality.gate.passed, capa.opened]
  apis:
    - /api/v1/commerce/quality/inspections
    - /api/v1/commerce/quality/inspections/{id}/result
    - /api/v1/commerce/quality/capa
  slo: { availability: 0.99, latencyP95Ms: 400 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 6 }
```
**Bounded context:** inspection lifecycle + CAPA. Emits `quality.gate.passed` consumed by order/logistics as a release gate. **Reuse:** trade-docs for cert issuance, supplier-lifecycle for scoring.

---

### warehouse-service (WMS)  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: warehouse-service
  description: WMS — warehouse/location model, lot/batch/serial inventory, putaway/pick/pack, cold-chain telemetry, ATP, bonded status.
  domain: commerce
  division: trade
  context: warehousing
  owner: "@baalvion/trade-logistics"
  tier: tier-1
spec:
  lifecycle: design
  language: go            # high-throughput inventory movements + telemetry ingestion; Go for concurrency
  ingress: internal
  datastores: [postgres, redis, timescaledb]   # timescale = cold-chain telemetry
  dependsOn: [ledger-service, network-graph-service]
  consumesEvents: [order.confirmed, shipment.delivered]
  producesEvents: [inventory.received, inventory.reserved, inventory.shipped, coldchain.excursion]
  apis:
    - /api/v1/commerce/warehouse/inventory
    - /api/v1/commerce/warehouse/movements
    - /api/v1/commerce/warehouse/availability
    - /api/v1/commerce/warehouse/coldchain/readings
  slo: { availability: 0.999, latencyP95Ms: 250 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 3, maxReplicas: 12 }
```
**Bounded context:** physical inventory + warehouse ops. Movements reconcile against ledger:3014. **Reuse:** ledger for inventory valuation, fulfillment-service (existing) for outbound where applicable.

---

### supplier-lifecycle-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: supplier-lifecycle-service
  description: Supplier onboarding (KYB), factory profiles, certs, capacity, performance scorecards, risk, discovery.
  domain: ecosystem
  division: trade
  context: suppliers
  owner: "@baalvion/trade-network"
  tier: tier-1
spec:
  lifecycle: design
  language: node
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [network-graph-service, aml-service, trust-score-service, quality-inspection-service]
  consumesEvents: [compliance.screening.completed, inspection.completed, order.delivered]
  producesEvents: [supplier.onboarded, supplier.qualified, supplier.risk.changed, certification.expiring]
  apis:
    - /api/v1/ecosystem/supplier-lifecycle/suppliers
    - /api/v1/ecosystem/supplier-lifecycle/suppliers/{id}/certifications
    - /api/v1/ecosystem/supplier-lifecycle/suppliers/{id}/scorecard
    - /api/v1/ecosystem/supplier-lifecycle/discovery
  slo: { availability: 0.99, latencyP95Ms: 350 }
  deploy: { chart: baalvion-service, namespace: baalvion-trade, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** supplier-as-party lifecycle (suppliers are parties in network-graph; this owns the supplier-specific aggregate). **Reuse:** aml/trust-score/quality (consumed), network-graph (party identity). **Replaces** the `/suppliers` flat list.

---

### compliance-screening-service  **[NEW — wraps/orchestrates aml:3045]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: compliance-screening-service
  description: Continuous sanctions/restricted-party screening (OFAC/EU/UN/HMT), dual-use/export-control, denied-vessel, AEO/C-TPAT tracking, hit adjudication (maker-checker).
  domain: identity
  division: trade
  context: compliance
  owner: "@baalvion/platform-compliance"
  tier: tier-0
spec:
  lifecycle: design
  language: java          # reuses aml-service (3045) JVM matching engine; co-located with finance/risk suite
  ingress: internal
  datastores: [postgres, redis, opensearch]   # opensearch = watchlist fuzzy match index
  dependsOn: [aml-service, network-graph-service, rbac-service, audit-service]
  consumesEvents: [network.party.created, bank.registered, order.created, shipment.created, watchlist.updated]
  producesEvents: [compliance.screening.completed, compliance.screening.hit, compliance.hit.cleared]
  apis:
    - /api/v1/identity/compliance-screening/screen
    - /api/v1/identity/compliance-screening/hits
    - /api/v1/identity/compliance-screening/hits/{id}/adjudicate
    - /api/v1/identity/compliance-screening/watchlists
  slo: { availability: 0.999, latencyP95Ms: 500 }
  deploy: { chart: baalvion-service, namespace: baalvion-identity, minReplicas: 3, maxReplicas: 10 }
```
**Bounded context:** screening + adjudication workflow. **Reuse — does NOT replace** aml:3045 (the matching engine); this adds continuous rescreen, watchlist ingestion, maker-checker adjudication, and platform-wide screening as a service. Clearing a hit requires a dual-control RBAC obligation.

---

### banking-network-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: banking-network-service
  description: Bank registry (BIC/LEI), correspondent (nostro/vostro) graph, multi-currency accounts, FX marketplace surfacing, liquidity routing.
  domain: commerce
  division: finance
  context: banking-network
  owner: "@baalvion/finance"
  tier: tier-0
spec:
  lifecycle: design
  language: java          # belongs to the JVM finance suite; depends on ledger/fx/settlement
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [ledger-service, fx-service, settlement-service, swift-connectivity-service, compliance-screening-service, network-graph-service]
  consumesEvents: [finance.settlement.completed]
  producesEvents: [bank.registered, correspondent.established, fx.quote.published]
  apis:
    - /api/v1/commerce/banking-network/banks
    - /api/v1/commerce/banking-network/correspondents
    - /api/v1/commerce/banking-network/accounts
    - /api/v1/commerce/banking-network/fx/marketplace
  slo: { availability: 0.999, latencyP95Ms: 300 }
  deploy: { chart: baalvion-service, namespace: baalvion-finance, minReplicas: 3, maxReplicas: 8 }
```
**Bounded context:** bank/correspondent network + multi-currency accounts. **Reuse:** ledger:3014, fx:3038, settlement:3018 (engines); network-graph for bank identity. Screens every counterparty bank via compliance-screening.

---

### swift-connectivity-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: swift-connectivity-service
  description: SWIFT MT/MX (MT700/710/750/760, ISO 20022 MX) message ingestion/dispatch; normalized inbound/outbound; idempotent dedup + sanctions screen per message.
  domain: commerce
  division: finance
  context: swift
  owner: "@baalvion/finance"
  tier: tier-0
spec:
  lifecycle: design
  language: java
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [compliance-screening-service, audit-service]
  consumesEvents: [finance.lc.issued, finance.payment.instructed]
  producesEvents: [swift.message.received, swift.message.sent, swift.message.screened]
  apis:
    - /api/v1/commerce/swift-connectivity/messages/inbound
    - /api/v1/commerce/swift-connectivity/messages/outbound
    - /api/v1/commerce/swift-connectivity/messages/{ref}
  slo: { availability: 0.999, latencyP95Ms: 400 }
  deploy: { chart: baalvion-service, namespace: baalvion-finance, minReplicas: 3, maxReplicas: 8 }
```
**Bounded context:** SWIFT rail only. Idempotent on SWIFT message reference; every message screened before processing. Feeds trade-finance:3036 (LC) + banking-network + payment-rails:3042.

---

### trade-finance-lc-service  **[NEW — orchestrator over trade-finance:3036]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: trade-finance-lc-service
  description: Letter-of-credit + guarantee lifecycle — issuance/advise/presentation/UCP600 examination/discrepancy/acceptance/settlement; eUCP doc handling.
  domain: commerce
  division: finance
  context: trade-finance
  owner: "@baalvion/finance"
  tier: tier-0
spec:
  lifecycle: design
  language: java
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [trade-finance-service, trade-document-service, swift-connectivity-service, settlement-service, escrow-service]
  consumesEvents: [document.validated, swift.message.received, deal.agreed]
  producesEvents: [finance.lc.issued, finance.lc.presented, finance.lc.discrepancy, finance.lc.settled]
  apis:
    - /api/v1/commerce/trade-finance-lc/lcs
    - /api/v1/commerce/trade-finance-lc/lcs/{id}/presentations
    - /api/v1/commerce/trade-finance-lc/lcs/{id}/examine
    - /api/v1/commerce/trade-finance-lc/guarantees
  slo: { availability: 0.999, latencyP95Ms: 500 }
  deploy: { chart: baalvion-service, namespace: baalvion-finance, minReplicas: 3, maxReplicas: 8 }
```
**Bounded context:** documentary-credit lifecycle + UCP 600/ISBP examination workflow. **Reuse — extends** trade-finance:3036 (which lacks the examination/SWIFT/doc-presentation orchestration). Examination is maker-checker via RBAC dual control.

---

### government-gateway-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: government-gateway-service
  description: Adapter hub to customs authorities, trade ministries, port authorities, tax agencies; signed async government messaging; circuit-broken per jurisdiction.
  domain: ecosystem
  division: trade
  context: government
  owner: "@baalvion/sovereign"
  tier: tier-1
spec:
  lifecycle: design
  language: go            # many concurrent external adapters + circuit breakers; Go for resilient I/O
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [single-window-adapter-service, esign-service, audit-service]
  consumesEvents: [customs.declaration.built]
  producesEvents: [government.message.sent, government.message.received]
  apis:
    - /api/v1/ecosystem/government-gateway/authorities
    - /api/v1/ecosystem/government-gateway/messages
  slo: { availability: 0.99, latencyP95Ms: 800 }
  deploy: { chart: baalvion-service, namespace: baalvion-trade, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** government endpoint registry + signed messaging + resilience boundary. Per-jurisdiction logic lives in single-window-adapter-service so one failing adapter cannot cascade.

---

### single-window-adapter-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: single-window-adapter-service
  description: National Single Window adapters (UN/CEFACT, WCO Data Model); build/submit customs declarations; duty/tax assessment + release status reconciliation.
  domain: ecosystem
  division: trade
  context: government
  owner: "@baalvion/sovereign"
  tier: tier-1
spec:
  lifecycle: design
  language: java          # WCO/UN-CEFACT message mapping; reuses JVM message tooling
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [product-registry-service, classification-service, trade-document-service, government-gateway-service]
  consumesEvents: [shipment.created, document.validated]
  producesEvents: [customs.declaration.built, customs.declaration.submitted, customs.released, duty.assessed]
  apis:
    - /api/v1/ecosystem/single-window/declarations
    - /api/v1/ecosystem/single-window/declarations/{id}/submit
    - /api/v1/ecosystem/single-window/declarations/{id}/status
  slo: { availability: 0.99, latencyP95Ms: 900 }
  deploy: { chart: baalvion-service, namespace: baalvion-trade, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** declaration build + per-jurisdiction adapter mapping. **Replaces** `trade.customs_entries` as system of record (those become projections). Submissions are idempotent + status-reconciled.

---

### trade-resolution-service  **[NEW — extends dispute:3044]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: trade-resolution-service
  description: Claims, tiered mediation/arbitration, case management, WORM hash-chained evidence vault, award + settlement.
  domain: commerce
  division: trade
  context: resolution
  owner: "@baalvion/trade-resolution"
  tier: tier-1
spec:
  lifecycle: design
  language: java
  ingress: internal
  datastores: [postgres, s3, redis]
  dependsOn: [dispute-service, escrow-service, esign-service, trade-document-service, audit-service]
  consumesEvents: [order.disputed, quality.gate.failed]
  producesEvents: [claim.filed, resolution.mediated, resolution.arbitrated, resolution.award.issued]
  apis:
    - /api/v1/commerce/trade-resolution/claims
    - /api/v1/commerce/trade-resolution/cases/{id}/evidence
    - /api/v1/commerce/trade-resolution/cases/{id}/award
  slo: { availability: 0.99, latencyP95Ms: 500 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 6 }
```
**Bounded context:** dispute case + evidence vault. Evidence is hash-chained (same WORM pattern as audit-service). **Reuse:** dispute:3044 (engine), escrow:3017 (hold/release on award), esign (settlement agreement). **Replaces** the thin `trade.disputes`.

---

### sustainability-esg-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: sustainability-esg-service
  description: ESG reporting, CBAM embedded-emissions calc + quarterly declaration, green-trade scoring, analytics.
  domain: commerce
  division: trade
  context: sustainability
  owner: "@baalvion/trade-esg"
  tier: tier-2
spec:
  lifecycle: design
  language: python        # emission-factor datasets + analytics + CBAM calc; Python for data/modeling
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [carbon-ledger-service, product-registry-service, single-window-adapter-service, reporting-service]
  consumesEvents: [carbon.ledger.entry.created, shipment.delivered]
  producesEvents: [esg.report.generated, cbam.declaration.filed]
  apis:
    - /api/v1/commerce/sustainability-esg/reports
    - /api/v1/commerce/sustainability-esg/cbam/declarations
    - /api/v1/commerce/sustainability-esg/scores
  slo: { availability: 0.99, latencyP95Ms: 700 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 6 }
```
**Bounded context:** ESG/CBAM reporting layer over the carbon ledger. **Reuse:** reporting:3024, single-window for CBAM filing.

---

### carbon-ledger-service  **[NEW — promotes `trade.carbon_footprints`]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: carbon-ledger-service
  description: Auditable carbon ledger — versioned emission factors, Scope 1/2/3 attribution, immutable activity-based entries with recompute lineage.
  domain: commerce
  division: trade
  context: sustainability
  owner: "@baalvion/trade-esg"
  tier: tier-1
spec:
  lifecycle: design
  language: java          # ledger semantics mirror financial ledger (immutability, double-entry-style attribution)
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [product-registry-service, audit-service]
  consumesEvents: [shipment.delivered, inventory.shipped, order.delivered]
  producesEvents: [carbon.ledger.entry.created, emission.factor.versioned]
  apis:
    - /api/v1/commerce/carbon-ledger/entries
    - /api/v1/commerce/carbon-ledger/factors
    - /api/v1/commerce/carbon-ledger/footprint/{entityId}
  slo: { availability: 0.99, latencyP95Ms: 400 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 6 }
```
**Bounded context:** immutable carbon ledger. **Replaces** `trade.carbon_footprints` record store with a versioned, auditable ledger.

---

### ports-terminals-service  **[NEW]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: ports-terminals-service
  description: Port/terminal registry (UN/LOCODE), congestion + dwell intelligence, berth scheduling, container yard (ISO 6346) status, gate events.
  domain: ecosystem
  division: trade
  context: ports
  owner: "@baalvion/trade-logistics"
  tier: tier-2
spec:
  lifecycle: design
  language: go            # high-volume gate/yard event ingestion; Go for throughput
  ingress: internal
  datastores: [postgres, redis, timescaledb]
  dependsOn: [network-graph-service]
  consumesEvents: [shipment.created]
  producesEvents: [port.gate.event, port.congestion.updated, berth.scheduled]
  apis:
    - /api/v1/ecosystem/ports-terminals/ports
    - /api/v1/ecosystem/ports-terminals/terminals/{id}/congestion
    - /api/v1/ecosystem/ports-terminals/berths
    - /api/v1/ecosystem/ports-terminals/yard/events
  slo: { availability: 0.99, latencyP95Ms: 300 }
  deploy: { chart: baalvion-service, namespace: baalvion-trade, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** ports/terminals registry + congestion + yard events. Feeds logistics demurrage clock + intelligence lane risk.

---

### logistics-execution-service  **[REPLACE — extracts shipments/B-L/carriers/freight from trade-service]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: logistics-execution-service
  description: Shipment orchestration, carrier booking, container tracking (ISO 6346), milestone events, demurrage/detention clock, ETA. eBL delegated to edocs-exchange.
  domain: commerce
  division: trade
  context: logistics
  owner: "@baalvion/trade-logistics"
  tier: tier-1
spec:
  lifecycle: design
  language: node
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [ports-terminals-service, edocs-exchange-service, network-graph-service, warehouse-service]
  consumesEvents: [order.confirmed, quality.gate.passed, port.gate.event]
  producesEvents: [shipment.created, shipment.milestone, shipment.delivered, demurrage.accrued]
  apis:
    - /api/v1/commerce/logistics/shipments
    - /api/v1/commerce/logistics/shipments/{id}/milestones
    - /api/v1/commerce/logistics/bookings
    - /api/v1/commerce/logistics/demurrage
  slo: { availability: 0.99, latencyP95Ms: 350 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 2, maxReplicas: 10 }
```
**Bounded context:** shipment execution + demurrage. **Replaces** `trade.shipments`/`bills_of_lading`/`carriers`/`freight_quotes` ownership in trade-service. Carriers become parties (network-graph); eBL title in edocs-exchange.

---

### order-execution-service  **[REPLACE — extracts orders/deals from trade-service]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: order-execution-service
  description: Order state machine, milestones/SLAs, Incoterm 2020 cost allocation, amendments, partial shipments; transactional outbox + ledger reconciliation.
  domain: commerce
  division: trade
  context: orders
  owner: "@baalvion/commerce"
  tier: tier-0
spec:
  lifecycle: design
  language: node
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: [trade-finance-lc-service, escrow-service, ledger-service, logistics-execution-service, trade-document-service]
  consumesEvents: [deal.agreed, finance.lc.settled, shipment.delivered, quality.gate.passed]
  producesEvents: [order.created, order.confirmed, order.milestone, order.delivered, order.disputed]
  apis:
    - /api/v1/commerce/orders
    - /api/v1/commerce/orders/{id}/amendments
    - /api/v1/commerce/orders/{id}/milestones
    - /api/v1/commerce/orders/{id}/incoterm-allocation
  slo: { availability: 0.999, latencyP95Ms: 300 }
  deploy: { chart: baalvion-service, namespace: baalvion-commerce, minReplicas: 3, maxReplicas: 12 }
```
**Bounded context:** order lifecycle + Incoterm cost split. **Replaces** `trade.orders`/`deals` ownership. The single source of truth for order↔money state; reconciles against ledger:3014. **Idempotency keys + outbox are mandatory here — this is the financial-integrity anchor.**

---

### trade-command-service  **[NEW — CQRS read model]**

```yaml
apiVersion: baalvion.io/v1
kind: Service
metadata:
  name: trade-command-service
  description: CQRS read-model + exception queue powering the COMMAND control tower (exposure, in-transit value, demurrage, sanctions queue, doc-discrepancy backlog).
  domain: platform
  division: trade
  context: command
  owner: "@baalvion/trade-platform"
  tier: tier-1
spec:
  lifecycle: design
  language: node
  ingress: internal
  datastores: [postgres, redis]
  dependsOn: []   # read-only projector; depends on the event bus, not on services synchronously
  consumesEvents: [order.created, finance.lc.presented, compliance.screening.hit, demurrage.accrued, document.discrepancy.detected, shipment.milestone]
  producesEvents: [command.alert.raised]
  apis:
    - /api/v1/platform/trade-command/kpis
    - /api/v1/platform/trade-command/exceptions
    - /api/v1/platform/trade-command/alerts/subscriptions
  slo: { availability: 0.99, latencyP95Ms: 200 }
  deploy: { chart: baalvion-service, namespace: baalvion-platform, minReplicas: 2, maxReplicas: 8 }
```
**Bounded context:** denormalized read model only — never writes domain state. Fixes the "Command is cosmetic" risk with a consistent, event-fed projection. Degrades to last-known on partial outage.

---

## 2.3 — Reuse / replace matrix

| New service | Reuses (does NOT replace) | Replaces / promotes |
|---|---|---|
| network-graph-service | trust-score:3046, aml:3045 | scattered `trade.organizations`/`carriers` identity |
| product-registry-service | search-service, classification-service | free-form product data in `trade.listings` |
| classification-service | ml-service | — (net-new) |
| trade-document-service | esign, audit | `trade.documents` blob store |
| esign-service | KMS/HSM, audit | — (net-new crypto authority) |
| edocs-exchange-service | trade-docs, esign | paper B/L title transfer (eBL) |
| quality-inspection-service | trade-docs, supplier-lifecycle | — (net-new) |
| warehouse-service | ledger:3014, fulfillment-service | — (net-new WMS) |
| supplier-lifecycle-service | aml, trust-score, quality, network-graph | `/suppliers` flat list |
| compliance-screening-service | **aml:3045 (engine)** | point-in-time/absent screening |
| banking-network-service | ledger, fx:3038, settlement:3018 | — (net-new network layer) |
| swift-connectivity-service | audit, compliance-screening | — (net-new rail) |
| trade-finance-lc-service | **trade-finance:3036 (engine)** | adds UCP600 examination/SWIFT/presentation |
| government-gateway-service | esign, audit | — (net-new) |
| single-window-adapter-service | products, classification, trade-docs | `trade.customs_entries` as SoR |
| trade-resolution-service | **dispute:3044 (engine)**, escrow:3017 | thin `trade.disputes` |
| sustainability-esg-service | reporting:3024 | — (CBAM/ESG layer) |
| carbon-ledger-service | audit | `trade.carbon_footprints` record store |
| ports-terminals-service | network-graph | — (net-new) |
| logistics-execution-service | ports-terminals, edocs-exchange | `trade.shipments`/`bills_of_lading`/`carriers`/`freight_quotes` |
| order-execution-service | trade-finance-lc, escrow, ledger | `trade.orders`/`deals` |
| trade-command-service | (event bus only) | client-side dashboard stitching |

## 2.4 — Disposition of the legacy `trade-service`

As bounded contexts are extracted, `trade-service` (:3025) is **demoted to a thin compatibility/edge layer**: it keeps the `/api/v1` BFF shape for the GTI frontend during migration and proxies to the new services, while the generic `trade.collections` JSONB store is retained **only** for genuinely schemaless tenant data — never as a system of record for any modeled entity above. Strangler-fig migration: route one bounded context at a time through the gateway to the new service, backfill, then retire the corresponding `trade.*` model.

## 2.5 — Language-choice rationale (summary)

- **Go** (network-graph, esign, warehouse, government-gateway, ports-terminals): latency-sensitive, high-fanout/high-throughput, concurrent external I/O, crypto.
- **Java** (edocs-exchange, compliance-screening, banking-network, swift, trade-finance-lc, single-window, trade-resolution, carbon-ledger): co-located with the existing JVM finance/risk suite; heavy message-standard (EDIFACT/ISO 20022/WCO) and ledger semantics reuse JVM libraries and the established financial-services-java patterns.
- **Python** (classification, sustainability-esg): ML inference + emission-factor/tariff dataset tooling + analytics.
- **Node** (product-registry, trade-document, quality-inspection, supplier-lifecycle, logistics-execution, order-execution, trade-command): CRUD/master-data/orchestration-heavy, consistent with the existing commerce/trade-service stack and the GTI BFF.

---

**End of deliverable.**
