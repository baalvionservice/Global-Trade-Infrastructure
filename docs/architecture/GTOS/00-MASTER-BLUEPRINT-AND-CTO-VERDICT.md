# GTOS — Global Trade Operating System
## Master Architecture Blueprint & CTO Production-Readiness Verdict

> **Prepared by:** Enterprise Architecture Council (10 specialist roles) + CTO synthesis
> **Method:** Specialist agents drafted their domains in parallel against the *real* codebase; the CTO cross-examined them, reconciled conflicts, and issued the verdict below.
> **Golden rule honored throughout:** *Extend the existing architecture, do not replace it.* Every recommendation plugs into the real `routes.ts` nav registry, the `baalvion.io/v1` service catalog, the RBAC `{resource}:{action}` PDP, the `@baalvion/events` bus, and the WORM audit chain.

---

## 0. Document set (the full deliverable)

| # | File | Phases covered | Author role |
|---|------|----------------|-------------|
| 00 | **THIS FILE** — Master blueprint, council debate, critical risks, CTO verdict | Final deliverable, Phase 1 synthesis | CTO |
| 01 | `01-gap-report-and-microservices.md` | Phase 1 (Gap Report), Phase 5 (Microservices) | Domain Architect + CTO |
| 02 | `02-navigation-and-permissions.md` | Phase 2 (Navigation Tree), Phase 3 (Permission Matrix) | Product + SaaS Architect |
| 03 | `03-data-ddd-db-events.md` | Phase 4 (DDD), Phase 6 (Database), Phase 7 (Kafka events) | Data Architect |
| 04 | `04-infrastructure.md` | Phase 10 (Infrastructure) | Infrastructure Architect |
| 05 | `05-security.md` | Phase 11 (Security) | Security Architect / CISO |
| 06 | `06-api-ai-gtm.md` | Phase 8 (API), Phase 9 (AI), Phase 12 (GTM) | API + AI + Product Architect |

---

## 1. EXECUTIVE SUMMARY

The Baalvion Global Trade platform today is a **broad but shallow** system: 89 modules across 14 sections render a credible global-trade surface, backed by a real identity/RBAC/event/audit spine that is genuinely production-grade in *design*. The gap between it and a true **Global Trade Operating System** (one that banks, customs authorities, carriers, insurers, and governments transact on) is **not breadth — it is depth, integrity, and wiring.**

Three findings define the program:

1. **The surface is ahead of the engine.** `trade-service` is a CRUD monolith over a Postgres `trade` schema (28 typed models + a generic `trade.collections` JSONB escape hatch). ~17 of those models are *anemic record stores* — no UCP 600 document examination, no Incoterms 2020 cost allocation, no HS classification, no sanctions screening at publish/award time, no electronic bill of lading (MLETR), no demurrage clock. Meanwhile the **Java finance suite already contains the money engines** (ledger, escrow, settlement, FX, trade-finance, AML, trust-score — ports 3014–3046) but **is not wired into the trade lifecycle.** The single largest body of work is *extracting bounded contexts from the monolith and wiring the engines together* via a strangler-fig migration — not greenfield building.

2. **The spine is excellent; enforcement is uneven.** The platform already has the hard parts most startups never build: an RS256-only verifier with algorithm-confusion blocked and fail-closed JTI revocation; a signed workload-identity envelope; an ABAC PDP with deny-overrides and obligations; Postgres RLS; and an immutable SHA-256 hash-chained audit log. The risk is **uniformity** — two issuer "islands" still allow HS256, and RLS/relationship-edge gating is not yet enforced on *every* path. A platform is only as multi-tenant-safe as its weakest query.

3. **The differentiator is the graph.** The requested **Network** section — every buyer, seller, bank, carrier, port, customs authority, inspector as a first-class node with relationship edges — is not a CRUD feature. It is a **trade graph** (Neo4j) that powers sanctions-exposure pathfinding, beneficial-ownership unwinding, correspondent-banking reachability, and n-tier supply-chain traceability. This is the capability competitors cannot copy by adding screens, and it should be treated as a top-tier service (`network-graph-service`), not a directory.

**Verdict in one line:** *Architecturally sound foundation, commercially compelling vision, NOT production-ready today.* Two security blockers and one financial-integrity blocker must close before any regulated go-live. With a disciplined 3-release program (below), this becomes a defensible, sovereign-capable Global Trade OS.

---

## 2. COMPLETE INFORMATION ARCHITECTURE  *(detail → file 02)*

- **14 → 25 sections.** Eleven new top-level categories slot into the existing `CATEGORY_ORDER`/`RouteCategory` union with **zero sidebar code changes** (the sidebar already iterates categories with a `FULL_ACCESS_ROLES` bypass): **Products, Trade Documentation, Quality & Inspection, Warehousing, Supplier Lifecycle, Banking Network, Government Gateway, Trade Resolution, Sustainability & ESG, Ports & Terminals, and Network.**
- **Network is the keystone.** 13 participant registries (Buyers … Trade Agents) on a uniform 6-tab contract: **Profiles · Relationships · Permissions · Compliance status · Activity history · Trade-graph.** Each is a drop-in `RouteMetadata{}` literal under `/network/*`.
- Full **L1→L2→L3 navigation tree** with route paths consistent with the existing `/marketplace`, `/governance/*` conventions, mapping every existing module verbatim plus all new domains.

## 3. COMPLETE DOMAIN ARCHITECTURE  *(detail → files 01, 03)*

- **20 bounded contexts** extracted from / wrapped around the monolith, with aggregate roots + invariants, entities, ~16 shared **value objects** (Money, HSCode, Incoterm, GTIN, Tenor, PortCall, UNLOCODE, LatLng, CountryCode…), and `<context>.<entity>.<action>` domain events.
- **Reuse-vs-replace is explicit:** compliance wraps `aml:3045`; trade-finance-LC extends `trade-finance:3036`; resolution extends `dispute:3044` (engines **reused**). Order/logistics/document/customs/carbon/supplier surfaces **replace** the anemic `trade.*` models. Legacy `trade-service` is dispositioned per-model.
- Cross-context references by **ID, not foreign key**; **transactional outbox + idempotency keys + sagas** for consistency (the `@baalvion/events` package already ships the outbox + idempotent-consumer primitives).

## 4. COMPLETE TECHNICAL ARCHITECTURE  *(detail → files 01, 06)*

- **22 new `baalvion.io/v1` service descriptors** (Phase 5), each with gateway path `/api/v1/<domain>/<service>/*`, produces/consumes events, dependsOn, datastores, SLO, and a justified language choice. Anchor services: **`network-graph-service`** (Go, tier-0, the trade-graph spine), **`order-execution-service`** (the order↔money financial-integrity anchor with outbox + ledger reconciliation), **`trade-command-service`** (CQRS read model fixing "cosmetic Command"), plus product-registry, classification (HS/HTS), trade-document, esign, edocs-exchange, quality-inspection, warehouse (WMS), supplier-lifecycle, banking-network, swift-connectivity, government-gateway, single-window-adapter, trade-resolution, sustainability-esg, carbon-ledger, ports-terminals.
- **API standards (Phase 8):** REST floor (`{success,data,error,meta}` envelope, RFC 9457 problem+json, cursor pagination, mandatory `Idempotency-Key` on money/title writes); **Apollo-Federation GraphQL** for the 360° party view (money-moving mutations stay REST); internal **gRPC/mTLS** for hot paths (classification/screening/scoring); **webhooks** as a signed projection of the event bus. URL-major versioning + RFC 8594 deprecation + Pact contract tests. Credential-per-caller auth (BFF cookies / envelope / OAuth2 client-creds / mTLS for banks & governments) all funneled through the one PDP. Spec-first OpenAPI/AsyncAPI/proto + a sandboxed partner/developer portal.
- **AI Command Layer (Phase 9):** extract today's in-frontend Genkit flows into a governed **`ai-gateway-service`** — multi-model router (config-driven registry, sovereign/on-prem pin for government tenants), versioned prompts + CI-gated evals + guardrails + cost metering; **pgvector-first RAG** over UCP600/Incoterms/HS notes/tariffs/sanctions/contracts with **mandatory citations + version-in-force freshness**; **Neo4j GraphRAG** for sanctions-path and n-tier reasoning; tool-using agents **bounded by the RBAC PDP as the tool-authorization layer**, **human-in-the-loop for all money/title/customs actions**, every AI decision written to the WORM chain. *LLMs never produce risk scores; adverse-action explanations required.*

## 5. COMPLETE SECURITY ARCHITECTURE  *(detail → file 05)*

- **Zero-trust** with five independently-verified hops (browser → gateway → mesh mTLS → PDP → RLS); the signed envelope **is** the in-mesh identity, upgraded to **SPIFFE/SPIRE JWT-SVIDs** so the issuer is provably non-forgeable (closes the shared-HMAC forge risk).
- **IAM:** OIDC/SAML federation + SCIM, MFA/WebAuthn with step-up via the real `require_mfa` ABAC obligation, PAM/JIT + break-glass for sovereign, the 16 trade user types each mapped to an IAM pattern.
- **Deepened RBAC+ABAC:** maker-checker/dual-control for money movement and customs filings, segregation of duties, jurisdiction-scoped customs access, relationship-edge-gated visibility (a bank sees only its counterparties), policy-as-code with decision-log audit.
- **Encryption:** mTLS/TLS1.3, KMS/HSM envelope encryption with per-tenant DEKs + crypto-shred for GDPR erasure, PAN tokenization (PCI scope reduction), BYOK/HYOK for bank & sovereign tenants, eIDAS/eBL PKI signing.
- **Secrets:** Vault + External-Secrets-Operator + dynamic short-lived DB creds, building on the CMS-vault + `sdk.config`.
- **Audit/SIEM/UEBA** over the WORM chain with immutable S3 Object-Lock export.
- **Control mappings** for **SOC 2, ISO 27001, GDPR, PCI-DSS** + sanctions/KYC-AML + FedRAMP/IRAP/C5 posture — each row: requirement → real primitive → gap → remediation.

## 6. COMPLETE INFRASTRUCTURE BLUEPRINT  *(detail → file 04)*

- **K8s target** from the current Compose/pm2/Traefik reality: six domain namespaces, a base `baalvion-service` Helm chart **rendered from the catalog `deploy{}` block**, HPA + **KEDA** (scale on Kafka lag, scale-to-zero) + VPA + PDBs.
- **Istio ambient mesh** (sidecar-tax avoidance on a Java-heavy 67-service fleet), **mTLS STRICT** as the zero-trust data plane; recommendation to move ingress from Traefik → **Istio/Envoy Gateway** as a single catalog-generated entrypoint (Traefik retained as a migration shim).
- **Multi-region 99.99%** via **cell-based architecture**, data-class-driven replication (class-A money ≈0 RPO active-passive; class-C/D active-active), error-budget burn-rate gates.
- **Terraform** (per-provider modules behind one interface) + **ArgoCD** app-of-apps + **Argo Rollouts**, cosign/SLSA signing, PITR + audit-chain re-verify on restore, automated cross-region DR drills + chaos game days.
- **Three blueprints, one codebase:** AWS / Azure / **sovereign** (air-gapped, residency-locked, one-cell-per-government-tenant) via a cloud-agnostic app layer + Crossplane/provider-neutral Terraform + admission-enforced residency.

## 7. COMPLETE DATA MODEL  *(detail → file 03)*

- **Polyglot persistence, store-per-context:** **PostgreSQL** = system of record / financial integrity (schema-per-service, RLS, partitioning, PITR); **OpenSearch** = marketplace/catalog/document search + sanctions name-matching; **Redis** = cache/session/rate-limit/stream; **ClickHouse** = trade & ESG analytics, telemetry, market signals; **Neo4j** = the trade graph (the killer use case — sanctions-exposure *paths*, beneficial-ownership unwind, correspondent-banking, n-tier traceability, justified with Cypher vs recursive-CTE pain); **S3/Object Storage** = documents/eBL/evidence vault, content-addressed and tied to the audit hash chain.
- **Kafka event architecture (Phase 7):** target topology as a **transport swap behind `@baalvion/events`** (Redis Streams → Kafka via dual-write/MirrorMaker, envelope-preserving, consumer-group parity — *configuration, not an app rewrite*). 12 concrete `gtos.<domain>.<entity>.<version>` topics with keys/retention/compaction, retry-tier + DLQ/poison/parking, offset-reset replay + event-sourced projection rebuild + audit re-derivation, at-least-once + idempotent default with EOS reserved for the ledger, Avro/Protobuf schema registry (BACKWARD_TRANSITIVE), and the full choreographed **order → financed → screened → shipped → customs → settled** saga with named compensation events.

---

## 8. COUNCIL DEBATE & CROSS-EXAMINATION  *(CTO reconciliation of specialist conflicts)*

A real council disagrees. Here is where the specialists were challenged and how the conflicts resolve:

1. **"Is Command a feature or a lie?"** — The Domain Architect calls Command *cosmetic* (client-stitched numbers). The Product Architect wants it as the primary landing surface. **Resolution:** Command stays as the surface but is **demoted to read-only until `trade-command-service` (CQRS, event-fed) exists.** Executives must never see a working-capital or exposure number assembled client-side from inconsistent sources. *Owner: Data + Domain.*

2. **"Kafka now, or Redis Streams forever?"** — Infra and Data both confirm `@baalvion/events` is transport-swappable. The CTO challenge: don't migrate prematurely. **Resolution:** Redis Streams stays for MVP/V1; **cut to Kafka at the V2 boundary** when partition-scale, replay, and schema-registry governance actually pay for their operational cost. The envelope and `sdk.events` API do not change, so this is a deferrable infra decision, not an architectural fork.

3. **"Traefik vs Istio Gateway."** — Infra recommends Envoy/Istio Gateway. **Resolution:** Accepted as *target*, but **Traefik remains through V1** (it works, it's catalog-driven). Ingress migration rides the same wave as the Kafka cut to avoid two big-bang infra changes at once.

4. **"Two customs roles?"** — The SaaS Architect split `CUSTOMS_AGENT` (trader-side broker authority, organization tenant) from a new `CUSTOMS_OFFICER` (state-side, country tenant). **Upheld.** They sit on opposite sides of every filing and live in different tenant scopes; collapsing them would break jurisdiction-scoped ABAC. Likewise `/governance/disputes` (admin oversight) and `/resolution/*` (participant workflow) are intentionally separate surfaces over one domain.

5. **"Does the AI get to act?"** — Security and AI architects converge: **no.** Agents are bounded by the PDP (they inherit ≤ the delegated user's authority), high-stakes actions (money, title, customs) are **human-in-the-loop**, and **LLMs never emit risk scores** (numeric scoring stays in `ml-service`/`trust-score-service`; the LLM explains, it does not decide). Every AI decision is audited on the WORM chain. *This is non-negotiable for bank/government tenants.*

6. **"Revenue before liquidity?"** — The GTM Architect sequences **subscription-first**, deferring aggressive transaction/marketplace take-rates until network liquidity exists, so fees don't suppress the network effect that makes the platform valuable. **Upheld.**

---

## 9. CRITICAL RISKS  *(consolidated, prioritized — these gate go-live)*

| # | Risk | Severity | Why it blocks launch | Remediation (owner) |
|---|------|----------|----------------------|---------------------|
| **R1** | **Cross-tenant data leakage** — RLS / relationship-edge gating not enforced on *every* path; superuser-bypass risk if a service connects as a privileged role | 🔴 **CRITICAL / GO-NO-GO** | One un-scoped query leaks another tenant's trade, prices, or filings. Fatal for bank/government trust. | Enforce `@baalvion/tenancy` RLS + `NOSUPERUSER baalvion_app` on **all** services; PDP edge-gating on Network reads; automated cross-tenant test in CI (Security) |
| **R2** | **HS256 issuer islands** — two issuers still permit HS256, defeating the RS256-only verifier elsewhere | 🔴 **CRITICAL / GO-NO-GO** | Algorithm-confusion / key-forgery path → full auth bypass. | Force RS256-only + `rejectHs256` platform-wide; retire HS256 secrets (Security) |
| **R3** | **Order ↔ money divergence** — no outbox/idempotency/reconciliation between orders and ledger/escrow | 🔴 **CRITICAL / GO-NO-GO** | An order can show "paid" while the ledger disagrees — the #1 financial-integrity failure. | `order-execution-service` with transactional outbox + idempotency keys + order↔ledger reconciliation job (Domain + Banking) |
| **R4** | **Shared-HMAC envelope forgery** — every service holds the same envelope secret; a compromised service can impersonate any identity | 🟠 HIGH | Lateral movement = full identity forge inside the mesh. | SPIFFE/SPIRE JWT-SVIDs (asymmetric, per-workload) (Security + Infra) |
| **R5** | **Anemic trade engine** — no UCP 600 exam, Incoterms allocation, HS classification, eBL/MLETR, demurrage clock | 🟠 HIGH | The platform looks like a trade OS but can't enforce the rules of trade → wrong/unenforceable transactions, D&D leakage. | Strangler-fig extraction + wire Java engines (Domain) |
| **R6** | **Non-repudiation gap** — agreed deal terms not cryptographically bound to a signed artifact | 🟠 HIGH | Unenforceable contracts, dispute exposure. | esign-service + smart-contract:3041 wiring + deal-mutation events (Domain + Legal) |
| **R7** | **Secret sprawl / localStorage tokens / blacklist-propagation gaps** | 🟡 MEDIUM | Audit findings; erodes the otherwise-strong posture. | Vault + ESO, in-memory tokens only, Redis-propagated revocation (Security) |
| **R8** | **Sanctions screening not at publish/award/counterparty time** | 🟠 HIGH | Strict-liability export-control / OFAC violation. | Screen at listing publish, supplier award, and counterparty-add via `aml:3045` + graph paths (Compliance) |

---

## 10. CTO FINAL VERDICT

**Production-readiness gate: ❌ NOT READY for regulated go-live. ✅ READY to proceed into a staged program.**

The architecture is **fundamentally sound and unusually well-founded** — the identity, authorization, audit, and event primitives are the kind most platforms bolt on too late, and they are real, in the codebase, and correctly designed. The vision is coherent and the expansion plan *extends* rather than rewrites. This is an approvable foundation.

It is **not** launchable today because a Global Trade OS carries bank-, customs-, and government-grade trust obligations, and three blockers (**R1 cross-tenant isolation, R2 HS256 islands, R3 order↔money integrity**) are exactly the failures those stakeholders test first. None is architectural; all are **enforcement and wiring** — closeable in weeks, not quarters.

**Conditions to clear the gate (definition of done for "production-ready V1"):**
1. R1, R2, R3 closed and proven with automated CI tests (cross-tenant isolation test, RS256-only assertion, order↔ledger reconciliation).
2. `order-execution-service` live with outbox + idempotency; Command demoted to event-fed read-only.
3. Sanctions screening enforced at publish/award/counterparty (R8).
4. One real end-to-end trade loop (RFQ → deal+esign → order → finance → shipment+eBL → customs → settlement) green in a staging cell with audit-chain verification.

**Staged roadmap (future scalability):**
- **MVP** — smallest clean cross-border loop for SMB exporters/importers in 2–3 high-friction corridors; subscription-first; Redis Streams + Traefik retained. Closes R1/R2/R3.
- **V1** — Products + Trade Documentation + Quality + Supplier Lifecycle + Network (graph) GA; partner API portal; full SOC 2 Type I posture.
- **V2** — Banking Network + Government Gateway + single-window adapters; **cut to Kafka + Istio Gateway**; multi-region active-active for non-money data; ISO 27001 + SOC 2 Type II.
- **V3** — Sovereign cells (air-gapped, residency-locked), AI Command Layer at scale with on-prem LLMs for government tenants, full trade-finance + insurance marketplace, FedRAMP/IRAP/C5 pursuit.

**Signed,** Office of the CTO — Enterprise Architecture Council.

*Detailed evidence and designs for every claim above live in files 01–06 in this folder.*
