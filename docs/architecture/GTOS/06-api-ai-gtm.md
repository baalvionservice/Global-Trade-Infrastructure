# GTOS — Global Trade Operating System

## API Standards · AI Command Layer · Go-To-Market

> **Authors:** API/Platform Architect · AI Architect · Product/GTM Strategist — Enterprise Architecture Council
> **Status:** Design baseline for Phases 8, 9, 12. **MUST extend the current platform, not replace it.**
> **Ground truth referenced:** Traefik gateway `/api/v1/<domain>/<service>/*` (stripPrefix + ratelimit + sec-headers); auth-gateway BFF (RS256 httpOnly cookies for browser, `x-identity-envelope` HMAC service-to-service); RBAC PDP `POST /v1/authorize` ({resource}:{action} + ABAC obligations); `@baalvion/events` (Redis Streams now → Kafka target, `PlatformEvent` envelope); `@baalvion/sdk` (config/internalAuth/http/events/logger/trace); Next.js frontend (BFF rewrites `/trade-bff` → gateway); Genkit flows in `src/ai/*` (server-only, keyless demo fallbacks) over `gemini-1.5-pro`; AI cognition kernel (`src/ai/orchestration/kernel.ts`), `TrustGuard` governance, `VectorMemory`; knowledge/ml-service; Java trade-intelligence-service:3043 (demand forecast / supplier risk / NL assistant / BTI); trust-score-service:3046; audit-service:3032 WORM hash-chain; Neo4j proposed for the trade graph.

---

## How to read this document

- **Phase 8** is the binding **API contract** for the platform: REST / GraphQL / gRPC / Webhooks, plus versioning, rate limits, auth, governance, and the external Partner/Developer program.
- **Phase 9** is the **AI Command Layer**: the model gateway, RAG, GraphRAG over Neo4j, and the agent framework — wired through the *existing* RBAC PDP and WORM audit chain rather than a parallel AI stack.
- **Phase 12** is **Go-To-Market**: MVP→V3 rollout, revenue mechanics, TAM/wedge, partnerships.

A recurring principle drives all three: **the platform already has the spines (gateway, BFF, PDP, events, SDK, WORM audit). Phases 8/9 add contracts and intelligence *on those spines* — every new surface is a contract or a tool, governed by the same authorization and audit boundary as everything else.**

---

# PHASE 8 — API STANDARDS

## 8.0 — The contract hierarchy (when to use what)

| Protocol | Direction | Use for | Do NOT use for |
|---|---|---|---|
| **REST + JSON** | North-south (clients, partners) | CRUD on resources, transactional writes, the default public surface | High-fan-out cross-domain reads (chatty waterfalls); high-throughput internal calls |
| **GraphQL (federated BFF)** | North-south, read-heavy | The 360° trade/party view; client-shaped composite reads across ≥3 domains | Writes that need idempotency + side-effect clarity (keep those REST); partner-facing bulk integration |
| **gRPC + protobuf** | East-west (service↔service) | Hot-path internal calls (classification, screening, scoring), streaming telemetry, the AI tool-bus | Browser clients; partner integrations (use REST/webhooks) |
| **Webhooks (AsyncAPI)** | Outbound to partners | Bank/customs/carrier event delivery, partner subscriptions | Anything needing a synchronous response |

**Rule:** REST is the floor. GraphQL is a *read optimization* over the same services. gRPC is *internal only*. Webhooks are *the only* way external parties receive events. Internally, `baalvion:events` (Redis Streams → Kafka) remains the source of truth; webhooks are a fan-out *projection* of it.

---

## 8.1 — REST (the default public surface)

### Resource modeling

- Path: `/api/v1/<domain>/<service>/<resource>` — matches the live Traefik stripPrefix layout. `domain` = bounded context (`trade`, `finance`, `compliance`, `logistics`, `identity`, `marketplace`); `service` = the owning microservice; `resource` = plural nouns (`/shipments`, `/letters-of-credit`, `/customs-entries`).
- Sub-resources express ownership: `/api/v1/trade/lc-service/letters-of-credit/{lcId}/discrepancies`.
- **Verbs are HTTP methods, not path segments.** Non-CRUD domain actions are modeled as sub-resource *commands* with POST: `POST .../letters-of-credit/{id}/examinations` (creates an examination), `POST .../bills-of-lading/{id}/title-transfers`. This keeps UCP 600 examination, eBL title transfer, and Incoterm cost allocation as first-class, auditable resources rather than RPC verbs.

### Response envelope (already in use — formalized)

```jsonc
// Success
{ "success": true, "data": { /* resource or { items, ... } */ }, "error": null, "meta": { "requestId": "...", "page": 1, "limit": 50, "total": 1284 } }
```

`meta` carries `requestId` (== trace id from `@baalvion/sdk.trace`), pagination, and rate-limit echo. `error` is `null` on success. This is the existing `{success,data,error,meta}` envelope — it is now **mandatory** on every REST response and lint-enforced at the gateway via a response schema check in CI.

### Errors — RFC 9457 `application/problem+json` inside the envelope

The envelope's `error` field carries a problem object so clients get *both* the platform envelope and the IETF-standard shape:

```jsonc
{
  "success": false, "data": null,
  "error": {
    "type": "https://docs.baalvion.io/errors/lc-discrepancy-unresolved",
    "title": "Letter of credit has unresolved discrepancies",
    "status": 409,
    "detail": "2 discrepancies must be waived or corrected before negotiation.",
    "instance": "/api/v1/trade/lc-service/letters-of-credit/9f3.../negotiations",
    "code": "LC_DISCREPANCY_UNRESOLVED",       // stable machine code
    "discrepancies": ["DESC_MISMATCH", "LATE_SHIPMENT"]  // extension members
  },
  "meta": { "requestId": "tr-01J..." }
}
```

`code` is the stable, documented, never-reworded contract key (clients branch on it). `type`/`title`/`detail` are human-facing. Validation failures use `422` with a `errors[]` array of field-level problems. **Error messages never leak internals** (stack traces, SQL, upstream URLs) — sanitized at the gateway error filter.

### Pagination, filtering, sorting

- **Pagination:** cursor-based by default for large/ordered collections (`?cursor=...&limit=50`, opaque base64 cursor encoding the sort key + tiebreaker id) — stable under concurrent writes, no deep-offset cost. Offset pagination (`?page=&limit=`) allowed only for small bounded admin lists. `meta.nextCursor` / `meta.total` returned.
- **Filtering:** `?filter[status]=in_transit&filter[hsCode][prefix]=8703&filter[value][gte]=100000`. Operators are explicit (`eq` default, `gte/lte/in/prefix/contains`). Server whitelists filterable fields per resource (no arbitrary column exposure).
- **Sorting:** `?sort=-createdAt,value` (leading `-` = desc). Whitelisted sort fields only; default sort is documented per resource.
- **Sparse fieldsets:** `?fields=id,status,value` to trim payloads (interop-friendly with the GraphQL layer).

### Idempotency (mandatory for writes)

All non-idempotent writes (POST/PATCH that create or move money/title) **require** an `Idempotency-Key` header (client-generated UUID). The owning service persists `(tenantId, idempotencyKey) → response snapshot` for 24h:

- First call executes and stores the result.
- Replays within the window return the **stored** response with `Idempotency-Replayed: true` — no double LC issuance, no double escrow lock, no duplicate webhook emission.
- Key collision with a *different* request body → `422` `IDEMPOTENCY_KEY_REUSE`.

This makes payment-rails, escrow, LC, and order writes safe under client retries and Traefik retries. Implemented once in `@baalvion/sdk` as middleware; every write-bearing service mounts it.

### HATEOAS stance — **pragmatic, not dogmatic**

We do **not** ship full HAL/hypermedia. Instead, resources that are state machines (LC, shipment, dispute, escrow) include a `_actions` array enumerating the *currently permitted* transitions, computed against the caller's RBAC obligations:

```jsonc
"_actions": [
  { "rel": "examine", "method": "POST", "href": ".../examinations" },
  { "rel": "waive-discrepancy", "method": "POST", "href": ".../discrepancies/{id}/waivers", "requires": "lc:waive" }
]
```

This lets the UI render only legal next steps without re-implementing the state machine client-side, and ties the affordance to the PDP. It is opt-in per resource, not a platform-wide hypermedia mandate (YAGNI for leaf CRUD).

---

## 8.2 — GraphQL (federated read gateway for the 360° view)

### Why GraphQL exists here

The single highest-value query in trade — *"give me everything about this counterparty / this deal"* — touches trade-service, finance suite, compliance, logistics, trust-score, and the AI layer. Over REST that is a 6-call client waterfall with N+1 hazards. GraphQL collapses it into one client-shaped request.

### Architecture — **Apollo Federation (subgraph per domain), not a monolith schema**

- Each domain service that owns read-rich entities exposes a **subgraph**: `trade`, `party` (counterparty/supplier), `finance` (LC/escrow/payment), `compliance` (sanctions/AML), `logistics` (shipment/route), `intelligence` (AI/risk).
- A **federation gateway** (Apollo Router or GraphQL Mesh, deployed alongside the BFF) composes the supergraph. Entities are joined by federation keys: `Party @key(fields: "id")` is *extended* by the finance subgraph (adds `creditExposure`), the compliance subgraph (adds `sanctionsStatus`, `sanctionsExposurePaths`), and the intelligence subgraph (adds `trustScore`, `riskBand`).
- The router calls subgraphs over **gRPC or REST internally**, batched with DataLoader per request to kill N+1.

```graphql
query Party360($id: ID!) {
  party(id: $id) {
    legalName  hsFootprint
    sanctionsStatus  sanctionsExposurePaths { hops  intermediary }   # compliance subgraph + GraphRAG
    creditExposure { outstandingLC  escrowLocked }                   # finance subgraph
    trustScore  riskBand                                             # intelligence subgraph (3046)
    recentShipments(last: 5) { blNumber  status  corridorRisk }      # trade + logistics
  }
}
```

### When GraphQL vs REST (the decision)

- **GraphQL:** composite reads, dashboards (Command control-tower KPI rollups), the 360° views, anything where the client needs to shape the response across domains.
- **REST:** all writes, partner integrations, file up/download (documents/B-L PDFs), webhooks, and any single-resource fetch where the envelope + idempotency + caching matter.
- **Hard line:** **mutations that move money/title stay REST.** GraphQL mutations are permitted only for low-stakes UI state (saved views, annotations). This keeps idempotency, problem+json, and the PDP write-path uniform.

### GraphQL governance

- **Auth:** same BFF cookie → the router validates the session and forwards the `x-identity-envelope` to subgraphs. **Per-field authorization** is enforced *in the subgraph resolvers* via the RBAC PDP, never trusted to the client query. A field the caller can't see resolves to `null` + a typed `_denied` extension, not data leakage.
- **Cost control:** query depth limit, complexity scoring, persisted queries (allowlist in prod — arbitrary queries rejected), and per-tenant complexity budget. No introspection in prod.
- **Caching:** `@cacheControl` hints → CDN/edge for public reference data (HS taxonomy, tariff schedules); private for tenant data.

---

## 8.3 — gRPC (internal high-throughput east-west)

### Where gRPC wins

The hot internal paths are latency- and volume-sensitive and structurally typed: **HS classification, sanctions/restricted-party screening, trust scoring, document IDP, route-risk scoring, the AI tool-bus.** These are called synchronously inside request handlers thousands of times. JSON-over-HTTP overhead and schema drift are real costs there.

- **Proto contracts** live in a central `proto/` registry (versioned, the *source of truth* for internal contracts, code-genned into Node + Java + Python clients). Each service ships a `*.proto` per bounded context.
- **Unary** for request/response (classify, screen, score).
- **Server streaming** for telemetry/firehoses: market signals, sea-route AIS updates, live shipment events, AI token streaming back to the BFF.
- **Bidirectional streaming** for the negotiation assistant's live session and any interactive agent loop.

```protobuf
service ClassificationService {
  rpc Classify(ClassifyRequest) returns (ClassifyResponse);          // unary, HS/HTS prediction
  rpc StreamTariffUpdates(TariffSubscription) returns (stream TariffEvent);  // server stream
}
message ClassifyResponse {
  string hs_code = 1;  double confidence = 2;  repeated string candidates = 3;
  string rationale = 4;  bool requires_human_review = 5;   // low-confidence → HITL
}
```

### gRPC governance

- **Auth:** mTLS between services + the `x-identity-envelope` HMAC carried as gRPC metadata; the PDP is still consulted for authorization on sensitive RPCs (it is *not* assumed that east-west = trusted).
- **Not public.** gRPC never crosses the Traefik edge. Partners who want streaming get **webhooks** or a server-sent-events REST endpoint, not gRPC.
- **Resilience:** deadlines on every RPC, retry with hedging only on idempotent unary calls, circuit breakers in `@baalvion/sdk.http` equivalent for gRPC.

---

## 8.4 — Webhooks (outbound to partners/banks/customs)

### Design — projection of `baalvion:events`, not a second event system

Webhooks are a **delivery projection** of the platform event bus. When a `PlatformEvent` lands on `baalvion:events` (Redis Streams → Kafka), a **webhook-dispatch-service** consumes it, matches it against partner subscriptions, and delivers. One event catalog, one source of truth.

| Concern | Standard |
|---|---|
| **Event catalog** | AsyncAPI doc maps each Kafka topic / `PlatformEvent.type` → a public webhook event (`shipment.departed`, `lc.discrepancy.raised`, `customs.cleared`, `sanctions.hit`, `payment.settled`). Internal events are *not* auto-exposed — partner-visible events are explicitly published. |
| **Subscriptions** | Partner registers `{ url, events[], secret }` via the developer portal/API. Per-tenant, per-event-type. |
| **Signing** | Every payload signed **HMAC-SHA256** with the per-subscription secret → `X-Baalvion-Signature: t=<ts>,v1=<hmac>` (Stripe-style, timestamped to block replay). Partners verify before trusting. Optional asymmetric (Ed25519) signing for bank/government partners who require non-repudiation. |
| **Delivery + retry** | At-least-once. Exponential backoff (e.g. 1m, 5m, 30m, 2h, 6h… capped 24h). Per-delivery attempt log. |
| **DLQ** | After max attempts → dead-letter queue + partner alert in portal. Manual or API **replay** from DLQ. |
| **Replay** | Partners can request replay of any event in a time window (`POST /webhooks/replay?from=&to=&event=`) — critical for bank/customs reconciliation after an outage. Backed by the durable Kafka log retention. |
| **Idempotency** | Each delivery carries `X-Baalvion-Event-Id` (== event id); partners dedupe on it. |
| **Ordering** | Best-effort per-resource ordering via partition key = resourceId; partners must tolerate reordering and use event timestamps. |

---

## 8.5 — Versioning & contract testing

- **Major version in URL:** `/api/v1/...` → `/api/v2/...` only for breaking changes. v1 and v2 run side-by-side during migration.
- **Minor/additive via headers:** additive fields ship without a version bump (clients tolerate unknown fields — enforced as a client contract). Optional `Accept: application/vnd.baalvion.v1+json` content negotiation for clients that pin a representation.
- **Deprecation policy:** deprecated endpoints return `Deprecation: <date>` + `Sunset: <date>` headers (RFC 8594) and a `warning` entry in `meta`. **Minimum 6-month sunset** for any consumed public endpoint; 12 months for bank/government partner endpoints. Deprecations announced in the portal changelog and via a `platform.api.deprecated` webhook.
- **Contract testing (CI-gated):** OpenAPI/AsyncAPI/proto are the source of truth → **consumer-driven contract tests (Pact)** between the BFF and services, and between partner SDKs and the public API. A schema-diff gate **fails CI on any breaking change** to a published contract. GraphQL supergraph composition is checked with `rover subgraph check` against live traffic.

---

## 8.6 — Rate limits & quotas (defense in depth)

Two layers, because they catch different abuse:

1. **Traefik edge ratelimit** (already configured): coarse per-IP / per-route burst protection — stops volumetric abuse before it hits app code.
2. **Per-tenant / per-plan in-app quotas** (in `@baalvion/sdk` middleware, backed by Redis token buckets): the *business* limit.

| Tier | REST req/min | GraphQL complexity/min | Webhook deliveries/day | Concurrent gRPC streams |
|---|---|---|---|---|
| Sandbox | 60 | 1k | 1k | 2 |
| Starter | 600 | 10k | 50k | 10 |
| Growth | 6k | 100k | 1M | 50 |
| Enterprise / Bank | negotiated + dedicated capacity | negotiated | negotiated | dedicated |

- **429 responses** carry `Retry-After` (seconds) and `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` (IETF `RateLimit` headers) in `meta`.
- **Quotas** (monthly classification calls, document-IDP pages, AI tokens) tracked per tenant; soft-limit warnings at 80%, hard cap → `429 QUOTA_EXCEEDED` with an upgrade link.
- **Cost-bearing AI endpoints** (LLM, OCR) are metered separately and feed billing (§12 revenue).

---

## 8.7 — Authentication (the right credential for the right caller)

| Caller | Mechanism | Notes |
|---|---|---|
| **Browser / first-party app** | BFF: RS256 JWT in **httpOnly, Secure, SameSite** cookies, issued by auth-gateway; CSRF token for state-changing requests | Already live. Tokens never touch JS. |
| **Service ↔ service** | `x-identity-envelope` HMAC + mTLS | Already live. Carries tenant + subject for the PDP. |
| **Partner / developer (machine)** | **OAuth2 client-credentials** → short-lived access token (scopes = the resource:action set); or **API keys** for simple read integrations (hashed at rest, scoped, rotatable) | Issued via the developer portal. |
| **Banks / governments (high-assurance)** | **mTLS + OAuth2 client-credentials**, optionally **mutually-signed JWT (private_key_jwt)**; IP allowlist; per-connection certificates | Non-repudiation, sovereign requirements. |
| **AI agents (internal)** | Act **on-behalf-of** a user: the agent receives a *delegated, scope-narrowed* token and **every tool call is re-authorized at the PDP** (§9.4) | No agent ever holds super-admin. |

All tokens carry tenant + scopes; **every request is authorized at the RBAC PDP** (`{resource}:{action}` + ABAC obligations), regardless of which authentication mechanism minted the credential. Authentication proves *who*; the PDP decides *what* — uniformly.

---

## 8.8 — API governance & the Partner/Developer program

### Source of truth & tooling

- **OpenAPI 3.1** for every REST surface, **AsyncAPI 2.x** for every webhook/event surface, **protobuf** for gRPC — all stored in-repo, **spec-first** (the spec is written/reviewed before the handler), linted (Spectral ruleset enforcing the envelope, error shape, naming, pagination), and CI-gated.
- **SDK generation:** typed SDKs (TypeScript, Python, Java) generated from OpenAPI + proto → published to npm/PyPI/Maven. Partners never hand-roll HTTP.
- **Developer portal** (`developers.baalvion.io`): interactive docs (try-it console hitting the **sandbox**), the event catalog, changelog, status page, key/OAuth-app management, webhook subscription manager + delivery logs, usage dashboards vs quota.

### External Partner/Developer API program

- **Sandbox environment:** isolated tenant with seeded, synthetic trade data (sample LCs, shipments, sanctions test entities incl. known-bad fixtures for screening tests). Free, rate-limited (Sandbox tier). Mirrors prod contracts exactly.
- **Onboarding:** self-serve signup → create an app → get sandbox keys/OAuth client → promote to prod after review (KYC for partners touching money/compliance).
- **Scoped access:** partners get only the scopes their use case needs (a logistics partner can't read finance exposure). Enforced at the PDP.
- **Certification:** banks/customs/inspection partners go through an integration certification (contract tests + security review + signed data-processing agreement) before prod.

---

# PHASE 9 — AI COMMAND LAYER

> **Stance:** today's AI is Genkit flows in the Next app (`src/ai/flows/*`) over `gemini-1.5-pro`, a cognition kernel, a `TrustGuard`, a `VectorMemory`, plus the Java trade-intelligence-service:3043 and trust-score:3046. That is a strong demo spine but it is **in the frontend process, single-model, and not governed by the platform PDP/WORM**. Phase 9 **productionizes** it into a governed AI services tier that every surface (web, partner API, agents) calls through one boundary.

## 9.0 — Target capabilities (and where each lives)

| Capability | Today | Phase 9 home |
|---|---|---|
| Trade intelligence (demand, corridor risk, foresight) | Genkit flows + Java :3043 | trade-intelligence-service:3043 (engines) fronted by the AI gateway for the NL/LLM layer |
| Risk scoring (counterparty, default, vendor) | `ai-vendor-counterparty-scoring`, `predictive-analytics-for-defaults`, trust-score:3046 | ml-service (models) + trust-score:3046 (composite); LLM only for *explanation*, never the score |
| Negotiation assistant | `ai-negotiation-assistant-flow` | Agent (§9.4) on the AI gateway, gRPC bidi stream to UI |
| Compliance assistant / copilot | `contract-risk-analysis-flow` | RAG + agent, citation-mandatory |
| Document extraction (IDP) | — (gap) | **NEW** doc-ai-service (OCR/IDP for invoices/B-L/CoO/LC) |
| Customs classification (HS/HTS) | — (gap, generic flows) | **NEW** classification-service (model + RAG over HS notes) |
| Market forecasting | `corridor-delay-prediction`, `cosmos-strategic-foresight` | ml-service + intelligence:3043 |

## 9.1 — LLM orchestration (the model gateway)

### A single **AI gateway service** (not flows-in-the-frontend)

Extract the Genkit logic out of the Next process into a dedicated `ai-gateway-service` that all callers reach via `/api/v1/intelligence/ai-gateway/*` (and gRPC internally). The current `src/ai/orchestration/kernel.ts` becomes the orchestration core of *that* service; the Next app calls it through the BFF like any other backend. **AI never runs in the request-rendering process in prod.**

- **Model router / multi-model:** the gateway abstracts providers behind one interface and routes per task + policy:
  - **Claude (Anthropic)** for high-stakes reasoning: contract/compliance analysis, negotiation strategy, agent planning, anything where rationale quality and instruction-following matter most.
  - **Smaller/cheaper models** (Haiku-class, or the existing Gemini Flash) for classification candidates, extraction post-processing, summarization, routing.
  - **Specialist/own models** (ml-service) for numeric scoring/forecasting — **LLMs do not produce risk scores**, only explain them.
  - Routing policy = `{taskType, tenantTier, dataResidency, costBudget, latencyTarget}`. A government tenant's policy pins an **on-prem/sovereign model**; an Enterprise contract-analysis call pins Claude; a bulk classification call pins the cheap model. Fallback chains on provider outage.
  > Model IDs, pricing, and parameters are not hand-coded from memory — they are resolved from a maintained model registry (config-driven via `@baalvion/sdk.config`), so a model upgrade is a config change, not a code change.
- **Prompt management:** prompts are **versioned artifacts** (not string literals in flows) — stored, reviewed, A/B-tested, and pinned per release. Each prompt has an eval suite attached. Genkit's flow/prompt abstraction is kept as the authoring layer; the registry adds versioning + governance.
- **Guardrails:** input (PII/secret redaction, prompt-injection detection, jailbreak filters) and output (schema validation — every flow already returns a typed schema; toxicity/leakage checks; **citation-presence enforcement for regulated outputs**). This generalizes the existing `TrustGuard` (threshold gating, jurisdictional gating) into a pre/post middleware around every model call.
- **Evals:** golden-set evals per capability (classification accuracy vs a labeled HS set; extraction field-F1; compliance-answer faithfulness; negotiation-suggestion quality scored by rubric). Run in CI on prompt/model changes — **a model or prompt change cannot ship if evals regress.** Online evals sample prod traffic.
- **Cost controls:** per-tenant token budgets (tie to §8.6 quotas), prompt caching for stable system prompts / RAG context, model down-routing under budget pressure, response caching for idempotent queries (same doc → same extraction). Every call emits a cost event → billing + the tenant usage dashboard.
- **Sovereign / on-prem option:** for government tenants whose data **cannot leave the country**, the gateway supports a deployment-pinned local model (self-hosted open-weight model in the tenant's region/VPC). The router enforces `dataResidency` so a sovereign tenant's prompts + RAG context **never** reach a third-party API. This is a routing policy + deployment topology, not a code fork.

## 9.2 — RAG (grounding regulated answers)

### Corpus (the trade knowledge base)

UCP 600 / URDG 758, Incoterms 2020, HS/HTS section & chapter notes + explanatory notes, national tariff schedules, sanctions/restricted-party lists (OFAC/EU/UN/UK + local), FTAs/rules-of-origin, customs procedure codes, and **per-tenant private contracts/SOPs** (tenant-isolated). The existing market-signals and sea-route intelligence feed the forecasting context.

### Store, chunking, freshness

- **Vector store choice:** **start with pgvector** — the platform is already Postgres-heavy, it keeps tenant isolation trivial (RLS-scoped vectors, no cross-tenant bleed), supports hybrid SQL+vector filtering (filter by jurisdiction/version *then* similarity), and avoids a new datastore. **Promote hot, high-recall corpora to OpenSearch kNN** (the platform already runs OpenSearch via search-service) when we need lexical+vector hybrid scoring at scale and BM25 reranking. A dedicated vector DB is **YAGNI** until corpus + QPS prove pgvector/OpenSearch insufficient. The existing `VectorMemory` is the seam this slots behind.
- **Chunking:** structure-aware, not fixed-window — chunk by article/clause for legal texts (a UCP article is one retrievable unit), by HS heading/subheading for the tariff tree, by contract clause for tenant docs. Preserve hierarchy metadata (instrument, version, jurisdiction, effective date) for filtering and citation.
- **Citation (mandatory for regulated output):** every compliance/classification answer **must** return citations (instrument + article + version). No citation → the guardrail blocks the answer or flags low-confidence + HITL. This is the single most important hallucination control for regulated outputs.
- **Freshness:** sanctions lists and tariff schedules change constantly → an ingestion pipeline re-indexes on source update (event-driven), stamps each chunk with `effectiveDate`/`supersededBy`, and retrieval **filters to the version in force on the transaction date** (a customs classification for a 2025 shipment must use 2025 tariffs). Stale-source alerts if a list isn't refreshed within SLA.

## 9.3 — Knowledge graph + GraphRAG (why graph beats vector-only for trade)

Trade reasoning is **relational and multi-hop**, which pure vector RAG cannot do well:

- **"Is this counterparty sanctioned-exposed?"** is not a similarity question — it's a **path question**: is there a chain *party → 60%-owned subsidiary → director → sanctioned entity* (OFAC 50% rule / control). Vector search finds *similar text*; it cannot traverse ownership/control paths.
- **n-tier supply chain risk:** "does any tier-3 supplier of this order sit in a flagged region?" — a graph traversal, not a retrieval.
- **HS taxonomy** is literally a tree; classification benefits from graph neighborhood (sibling headings, exclusion notes).

**Design:** the proposed **Neo4j trade graph** models parties, ownership/control edges, sanctions entities, shipments, HS taxonomy, corridors, and documents. **GraphRAG** = retrieval that *combines* (a) vector search over the text corpus for the relevant regulation/context **with** (b) a graph traversal for the entity relationships, then feeds both into the LLM. So a compliance answer cites *both* the OFAC 50% rule (vector) **and** the specific ownership path it found (graph) — explainable, auditable, and correct in ways vector-only cannot be.

- The graph is fed by `baalvion:events` (party created, ownership declared, sanctions list updated, shipment booked) → kept current as a CQRS read model.
- trust-score:3046 and the sanctions engine read the graph; the AI gateway's GraphRAG retriever queries it as a tool.

## 9.4 — Agent framework (tool-using, PDP-bounded, WORM-audited)

The negotiation assistant, compliance copilot, and customs classifier become **tool-using agents** on the AI gateway. The non-negotiable design constraints:

1. **The RBAC PDP is the tool-authorization boundary.** An agent's tools (call classification, read counterparty exposure, draft a term sheet, *propose* an escrow lock) are each a capability. **Before any tool executes, the gateway calls `POST /v1/authorize`** with the *delegated user's* identity and the tool's `{resource}:{action}` — and honors ABAC obligations (e.g. amount caps, jurisdiction limits). The agent inherits **no more authority than the user it acts for**, and high-privilege tools are simply not in its toolset. This reuses the existing PDP — the AI does not get a parallel permission system.
2. **Human-in-the-loop for high-stakes actions.** Agents **propose**, humans **dispose** for anything with legal/financial consequence: LC issuance, escrow movement, contract execution, a sanctions *clear* decision, a customs filing. The existing `TrustGuard` thresholds (e.g. autonomous treasury cap, sanctioned-corridor block) become hard HITL gates. The agent produces a fully-formed proposal + rationale + citations; a human with the right RBAC scope confirms. Read/advisory actions (summarize, classify-with-confidence, draft) can be autonomous within budget.
3. **Every AI decision is audited to the WORM chain.** Each agent run emits an immutable record to **audit-service:3032** (SHA-256 hash-chained, tamper-evident): inputs, retrieved context + citations, model + prompt version, tools invoked + PDP decisions, the proposal, and the human approver (if any). This is what makes AI defensible to a regulator/bank: *every* regulated AI output is reproducible and provably un-tampered. The AI decision log is a first-class audit subject, not console logs.

### Model risk governance

- **Model cards + a model registry:** every model/prompt in prod is registered with its intended use, eval scores, known limitations, and approval status. Material changes go through review (a lightweight model-risk board for regulated-output models, mirroring SR 11-7 / EU-AI-Act high-risk expectations for trade-finance use).
- **Hallucination control for regulated outputs:** citation-mandatory + schema-validated + confidence-thresholded; below-threshold → HITL, never an autonomous regulated assertion. Compliance/classification answers that can't ground in the corpus return "insufficient basis," not a guess.
- **Bias/fairness for risk scoring:** risk/trust scores are produced by ml-service models (not LLMs), tested for disparate impact across protected/structural cohorts (e.g. small-vs-large supplier, region), with documented feature lineage and an **adverse-action explanation** for any negative decision (a counterparty denied finance gets a reason). Scores are **advisory inputs to a human decision**, never the sole automated basis for denying a party access to finance.

---

# PHASE 12 — GO-TO-MARKET / LAUNCH READINESS

## 12.0 — The wedge (where to win first)

**Do not boil the ocean.** GTOS's defensible wedge is the **smallest valuable trade loop**: a verified buyer and seller complete one cross-border transaction end-to-end *with compliance and document correctness baked in* — the part incumbents (marketplaces, freight forwarders, bank trade desks) each do only a slice of. Win SMB/mid-market exporters/importers in **2–3 high-friction corridors** (e.g. India↔GCC, India↔SEA) where document discrepancy and compliance pain is acute and digitization is low, then expand up-market and across corridors.

## 12.1 — Phased rollout

### MVP — "One clean trade loop"

- **Scope:** Marketplace listing (HS-classified, pre-publish sanctioned/dual-use screen) → RFQ/quote → deal/negotiation (with the negotiation assistant as advisory) → contract → **document set generation + AI extraction/validation (invoice/B-L/CoO)** → **sanctions/restricted-party screening on both parties** → basic shipment tracking. Plus the **Command** control-tower read for the principal.
- **Personas first:** SMB **exporter** + **importer** (the two sides of one loop) and the **compliance officer**. *Not* banks, *not* governments yet.
- **AI at MVP:** document extraction (IDP), HS classification, sanctions screening, negotiation *suggestions* (HITL). Risk scoring as advisory. No autonomous money/title actions.
- **Success metrics:** time-to-first-completed-trade; document-discrepancy rate reduction vs manual; % listings auto-classified correctly; sanctions screening coverage = 100% of parties; activation = a tenant completing ≥1 full loop; 10–20 design-partner tenants completing real trades.
- **Production-ready bar:** the REST contract + envelope + idempotency on the trade-write path; PDP on every action; WORM audit on compliance + AI decisions; sanctions list freshness SLA; the document IDP accuracy threshold with HITL fallback. (This is exactly the §8/§9 spine — MVP forces it to be real.)

### V1 — "Trusted network + finance seam"

- **Scope:** counterparty/supplier lifecycle + trust-score:3046, the 360° GraphQL party view, Neo4j graph + GraphRAG sanctions-path screening, dispute workflow, **trade-finance seam wired** (LC/escrow via the Java finance suite — issuance still HITL), webhooks for partners, the Partner sandbox.
- **Target customer:** growing mid-market traders + their first **logistics/inspection partners** integrating via the API.
- **Success metrics:** GMV through the platform; repeat-trade rate; partner integrations live; finance-attached trade % (loops that use LC/escrow).
- **Production-ready bar:** GraphQL federation in prod with per-field PDP; webhook signing/retry/DLQ/replay; OAuth2 partner program + certification; Kafka migration of the event bus underway.

### V2 — "Banking network + AI at depth"

- **Scope:** multi-bank trade-finance network (LC, guarantees, invoice finance, BNPL) with banks integrated via mTLS/OAuth + signed webhooks; payment-rails routing (SWIFT/SEPA/UPI/etc.); insurance marketplace; the compliance copilot + customs classification at scale; agentic workflows (still HITL on money/title).
- **Target customer:** **banks** and larger corporates; the platform becomes the trade-finance origination + document layer between corporates and their banks.
- **Success metrics:** financed trade volume; # of banks in the network; classification/extraction at scale SLO; AI-assisted deal cycle-time reduction.
- **Production-ready bar:** bank-grade auth (mTLS, non-repudiation signing), model-risk governance board operational, sovereign-model option available, full evals/observability on every AI capability.

### V3 — "Sovereign + AI at scale"

- **Scope:** **government / single-window / customs integrations** (AEO, customs filing, national single-window), **sovereign/on-prem AI** deployments (data stays in-country), the full agent fleet, cross-border interop with multiple national systems.
- **Target customer:** **governments**, customs authorities, central banks, and large carriers as network anchors.
- **Success metrics:** # of sovereign/customs deployments; share of corridor trade flowing through GTOS; network density (parties × banks × carriers × customs on one rail).
- **Production-ready bar:** data-residency-pinned AI routing proven; certified integrations with government single-windows; the WORM audit chain accepted by regulators; multi-region sovereign deployment topology.

## 12.2 — Revenue models (concrete mechanics)

| Model | Mechanic | Rough pricing logic |
|---|---|---|
| **Subscription (SaaS)** | Per-tenant plan × seats; gates features + the §8.6 quota tiers | Starter ~$X/mo (small quota, no finance), Growth ~$X·10 (full trade loop + API), Enterprise = negotiated (dedicated capacity, SSO, on-prem AI). Seat add-ons for compliance/ops users. |
| **Transaction fees** | bps on GMV of trades transacted on-platform | e.g. 10–40 bps of trade value, tiered down by volume; the core network monetization once liquidity exists. |
| **Marketplace fees** | Listing/lead/match fees + take-rate on marketplace-originated deals | Take-rate on closed marketplace deals; premium placement subscriptions for sellers. |
| **Trade-finance fees** | Origination/arrangement fee on LC/guarantee/invoice-finance routed through the network; revenue-share with banks | A few bps–% of financed amount, split with the funding bank; platform is the origination + document rail. |
| **Insurance commissions** | Commission on cargo/credit/trade insurance bound through the marketplace | Standard broker commission % of premium. |
| **Government licensing** | Per-deployment license + annual support for sovereign/single-window installs; per-transaction or per-seat for customs modules | Large fixed license + SLA-backed support; multi-year sovereign contracts. |
| **AI/usage metering** | Metered AI (classification calls, IDP pages, agent runs, tokens) above plan quota | Per-call/per-page/per-1k-tokens, margin on inference cost; feeds the §8.6 metered quotas. |

**Monetization sequence:** subscription + AI metering first (predictable, pre-liquidity), then transaction/marketplace fees as GMV grows, then trade-finance + insurance (highest value, needs the network), then government licensing (largest contracts, longest cycle). **Do not lead with transaction fees** before there's liquidity — it suppresses the network you're trying to build.

## 12.3 — TAM framing & partnership strategy

- **TAM framing (top-down + bottom-up):** global merchandise trade is tens-of-trillions USD annually; the *addressable* slice is the spend on the trade-services stack around it — trade finance, documentation/compliance, logistics coordination, insurance, and the SaaS to run it (a multi-hundred-billion services market). GTOS's **SAM** = digitizable cross-border trade in target corridors for SMB/mid-market + the banks serving them; **SOM** (3–5 yr) = a credible single-digit % of GMV in 2–3 corridors plus subscription/finance attach. Frame to investors as *take-rate on trade flow you orchestrate*, not "share of all trade."
- **Wedge → expansion:** win one corridor's document+compliance pain → attach finance → pull in the buyer/seller's counterparties (network effect: each party's counterparties become prospects) → expand corridors → move up-market → sovereign.
- **Partnership strategy (the network anchors):**
  - **Banks:** trade-finance funding + distribution. GTOS originates + handles documents; banks fund. Integrate via mTLS/OAuth + signed webhooks (§8.4/8.7). They bring corporate clients; they get digitized, screened, lower-risk origination.
  - **Carriers / freight forwarders:** shipment + eB/L data and the logistics leg; gRPC/webhook telemetry feeds the corridor intelligence and live tracking.
  - **Customs / national single-window:** the V3 sovereign integrations — filings, AEO status, clearance events. High-trust, slow, but a deep moat once embedded.
  - **Inspection / certification bodies:** quality + CoO verification feeding the document-validation and supplier-qualification flows.
  - **Insurers:** the insurance marketplace + cargo/credit cover bound at the point of trade.

---

## Appendix — Cross-phase dependencies (the through-line)

- **§8 enables §9:** the AI gateway is just another service behind the gateway/PDP; AI agents authorize via the *same* `POST /v1/authorize`; webhooks deliver AI-derived events (e.g. `sanctions.hit`) to partners.
- **§9 enables §12:** the MVP's value (clean trade loop) is *carried by* document IDP + classification + screening; V2/V3's bank/government appeal is *carried by* governed, auditable, sovereign-capable AI.
- **§12 forces §8/§9 to be real:** MVP makes the envelope/idempotency/PDP/WORM/citation guarantees non-optional, because the first paying trader and the first regulator both depend on them.
