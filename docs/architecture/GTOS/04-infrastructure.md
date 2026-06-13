# GTOS — Global Trade Operating System

## Phase 10 — Infrastructure, Multi-Region, IaC/GitOps, DR, Cloud Blueprints & Observability

> **Author:** Infrastructure Architect, Enterprise Architecture Council
> **Status:** Target-state infrastructure blueprint. **MUST extend the running platform, not greenfield it.**
> **Ground truth referenced:** ~67 catalog descriptors (`baalvion.io/v1`, carrying `spec.deploy{chart,namespace,minReplicas,maxReplicas}`, `spec.slo{availability,latencyP95Ms}`, `spec.datastores[]`, `spec.language`, `spec.tier`); today = Docker Compose + ~40-proc pm2 fleet; **Traefik** single public ingress (`infra/api-gateway/traefik.yml` + `dynamic.yml`, file provider, stripPrefix/ratelimit/sec-headers) routing `/api/v1/<domain>/<service>/*`; Postgres + Redis core infra; Next.js 15 frontends (`next start`); auth-gateway BFF (httpOnly RS256 cookies) + `x-identity-envelope v2` HMAC service-to-service; RBAC PDP (rbac-service :3005); events on `baalvion:events` (Redis Streams, transport-swappable, Kafka target); audit-service :3032 WORM hash-chain; a DR restore drill already proven (540 tables row-for-row, destroy→re-restore).

---

## How to read this document

The platform **already has the right logical seams** for a cloud-native rollout — the catalog `deploy{}` block was designed to drive Helm, the gateway is a single reviewable routing table, identity is envelope-based (mesh-friendly), and events are transport-swappable. Phase 10 is therefore **a lift, not a rewrite**: every section below maps *current reality → target state* and names the one decision that, if gotten wrong, hurts most.

Non-negotiable constraints that shape every decision:

1. **Dual deployment model.** The same artifacts must serve (a) commercial multi-tenant SaaS *and* (b) sovereign/government deployments with hard per-country data residency and (often) air-gap. This forbids any AWS-only primitive in the application layer and forces a **cell-based** topology.
2. **Mixed runtime.** Node + Java/Spring Boot + some Go/Python. The mesh and the base Helm chart must be language-agnostic; no language gets a bespoke deploy path.
3. **Identity is already zero-trust-shaped.** `x-identity-envelope v2` (HMAC) + RBAC PDP must *coexist with* mesh mTLS, not be replaced by it (see §1.6).

---

# 1 — TARGET TOPOLOGY (Kubernetes)

## 1.1 — Reality → K8s mapping

| Today | Target | Driver |
|---|---|---|
| ~40 pm2 processes on one host | One **Deployment** per stateless service; **StatefulSet** for anything owning a volume/quorum | `spec.deploy.chart` |
| Docker Compose `depends_on` | K8s `Service` DNS + `NetworkPolicy` + Istio `DestinationRule` | `spec.dependsOn[]` |
| Compose port mapping | `ClusterIP` only; **no service has a public entrypoint** (preserves today's invariant: backends reachable only internally) | gateway invariant |
| pm2 `instances` | `replicas` + **HPA** (min/max already in catalog) | `spec.deploy.minReplicas/maxReplicas` |
| Traefik file provider | Istio Gateway + (optionally) Traefik IngressRoute — see §1.5 | gateway |
| Postgres/Redis containers | Managed (RDS/Flexible) or operator (CloudNativePG/Patroni) **StatefulSets** in sovereign | `spec.datastores[]` |

The catalog already encodes namespaces. We normalize the observed sprawl (`baalvion`, `baalvion-infra` vs `baalvion-infrastructure`, `financial`, …) into **six domain namespaces** — a catalog lint gate (CI) rejects any descriptor whose `deploy.namespace` is not in this set:

| Namespace | Domain | Representative services |
|---|---|---|
| `gtos-identity` | identity | auth-gateway, rbac-service, account-service, aml-service, audit-service |
| `gtos-commerce` | commerce | trade-service, order-service, payment-service, marketplace-service, deal-room |
| `gtos-knowledge` | knowledge | cms-service, search-service, imperialpedia-service, ml/agent-service |
| `gtos-infrastructure` | infrastructure | notification-service, scheduler, media, edge utilities |
| `gtos-platform` | platform | config/registry, gateway control, event/stream plumbing |
| `gtos-ecosystem` | ecosystem | invest/marketplace, IR, partner/3rd-party surfaces |

Cross-cutting namespaces: `gtos-mesh` (Istio control plane), `gtos-observability` (Prometheus/Grafana/Thanos/Loki/Tempo), `gtos-gitops` (ArgoCD), `gtos-data` (operators: CloudNativePG, Strimzi, ClickHouse operator), `gtos-ingress`.

## 1.2 — Workload types

- **Deployment (stateless, the 90% case):** every Node/Java/Go/Python service. `readinessProbe` on `/healthz` (already convention), `livenessProbe`, `startupProbe` for the slow Spring Boot bootstrap (gives Java 60–120s without tripping liveness), `preStop` `sleep 5` + `terminationGracePeriodSeconds: 30` for clean connection drain, `topologySpreadConstraints` across zones.
- **StatefulSet (quorum/volume owners):** self-hosted Postgres (CloudNativePG), Kafka (Strimzi), Redis (when not managed), ClickHouse, Neo4j, OpenSearch. Stable network identity + `volumeClaimTemplates` + `PodDisruptionBudget minAvailable: N-1`.
- **Jobs/CronJobs:** the scheduler/BullMQ-style work, DR backup jobs, audit-chain verify, catalog reconciler.
- **DaemonSet:** node-level OTel collector, Loki/promtail, CNI, CSI.

## 1.3 — Autoscaling: HPA + VPA + KEDA

The catalog hands us min/max for free; we layer three controllers with a clear division of labour:

- **HPA** — request-driven services, on CPU + a custom metric (`http_requests_inflight`, p95 latency from the SLO block). `minReplicas/maxReplicas` come **directly from `spec.deploy`**, rendered by the base chart. No hand-tuning.
- **KEDA** — **event-driven** workers, the differentiator for GTOS. Scalers on **Kafka consumer-group lag** (and Redis-Streams `XPENDING` depth during the Redis→Kafka transition). The doc-discrepancy worker, sanctions-screening worker, notification fan-out, settlement/ledger consumers scale on backlog, not CPU, and **scale to zero** when idle (huge cost win for sovereign cells with bursty trade volume). KEDA owns the HPA object for these — never both on the same Deployment.
- **VPA** — `recommendation`-mode only in steady state (advisory right-sizing → feeds FinOps, §6); `auto`-mode reserved for the stateful tier where horizontal scaling isn't an option (e.g. a single ClickHouse writer). Never run VPA-auto and HPA on the same workload (they fight on CPU).

## 1.4 — Disruption & scheduling guarantees

- **PodDisruptionBudget** per service: stateless `maxUnavailable: 25%`; tier-1 (`spec.tier: tier-1`) `minAvailable: 2`; stateful `maxUnavailable: 1`. Voluntary disruptions (node drains, upgrades) respect these.
- **PriorityClasses:** `gtos-critical` (identity, gateway, payment, audit) > `gtos-standard` > `gtos-batch` (preemptible). Under node pressure, trade settlement survives; a reindex job dies first.
- **topologySpreadConstraints** `maxSkew: 1` across `topology.kubernetes.io/zone` for every tier-1 Deployment → no single-AZ blast radius.

## 1.5 — Service mesh: Istio (zero-trust data plane)

**Istio in ambient mode** (ztunnel + waypoint proxies) is the recommendation over per-pod sidecars: it removes the sidecar tax on a ~67-service Java-heavy fleet (Java cold-start + a sidecar per replica is real money), and L4 mTLS via ztunnel covers the zero-trust requirement; waypoints are added **only** to namespaces that need L7 policy (commerce, identity). Sidecar mode is the fallback if an ambient-incompatible feature is required.

What Istio buys GTOS:

- **mTLS `STRICT` mesh-wide** (`PeerAuthentication`) — the zero-trust data plane. Every service-to-service hop is mutually authenticated + encrypted at L4 with SPIFFE identities (`spiffe://gtos/ns/<namespace>/sa/<service>`). This is the **transport** identity.
- **Traffic policy** (`DestinationRule`): connection pools, **retries** (idempotent GETs only — POSTs to payment/ledger are explicitly `retries: 0`), **timeouts** from the SLO block (`latencyP95Ms` → request timeout = p95 × headroom), **circuit-breaking** + **outlier detection** (eject a host after N consecutive 5xx — stops a sick replica from poisoning the pool).
- **Canary / progressive delivery** via `VirtualService` weights, driven by Argo Rollouts (§3).
- **Locality-aware routing** — keep traffic in-zone/in-region; fail over to the next locality only on outlier ejection. Critical for the multi-region cost + latency story (§2).

## 1.6 — How `x-identity-envelope` + RBAC PDP coexist with mesh mTLS

This is the decision people get wrong: mesh mTLS and the existing identity envelope are **different layers and both stay**.

| Layer | Question it answers | Mechanism | Stays? |
|---|---|---|---|
| **mTLS (Istio)** | "Is this *workload* who it claims to be, on an encrypted channel?" | SPIFFE cert per ServiceAccount, `STRICT` | NEW |
| **`x-identity-envelope v2`** | "On *whose behalf* (which user/tenant) is this call made, and is the call body intact?" | HMAC-signed envelope, propagated hop-to-hop | **KEEP** |
| **RBAC PDP** | "Is this subject *allowed* to do this action in this tenant?" | rbac-service :3005 authorization decision | **KEEP** |

mTLS authenticates the *pod*; the envelope authenticates the *principal/tenant*; the PDP *authorizes*. Mesh mTLS does **not** replace the envelope — a compromised-but-valid workload cert could still forge a tenant claim, which the HMAC envelope prevents. Concretely:

- Istio `AuthorizationPolicy` adds a **coarse** L4/L7 allowlist ("only `gtos-commerce` SAs may call payment-service") — defence in depth *below* the PDP, not a substitute for it.
- The HMAC envelope secret moves into the per-cell secret store (Vault/KMS, §3/§4); rotate it via mesh-independent rotation. mTLS does not see envelope contents.
- A `RequestAuthentication` policy on the **ingress** waypoint validates the RS256 BFF cookie/JWT once at the edge; internal hops trust the envelope, not re-validate the JWT (perf).

## 1.7 — Ingress recommendation: **Istio Gateway at the edge, retire Traefik's role to a legacy shim**

Today Traefik is the one public ingress with a hand-authored routing table. Recommendation:

> **Adopt the Istio Ingress Gateway (Envoy) as the single public entrypoint and migrate the Traefik `dynamic.yml` routing table into `Gateway` + `VirtualService` resources.** Generate those resources from the same catalog `apis[]`/`deploy{}` data that drives Helm, so the routing table stays a *generated artifact*, not hand-maintained.

Rationale: one data plane (Envoy) for both north-south and east-west means **uniform mTLS, retries, tracing, and outlier detection at the edge and internally** — no policy gap at the Traefik→service boundary, and the `x-trace-id` propagation is consistent end to end. The Traefik concerns (stripPrefix, ratelimit, sec-headers) map cleanly: `stripPrefix` → `VirtualService` rewrite; ratelimit → Envoy local + global (Redis) rate-limit filter; sec-headers → `EnvoyFilter`/response-header policy. Keep Traefik only as a **transitional** front during migration (Traefik → Istio Gateway → mesh), then remove it. **Do not** run two meshes long-term.

```
Internet ─▶ WAF/CDN ─▶ Istio Ingress Gateway (Envoy, TLS term, RequestAuth=JWT)
                          │  rate-limit · sec-headers · path rewrite (was stripPrefix)
                          ▼
                  /api/v1/<domain>/<service>/*  ── VirtualService ─▶ ClusterIP ─▶ ztunnel(mTLS) ─▶ pod
```

---

# 2 — MULTI-REGION & HA (99.99%)

## 2.1 — Data classification drives the replication strategy (not the other way round)

| Data class | Examples | Topology | RPO | RTO | Why |
|---|---|---|---|---|---|
| **A — Financial system-of-record** | ledger, payments, escrow, settlement | **Active-passive** (single-writer region, sync-ish replica) | **≈0 (sync replica)** | **< 5 min** | Money must not split-brain. One authoritative writer; promote on failover. |
| **B — Operational transactional** | trade lifecycle, orders, deals, KYC cases | Active-passive per cell, async replica | < 30 s | < 5 min | Strong consistency preferred; async is acceptable with idempotent replay. |
| **C — Read-heavy / catalog / CMS** | listings, imperialpedia, search index | **Active-active** (multi-region read, regional write) | < 1 min | < 1 min | Conflict-tolerant; last-writer-wins acceptable. |
| **D — Derived / analytical** | ClickHouse rollups, read models | Active-active, rebuildable from events | minutes (rebuild) | < 30 min | Re-derive from Kafka/event log; backups are an optimization, not truth. |
| **E — Audit (WORM)** | audit-service hash-chain | Active-active append, cross-region streamed | ≈0 | < 5 min | Hash-chain must survive any single-region loss intact (§4.4). |

**Cell-based architecture is the spine.** A *cell* = a self-contained stack (full mesh + datastores + a slice of tenants) in one region. Commercial SaaS tenants are sharded across cells by tenant-id; **each government tenant gets its own dedicated single-region cell** (data residency, §5). Blast radius = one cell, never the platform. A cell never depends synchronously on another cell.

## 2.2 — Region topology & global traffic management

- **GeoDNS / Anycast / Global LB:** Route53 latency+geo routing / Azure Front Door / Anycast VIP in sovereign. Health-checked; a region that fails its synthetic check is withdrawn from DNS. Government cells are **pinned** to their country region and never advertised elsewhere.
- **Per-cell ingress** is the Istio Gateway (§1.7). Global LB selects the cell; the cell's mesh handles the rest.
- **Locality-aware routing** keeps east-west traffic in-region; cross-region is the exception path only.

## 2.3 — Stateful replication, by store

- **Postgres** — **CloudNativePG** (operator) or **Patroni** for self-hosted/sovereign; managed RDS/Aurora/Flexible where allowed. Class A: synchronous replica in a second AZ + **async cross-region** standby for DR promotion. Class B/C: cross-region **read replicas** + **logical replication** for selective tables. Connection routing via the operator's read/write split.
- **Kafka** (target bus) — **MirrorMaker2** between cells for cross-region event mirroring with offset translation; **stretch cluster** only within a low-latency region group (not across continents — RTT kills ISR). During the **Redis-Streams → Kafka** migration, the transport-swappable producer (`@baalvion/events`) lets us dual-write and cut over per consumer group with no app rewrite.
- **Redis** — managed active-active (ElastiCache Global Datastore / Azure Cache geo-replication); self-hosted uses **Redis Enterprise CRDT (active-active)** for class-C/session data. Cache is fail-open (already the platform stance) so a regional Redis loss degrades, never fails.
- **ClickHouse** — `ReplicatedMergeTree` + Keeper across AZ; cross-region is async/rebuildable (class D).
- **Neo4j** — causal cluster (core+read replicas) intra-region; cross-region async.
- **Object/Blob** — S3 CRR / Blob GRS / MinIO multi-site replication.

## 2.4 — Hitting 99.99% (the error-budget math)

99.99%/month = **4m23s** of allowed downtime. You cannot buy that from any single dependency; you **engineer it from independence**:

- A request touching N hard dependencies in series has availability `Π aᵢ`. Five 99.9% deps in series = 99.5% — *worse* than the target. The fix is **isolation, not better components**:
  - **Cells** make failures independent — platform availability ≈ `1 − (1−a_cell)^cells` for a tenant pinned to one cell, but cross-cell control plane is engineered to 99.99% separately.
  - **Dependency-failure isolation:** circuit-breakers + outlier detection (§1.5) + **fail-open caches** + **graceful degradation** (Command renders last-known on partial outage — already a stated platform behavior) convert hard dependencies into soft ones, removing them from the multiplication.
  - **No synchronous cross-region calls** on the hot path. Cross-region is async replication only.
- **Error budget = 4m23s/month.** A burn-rate alert (fast 1h/5m windows + slow 6h window, multi-window multi-burn-rate per Google SRE) pages before the budget is gone. Deploys freeze when budget is exhausted (gate wired into ArgoCD, §3).
- **Two AZs minimum per cell, region failover < RTO.** Class-A active-passive promotion is the only manual-ish step and is rehearsed in game days (§4).

---

# 3 — IaC & GITOPS

## 3.1 — Terraform (the cloud substrate)

Terraform provisions everything **below** Kubernetes; ArgoCD owns everything **inside** it. Clean seam, no overlap.

```
terraform/
  modules/
    network/          # VPC/VNet, subnets, NAT, peering, PrivateLink/Private Endpoint
    cluster/          # EKS / AKS / kubeadm(sovereign) — node groups, IRSA/Workload Identity
    postgres/         # RDS·Aurora / Flexible / CloudNativePG bootstrap
    streaming/        # MSK / Event Hubs / Strimzi bootstrap
    cache/            # ElastiCache / Azure Cache / Redis-Enterprise
    search/           # OpenSearch / Azure AI Search / self-hosted OpenSearch
    object/           # S3 / Blob / MinIO
    kms/              # KMS / Key Vault / HSM (PKCS#11)
    dns/              # Route53 / Front Door / sovereign DNS
    iam/              # roles, OIDC, service-account bindings
    observability/    # Thanos object store, Loki store, alertmanager
  envs/
    commercial-prod/  us-east, eu-west, ap-south   (workspaces per region)
    commercial-stg/
    sovereign/<country>/   one dir per government cell
  global/             # GeoDNS, account/subscription scaffolding
```

- **Workspaces per env × region**; **remote state** in S3+DynamoDB / Blob+lock / MinIO+Consul (sovereign), encrypted with the cell's KMS, state access gated by IAM.
- **One module set, three provider backends** — the cloud-specific detail lives behind a thin per-provider module so `cluster/` exposes the same interface (`cluster_endpoint`, `oidc_issuer`, …) whether it renders EKS, AKS, or kubeadm. This is what lets one codebase deploy to all three (§5).

## 3.2 — Crossplane for the long tail

For cloud resources a service needs **on demand** (an S3 bucket, an SQS queue, a DB), expose **Crossplane Compositions** (`XRD`) so a team requests `kind: ObjectBucket` and Crossplane reconciles S3/Blob/MinIO per cell. Terraform builds the *platform*; Crossplane serves *self-service* claims that show up in the same GitOps repo — no Terraform PR for every bucket.

## 3.3 — ArgoCD (app-of-apps + progressive delivery)

- **App-of-apps**: a root `Application` per cell points at `clusters/<cell>/` which fans out to one `Application` per namespace, each rendering the **base chart `baalvion-service`** with per-service values **generated from the catalog `deploy{}` block**. The catalog is the single source of truth → Helm values → ArgoCD → cluster. No drift between "what the catalog says" and "what runs."
- **Sync waves**: wave 0 = CRDs/operators/namespaces; wave 1 = data (CloudNativePG/Strimzi clusters); wave 2 = platform (config, gateway); wave 3 = identity; wave 4 = domain services; wave 5 = frontends. Dependencies (`spec.dependsOn`) inform wave assignment.
- **Argo Rollouts** for progressive delivery: canary steps `5% → 25% → 50% → 100%` gated by **AnalysisTemplates** querying Prometheus (error rate, p95 vs SLO, mesh outlier count). Auto-rollback on breach. Rollout weights are driven through Istio `VirtualService` (§1.5).
- **Drift detection**: ArgoCD `selfHeal: true` for everything except data StatefulSets (those are `manual` to avoid a reconciler stomping a failover). Out-of-band `kubectl edit` is reverted; alert fires.
- **Per-region clusters**: each cell is its own ArgoCD target cluster (hub-and-spoke ArgoCD, or one ArgoCD per cell for hard isolation — **sovereign cells get their own in-cell ArgoCD**, no external control plane reaching into a residency boundary).

## 3.4 — Helm/Kustomize layering

`baalvion-service` (base Helm chart) ← values from catalog ← **Kustomize overlay per env/region** for the deltas (replica overrides, region annotations, sovereign image registry, residency labels). Helm for templating; Kustomize for last-mile environment patches. The catalog already carries `chart:` per service so the mapping is mechanical.

## 3.5 — CI/CD pipeline (build → scan → sign → deploy → smoke)

```
PR ─▶ lint(catalog schema + namespace allowlist) ─▶ unit+contract tests
   ─▶ build (multi-arch, distroless) ─▶ SCA + image scan (Trivy/Grype) + SAST
   ─▶ SBOM (Syft) ─▶ sign image + SBOM (cosign, keyless OIDC) ─▶ SLSA L3 provenance
   ─▶ push to registry (per-cell mirror for sovereign/air-gap)
   ─▶ commit Helm values bump to GitOps repo (NOT a direct kubectl)
   ─▶ ArgoCD syncs ─▶ Argo Rollouts canary ─▶ Prometheus analysis gate
   ─▶ post-deploy smoke (synthetic /healthz + one golden-path E2E per domain)
```

- **Admission**: Kyverno/OPA-Gatekeeper enforces "**no unsigned images**" (cosign verify) + "no `:latest`" + "must have residency label in sovereign cells" + resource limits present. A pod without a valid signature never schedules.
- **Sovereign/air-gap**: the registry, GitOps repo, and ArgoCD all live **inside** the cell; CI produces a **signed, SBOM-attested bundle** (images + manifests) that is physically/one-way transferred in. No build-time egress.

---

# 4 — DISASTER RECOVERY

## 4.1 — Backup / PITR per datastore

| Store | Backup | PITR | Cross-region |
|---|---|---|---|
| Postgres | CloudNativePG/`pgBackRest` base + WAL to object store; or RDS automated | **WAL → arbitrary point** | WAL shipped to second region's bucket |
| Kafka | tiered storage + topic config in Git; MirrorMaker2 mirror **is** the live backup | offset-based replay | mirror cluster |
| Redis | RDB+AOF snapshots (cache = rebuildable, low priority) | n/a (rebuild) | geo-replica |
| ClickHouse | `BACKUP` to object store; rebuildable from Kafka | partition restore | async copy |
| Neo4j | online backup | n/a | async |
| Object | versioning + CRR | version restore | CRR |
| Secrets/KMS | §4.3 | — | §4.3 |

PITR target: **class A/B restorable to any second within the retention window.** Retention: 35 days hot, 1 year cold (compliance), configurable per sovereign mandate.

## 4.2 — Cross-region restore drills & runbooks

The platform **already proved a full DR restore** (540 tables, row-for-row, destroy→re-restore) — that drill becomes a **scheduled, automated game day**, not a one-off:

- Quarterly **cross-region restore drill**: spin an ephemeral cell from backups in the DR region, run the golden-path E2E suite against it, measure actual RTO/RPO, diff row counts, tear down. Pass/fail gates the quarter's DR sign-off.
- **Runbooks** (in-repo, executable where possible): `region-failover.md` (class-A writer promotion), `cell-evacuation.md` (tenant move), `kafka-mirror-promote.md`, `postgres-pitr.md`, `audit-chain-rebuild.md`. Each has a single owner, last-tested date, and a copy-paste command block.

## 4.3 — Secrets/KMS backup

- Vault: **auto-unseal via cloud KMS / HSM**; backup of Vault's encrypted storage backend + a **break-glass** Shamir key set held offline by N custodians (M-of-N). KMS/HSM keys themselves are backed up per provider (KMS key material policy / Key Vault backup / HSM key-export to a sibling HSM under wrap). The **`x-identity-envelope` HMAC secret** and the **RS256 signing key** are first-class backed-up secrets — losing them locks every tenant out, so they are in the M-of-N break-glass set.
- Sovereign: keys **never leave the country HSM**; DR is HSM-to-HSM under a national-cloud-approved wrapping key.

## 4.4 — Audit-chain integrity preservation

The audit-service WORM hash-chain must survive a region loss **provably intact**:

- Each audit event is **streamed cross-region append-only** (class E). On restore, the chain is **re-verified end-to-end** (the existing tamper-detect verify endpoint) before the cell is declared healthy — a restore that breaks the chain **fails the drill**.
- Periodic chain checkpoints (Merkle root) are **anchored** to an independent store (a second-region WORM bucket with object-lock) so a malicious operator can't rewrite history during a DR event.

## 4.5 — Chaos engineering & game days

- **Chaos Mesh / Litmus** in staging-continuous, prod-scheduled: pod-kill, network latency/partition, AZ blackout, dependency 5xx injection, KEDA-lag spike. Each experiment asserts the **error budget is not burned** and degraded-mode behaviors fire (cache fail-open, Command last-known render, circuit-breaker trip).
- **Quarterly game day**: full region failover for one commercial cell + one sovereign-cell DR restore, executed from the runbooks by an on-call who has *not* seen the script. Gaps become backlog with owners.

---

# 5 — CLOUD BLUEPRINTS (all three)

## 5.1 — AWS

| Concern | Service |
|---|---|
| Kubernetes | **EKS** (managed control plane, IRSA for pod IAM) |
| Postgres | **Aurora PostgreSQL** (class A, global database for cross-region) / RDS for smaller cells |
| Kafka | **MSK** (or MSK Serverless for bursty cells) |
| Redis | **ElastiCache** + Global Datastore |
| Search | **OpenSearch Service** |
| Object | **S3** (CRR, Object Lock for audit) |
| KMS | **KMS** (+ CloudHSM for class-A signing) |
| DNS / Edge | **Route53** (latency/geo) + **CloudFront** + **WAF** |
| Private connectivity | **PrivateLink** (no service public; partner integrations over PL) |
| Isolation | **Nitro** enclaves for envelope-HMAC / key ops; dedicated tenancy for gov-adjacent |

## 5.2 — Azure

| Concern | Service |
|---|---|
| Kubernetes | **AKS** (Workload Identity for pod RBAC) |
| Postgres | **Azure Database for PostgreSQL — Flexible Server** (zone-redundant HA, read replicas) |
| Kafka | **Event Hubs (Kafka surface)** or Confluent on Azure |
| Redis | **Azure Cache for Redis** (Enterprise tier for active-active) |
| Search | **Azure AI Search** |
| Object | **Blob Storage** (GRS, immutability policy for audit) |
| KMS | **Key Vault** (+ Managed HSM for class-A) |
| DNS / Edge | **Front Door** (global LB + WAF + CDN) |
| Private connectivity | **Private Link** + Private Endpoints |

## 5.3 — Sovereign cloud (air-gapped / on-prem / national)

| Concern | Self-hosted choice |
|---|---|
| Kubernetes | **bare-metal / OpenStack K8s** (kubeadm or RKE2), no managed control plane |
| Postgres | **CloudNativePG / Patroni** on local NVMe + `pgBackRest` to **MinIO** |
| Kafka | **Strimzi** (self-managed Kafka) |
| Redis | **Redis Enterprise (CRDT)** or self-hosted Redis + Sentinel |
| Search | self-hosted **OpenSearch** |
| Graph | self-hosted **Neo4j** causal cluster |
| Object | **MinIO** (multi-site, object-lock for audit) |
| KMS | **HSM-backed** (PKCS#11, e.g. national-cloud HSM) — keys never leave the country |
| DNS / Edge | in-country DNS + Istio Gateway; **no egress** |
| Residency | **dedicated single-cell per government tenant**, residency labels enforced by admission, network policy default-deny + zero public ingress beyond the national perimeter |

**How a government tenant gets a dedicated cell:** a sovereign cell is the *same* Terraform module set + the *same* `baalvion-service` Helm chart + the *same* catalog, parameterized for the sovereign provider backend and pointed at an **in-cell GitOps/registry/ArgoCD**. The tenant is pinned (GeoDNS withholds it from all other regions), gets its own KMS/HSM root, its own audit-chain anchor, and `NetworkPolicy` default-deny with **no cross-cell calls**. Onboarding a new country = a new `envs/sovereign/<country>/` dir + a signed bundle transfer — not new code.

## 5.4 — Comparison table

| Dimension | AWS | Azure | Sovereign |
|---|---|---|---|
| Control plane | EKS (managed) | AKS (managed) | Self-managed (RKE2/kubeadm) |
| Postgres HA | Aurora global | Flexible zone-redundant | CloudNativePG/Patroni |
| Bus | MSK | Event Hubs/Confluent | Strimzi |
| KMS root | KMS/CloudHSM | Key Vault/Managed HSM | National HSM (PKCS#11) |
| Egress | allowed (PrivateLink preferred) | allowed (Private Link) | **none** |
| Data residency | region pin | region pin | **country-locked cell** |
| GitOps control | hub ArgoCD | hub ArgoCD | **in-cell ArgoCD** |
| Ops burden | low | low | **high (we run everything)** |
| Tenant model | multi-tenant shards | multi-tenant shards | **one cell per gov tenant** |

## 5.5 — Abstraction strategy (one codebase → three targets)

1. **Application layer is cloud-agnostic by construction** — it talks Postgres/Kafka/Redis/OpenSearch/S3-API, never a proprietary SDK. Object access is S3-API (works on S3, Blob via gateway, MinIO). Events go through `@baalvion/events` (transport-swappable). This is *already true* and is the single most important enabler.
2. **Terraform per-provider modules behind one interface** (§3.1) — `cluster/`, `postgres/`, `kms/` expose identical outputs across providers.
3. **Crossplane Compositions** map a provider-neutral claim (`ObjectBucket`, `SqlInstance`) to the right backend per cell.
4. **Catalog + base Helm chart are provider-blind** — the only per-provider deltas are Kustomize overlays (registry, KMS provider, residency labels).
5. **Admission policy is the guardrail** — Kyverno enforces residency labels and signed images so a sovereign cell *cannot* run an unattested or mislabeled workload.

---

# 6 — OBSERVABILITY & OPS

## 6.1 — Metrics: Prometheus → Thanos

- **Prometheus per cell** (Operator-managed), **Thanos** for global query, long-term retention (object store), and downsampling. Sovereign cells keep metrics in-cell (Thanos store gated at the perimeter; aggregated dashboards see only what residency allows).
- **RED + USE** per service; **SLO recording rules** derived from the catalog `slo{availability, latencyP95Ms}` block — every service's dashboard and burn-rate alert are *generated*, not hand-built. SLO drift between catalog and runtime is itself an alert.

## 6.2 — Traces: OpenTelemetry (tie into existing `x-trace-id`)

- **OTel SDK** in every service; the **existing `x-trace-id`** is mapped to the W3C `traceparent` at ingress so today's correlation id flows into distributed traces **without re-instrumenting**. Spans cross the mesh (Istio adds span context) → full request graph across Node/Java/Go/Python.
- **Tempo** (or Jaeger) backend; trace-to-logs and trace-to-metrics exemplars in Grafana → click a slow p95 exemplar → jump to the exact trace → jump to its logs.

## 6.3 — Logs: Loki (or ELK)

- **Loki** (cost-efficient, label-indexed) is the recommendation; ELK where full-text on logs is a hard requirement. Structured JSON logs with `trace_id`, `tenant_id`, `service`, `cell`. Promtail/OTel-collector DaemonSet ships them. Sovereign logs never leave the cell.
- PII/secret redaction at the collector (the envelope HMAC, tokens, account numbers) — a log line never carries a secret.

## 6.4 — SLO dashboards & error budgets

- Per-domain **SLO dashboard**: availability, p95/p99 vs `latencyP95Ms`, **error-budget remaining**, **burn rate** (multi-window: 5m+1h fast, 6h slow). Budget exhaustion **freezes deploys** for that service (ArgoCD gate, §3) — engineering reliability is enforced, not requested.

## 6.5 — On-call & runbooks

- Alertmanager → PagerDuty/Opsgenie, routed by `domain` label to the owning team (`spec.owner` in the catalog). Every page links its **runbook** (§4.2) and the relevant dashboard. Tier-1 services page; tier-2 ticket. Sovereign cells: in-country on-call rotation per contractual model.

## 6.6 — FinOps & capacity

- **Kubecost / OpenCost** per namespace+tenant → showback/chargeback. KEDA scale-to-zero on idle workers and VPA-recommendation right-sizing are the two biggest levers; spot/preemptible for `gtos-batch` PriorityClass.
- **Capacity planning** off Thanos long-term trends: forecast replica needs from request-growth + the catalog `maxReplicas` ceiling; alert when a service trends toward its ceiling so `maxReplicas` is raised *before* saturation, not during an incident.

---

# Multi-Region Target — ASCII Architecture

```
                                  ┌─────────────────────────────────────┐
                                  │     GLOBAL TRAFFIC MANAGEMENT        │
                                  │  GeoDNS / Anycast / Front Door + WAF │
                                  │  (gov tenants pinned to their cell)  │
                                  └───────┬───────────────┬─────────────┘
                  ┌───────────────────────┘               └───────────────────────┐
                  ▼                                                                ▼
   ╔══════════════════════════════════╗                       ╔══════════════════════════════════╗
   ║   COMMERCIAL CELL — REGION A      ║   async replication   ║   COMMERCIAL CELL — REGION B      ║
   ║  (AWS EKS / Azure AKS)            ║◀════ MM2 / WAL ══════▶║  (DR + active-active class C/D)   ║
   ║                                   ║   (Kafka mirror,      ║                                   ║
   ║  Istio Gateway (Envoy, TLS,       ║    Postgres logical,  ║  Istio Gateway                    ║
   ║   JWT auth, rate-limit)           ║    audit-chain stream)║                                   ║
   ║        │                          ║                       ║        │                          ║
   ║        ▼  mTLS STRICT (ztunnel)   ║                       ║        ▼                          ║
   ║  ┌──────────────────────────────┐ ║                       ║  ┌──────────────────────────────┐ ║
   ║  │ ns: identity  commerce       │ ║                       ║  │ identity  commerce  knowledge│ ║
   ║  │     knowledge infra platform │ ║                       ║  │     infra platform ecosystem │ ║
   ║  │     ecosystem  (HPA/KEDA/VPA)│ ║                       ║  │  (read-replicas, KEDA→0 idle)│ ║
   ║  └──────────────────────────────┘ ║                       ║  └──────────────────────────────┘ ║
   ║   x-identity-envelope (HMAC) ─────╫─ on top of mTLS ──────╫────── RBAC PDP authorizes         ║
   ║  ┌──────────────────────────────┐ ║                       ║  ┌──────────────────────────────┐ ║
   ║  │ DATA: CloudNativePG (A:sync) │ ║                       ║  │ Postgres standby (promote@DR)│ ║
   ║  │  Kafka(Strimzi) Redis CRDT   │ ║                       ║  │ Kafka mirror  Redis geo      │ ║
   ║  │  ClickHouse Neo4j OpenSearch │ ║                       ║  │ ClickHouse(rebuildable)      │ ║
   ║  │  S3/Blob (CRR) · WORM audit  │ ║                       ║  │ WORM audit anchor (verify)   │ ║
   ║  └──────────────────────────────┘ ║                       ║  └──────────────────────────────┘ ║
   ╚══════════════════════════════════╝                       ╚══════════════════════════════════╝
                  ▲                                                                ▲
        ArgoCD(hub) ── app-of-apps ◀── GitOps repo ◀── CI(build·scan·cosign·SLSA)─┘
        Terraform(network/cluster/data/kms) provisions the substrate below K8s

   ╔════════════════════════════════════════════════════════════════════════════════════════╗
   ║   SOVEREIGN CELL — COUNTRY X  (air-gapped, NO egress, in-cell ArgoCD+registry+HSM)       ║
   ║   bare-metal/OpenStack K8s · CloudNativePG · Strimzi · MinIO · Neo4j · National HSM       ║
   ║   one dedicated cell per government tenant · residency-labeled · default-deny network     ║
   ║   (signed bundle transferred in; never advertised in GeoDNS to other regions)            ║
   ╚════════════════════════════════════════════════════════════════════════════════════════╝

   OBSERVABILITY (per cell, global view via Thanos where residency permits):
   Prometheus+Thanos · OTel→Tempo (x-trace-id→traceparent) · Loki · Grafana SLO+error-budget
```

---

## Phasing (lift, not rewrite)

1. **Containerize + catalog-lint** the pm2 fleet; normalize namespaces; render `baalvion-service` from `deploy{}`.
2. **One EKS/AKS cell + ArgoCD app-of-apps**; migrate Traefik routing table → Istio Gateway (generated).
3. **Istio ambient mTLS STRICT**; wire envelope+PDP coexistence policies; Argo Rollouts canary.
4. **Redis Streams → Kafka** via the swappable transport; KEDA on lag.
5. **Second region** (class C/D active-active, class A/B passive); DR drill automated.
6. **First sovereign cell** from the same modules; admission-enforced residency.
7. **FinOps + game days** continuous.

---

## 6-Line Summary

1. **Topology:** lift the pm2/Compose fleet onto Kubernetes with six domain namespaces, base `baalvion-service` chart rendered from the catalog `deploy{}` block, HPA + KEDA (Kafka-lag, scale-to-zero) + VPA, PDBs, and **Istio ambient mesh with mTLS STRICT** as the zero-trust data plane.
2. **Identity coexistence:** mTLS authenticates the *workload*, the existing `x-identity-envelope` (HMAC) authenticates the *principal/tenant*, RBAC PDP *authorizes* — all three layers stay; mesh is defence-in-depth, not a replacement.
3. **Ingress:** adopt the **Istio/Envoy Gateway** as the single public entrypoint and generate `Gateway`/`VirtualService` from the same catalog data, retiring Traefik to a migration shim.
4. **HA/multi-region:** **cell-based** architecture with data-class-driven replication (class-A money = active-passive ≈0 RPO; class-C/D = active-active), engineering 99.99% from dependency *isolation* + error-budget burn-rate gates, not from better single components.
5. **IaC/GitOps/DR:** Terraform (per-provider modules behind one interface) builds the substrate, ArgoCD app-of-apps + Argo Rollouts runs in-cluster, CI signs with cosign/SLSA; PITR per store, audit-chain re-verified on restore, automated quarterly cross-region drills and chaos game days.
6. **Three blueprints from one codebase:** AWS (EKS/Aurora/MSK), Azure (AKS/Flexible/Event Hubs), and **sovereign** (bare-metal K8s/CloudNativePG/Strimzi/MinIO/HSM, no egress, one dedicated residency-locked cell per government tenant) — kept identical by a cloud-agnostic app layer, provider-neutral Terraform/Crossplane, and admission-enforced residency.
```
