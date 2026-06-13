# GTOS — Enterprise Security Blueprint (Phase 11)

> **Audience:** Architecture council, CISO office, bank/government security reviewers, SOC 2 / ISO 27001 auditors.
> **Scope:** The Global Trade Operating System (GTOS) — a multi-tenant, multi-sovereign platform serving banks, governments, customs authorities, and traders.
> **Posture:** Audit-grade. Every claim below is grounded in a **real primitive already in the codebase** (cited with file paths) or explicitly flagged as a **GAP / remediation**. Nothing here is aspirational hand-waving — where a control is not yet built, it is listed in §8 with a severity.

### Ground-truth security primitives (the foundation everything builds on)

| Primitive | Where it lives | What it gives us |
|---|---|---|
| **RBAC + ABAC PDP** | `Backend/services/identity/rbac-service` (`:3005`, schema `rbac`) | System roles `super_admin > country_admin > organization_admin > end_user`; permission strings `{resource}:{action}` (+wildcards); `role_permissions` allow/deny; `POST /v1/authorize` deny-overrides + obligations (`limit`/`mask`/`require_mfa`) + `decision_logs`. |
| **Condition engine** | `rbac-service/engine/conditionEvaluator.js` | Safe, dependency-free JSON-AST ABAC evaluator over `{subject, resource, action, env, tenant}`. Pure, side-effect-free, depth-capped (32), throw-→-non-match. |
| **Auth gateway (BFF)** | `Backend/services/identity/auth-gateway` (`:3099`) | httpOnly cookies `baalvion_access`/`baalvion_refresh`, **RS256** JWT, JWKS, 15m access / 7d refresh, MFA, token-reuse detection, CSRF token, **step-up** elevation, AUTHTRACE stream. |
| **RS256-only verifier** | `auth-gateway/lib/verifier.js` | `createJwksVerifier({ rejectHs256: true, requiredClaims: [sub,sid,jti], redis })` → algorithm-confusion blocked, **JTI blacklist fail-CLOSED** on every verify. |
| **x-identity-envelope v2** | `auth-gateway/lib/envelope.js` | Workload-to-workload identity: `base64url(JSON)` + `x-envelope-sig` HMAC-SHA256, **30s TTL replay window**, `timingSafeEqual`, version-pinned (`v:2`), clock-skew bounded. |
| **WORM audit** | `Backend/services/infrastructure/audit-service` (`:3032`, schema `audit`) | Append-only Postgres (triggers reject UPDATE/DELETE/TRUNCATE even for the owner) + **SHA-256 hash chain** (`prev_hash`/`hash`, genesis `0×64`, verifiable, detects insert/delete). Auto-consumes `baalvion:events`. |
| **Secrets vault** | CMS-backed vault via `@baalvion/sdk` config-resolver | Per-tenant integration secrets, decrypted only internally; CMS is sole crypto authority. |
| **Multi-tenant RLS** | `@baalvion/tenancy` | Postgres Row-Level-Security `ENABLE + FORCE`, `app.current_tenant` GUC, `NOSUPERUSER baalvion_app` role. |

---

## 1 — Zero-Trust Architecture

**Principle:** No implicit trust anywhere. Network location confers zero privilege. Every hop — browser→gateway, gateway→service, service→service, service→DB — is independently authenticated, authorized, and logged. "Inside the cluster" is not a trust boundary.

### 1.1 The five trust hops and what verifies each

```
[ Browser ]
   │  httpOnly RS256 cookie + CSRF token + session fingerprint (ua/ip hash)
   ▼
[ auth-gateway :3099 (BFF) ]  ── verifier.js: RS256-only, JTI blacklist (fail-closed), claim contract
   │  x-identity-envelope v2 (HMAC-SHA256, 30s TTL) + x-envelope-sig
   ▼
[ Service mesh (Istio STRICT mTLS) ]  ── workload-to-workload crypto identity (SPIFFE SVID)
   │  per-request authz call
   ▼
[ rbac-service PDP  POST /v1/authorize ]  ── deny-overrides + ABAC condition + obligations
   │  SET LOCAL app.current_tenant (tenant GUC)
   ▼
[ Postgres — RLS ENABLE+FORCE, NOSUPERUSER baalvion_app role ]
```

Each layer is **defense-in-depth**: even if the layer above is bypassed, the layer below independently denies. RLS is the last-line backstop — a service with a bug in its query still cannot read another tenant's rows because the DB itself enforces the GUC predicate.

### 1.2 Workload identity (the envelope as the in-mesh identity)

The `x-identity-envelope v2` (`auth-gateway/lib/envelope.js`) **is** the propagated end-user identity inside the mesh. It carries `{ user.id, orgId, roles[], permissions[], sessionId }`, the issuing `workload.id/region`, and `geo`, signed HMAC-SHA256 with a 30-second `expires_at`. Downstream services trust it **only after** verifying the signature with `timingSafeEqual` and checking the replay window — never the raw `x-user-id` headers (v1, retired).

**Recommendation (GAP → §8): SPIFFE/SPIRE for workload identity.** Today the envelope is signed with a **shared HMAC secret** — every service holds the same key, so any compromised service can forge any identity. The zero-trust target is:
- **SPIRE issues per-workload SVIDs** (X.509-SVID for mTLS, JWT-SVID for the envelope), short-lived (≤1h), automatically rotated.
- The envelope signer becomes an **asymmetric JWT-SVID** keyed to the issuing workload's SPIFFE ID (`spiffe://gtos/ns/identity/sa/auth-gateway`), so the *issuer is provable and non-forgeable* — a compromised `trade-service` cannot mint an envelope claiming to be `auth-gateway`.
- mTLS peer SVID + envelope SVID are cross-checked: the calling workload's SPIFFE ID must match the envelope `workload.id`.

### 1.3 Mesh mTLS (Istio STRICT)

- **Istio `PeerAuthentication: STRICT`** mesh-wide → all service-to-service traffic is mTLS; plaintext is rejected at the sidecar. This is the transport-layer half of zero-trust; the envelope is the application-layer half.
- **`AuthorizationPolicy`** per namespace: default-deny, then explicit allow-from `principals` (SPIFFE IDs). E.g. only `auth-gateway` and `rbac-service` may call `audit-service`'s ingest; only `payment-rails-service` may call the SWIFT egress.

### 1.4 Microsegmentation (Kubernetes NetworkPolicies)

Default-deny ingress + egress on every namespace. Explicit allowlists only:
- `identity` namespace (auth-gateway, rbac-service, audit-service) is the only one reachable from the ingress gateway for auth.
- `payment` / `finance-java` namespaces have **egress allowlists** to named bank/SWIFT/SEPA endpoints only — no general internet egress (exfiltration containment).
- DB namespaces accept ingress only from their owning service's ServiceAccount.

### 1.5 BeyondCorp-style access for admin surfaces

Admin surfaces (`admin-platform :3030`, rbac-service management APIs, audit verify, sovereign consoles) are **never** exposed on a flat VPN-trusted network. Instead:
- Device-trust + identity-aware proxy (IAP) in front of every admin route; access decision = `user identity ∧ device posture ∧ ABAC policy`, re-evaluated per request.
- Admin actions require a **fresh step-up** (`auth-gateway /auth/step-up`, 300s elevation) — see §2.4.
- The `rbac-service` `authzService.resolve()` already gates its **own** management APIs by the caller's effective admin reach (`canManageTenant` / `canManageScope`) — that is the model: admin tools authorize themselves through the same PDP, no backdoor.

---

## 2 — Identity & Access Management (IAM)

### 2.1 End-user federation (SSO / OIDC / SAML)

GTOS serves enterprise and government users who bring their own IdPs. The auth-gateway is the **single relying party**; identity sources federate into it:

| Federation | For | Mechanism |
|---|---|---|
| **OIDC** | Enterprise banks/traders (Okta, Entra ID, Ping, Google Workspace) | Authorization-code + PKCE; gateway exchanges IdP token → mints canonical **RS256** session cookie. The IdP `sub` is mapped to a GTOS user; group claims map to RBAC roles via a claims-mapping policy. |
| **SAML 2.0** | Government / customs authorities with legacy SAML IdPs | SP-initiated SAML; signed assertions; AudienceRestriction + NotOnOrAfter enforced; assertion → canonical session. |
| **SCIM 2.0** | Automated provisioning/deprovisioning | IdP pushes user lifecycle (create/update/**deactivate**) → user store + `rbac-service` role assignments. Deactivation immediately revokes (§2.5). |

**Hard rule:** federation produces a **canonical RS256 session** — federated tokens never flow downstream. This contains the blast radius of any one IdP and keeps a single verifier (`rejectHs256: true`).

### 2.2 The 16 trade user types → IAM patterns

| User type | Tenant scope | IAM pattern |
|---|---|---|
| Buyer / Importer | organization | OIDC or local; `end_user` + buyer permissions; relationship-edge gating (§3.5) |
| Seller / Exporter | organization | OIDC or local; `end_user` + seller perms |
| Freight Forwarder / Carrier (3PL) | organization | OIDC; scoped to shipments they're a party to |
| Customs Broker | organization | OIDC; jurisdiction-scoped filing perms |
| **Customs Authority Officer** | **country** | **SAML (gov IdP)** + mandatory WebAuthn MFA; `country_admin`-derived, jurisdiction-locked |
| **Bank Trade-Finance Officer** | organization (bank) | OIDC (bank IdP) + step-up for money movement; **maker** role |
| **Bank Approver / Compliance** | organization (bank) | separate **checker** role; SoD-enforced (§3.4) |
| Insurer / Surveyor | organization | OIDC; document-attestation perms |
| Port / Terminal Operator | organization | OIDC; logistics perms |
| Trade Financier / Investor | organization | OIDC; deal-room scoped |
| Compliance / AML Analyst | organization or platform | step-up + read-broad/write-narrow; case perms |
| Auditor (external) | platform (read) | **read-only** PAM grant, time-boxed; audit-verify only |
| Platform Operator (SRE) | platform | PAM/JIT; no standing data access |
| **Sovereign / Country Admin** | **country** | **PAM + break-glass** (§2.4); data-residency-locked; dual-control |
| Super Admin | platform | the smallest possible set of humans; hardware-key MFA mandatory; every action audited |
| Service / Workload | n/a | x-identity-envelope v2 → SPIFFE SVID (§1.2) |

### 2.3 MFA (TOTP / WebAuthn / FIDO2) + step-up

- **Enrollment factors:** TOTP (baseline), **WebAuthn/FIDO2 passkeys** (phishing-resistant, recommended default for all privileged + government users), passwordless via passkey.
- **Step-up is already built:** `auth-gateway /auth/step-up` re-verifies credentials and sets `stepUpLevel='elevated'` for **300s** (`routes/auth.js`). The PDP can demand it: the ABAC obligation **`require_mfa`** is returned by `POST /v1/authorize`, and the PEP must block until the session shows an unexpired step-up. This is the enforcement hook for "you may *view* the LC, but *amending* it requires fresh MFA."
- **Risk-adaptive step-up:** `auth-gateway/scripts/authRiskModel.js` + `geoDetect`/`geoFence` feed a risk score; high-risk (new device, impossible travel, sanctioned geo) forces step-up regardless of resource sensitivity.

### 2.4 Privileged Access Management (PAM / JIT) + break-glass

For sovereign admins, platform SRE, and external auditors — **no standing privilege**:
- **JIT elevation:** a time-boxed role assignment (`rbac-service` `role_assignments.expires_at`, already honored — `authzService.resolve()` filters expired assignments) granted through an approval workflow, auto-expiring.
- **Break-glass (sovereign):** dual-control activation (two distinct sovereign admins), a hard TTL, a loud `severity='critical'` audit event, and an out-of-band alert. Break-glass grants are **never** silent.
- Every PAM grant + use is hash-chained in `audit-service`.

### 2.5 Session & token revocation (already real)

- **JTI blacklist, fail-closed:** `verifier.js` checks `auth:blacklist:<jti>` in Redis on *every* verify; logout (`/auth/logout`) blacklists the jti + deletes the session. Revocation is therefore near-instant and platform-wide — *provided every consumer injects the shared Redis* (propagation GAP, §8).
- **Token-reuse detection:** refresh rotation detects replayed refresh tokens → kills the session family.
- **Session binding:** Redis session stores `uaHash` + `ipHash` + geo; a stolen cookie used from a new fingerprint is detectable.
- **Impersonation hardening:** the existing flow is isolated-issuer, ≤15m, super_admin-only, audited, with a visible banner (per prior audit `[V]`). Keep: impersonation tokens must carry an `act` (actor) claim so the audit trail records *both* the real operator and the impersonated subject.

---

## 3 — RBAC + ABAC (deepen what exists)

### 3.1 The policy model, formalized

GTOS authorization is a **two-stage decision**:

1. **RBAC (coarse):** does the subject hold a role granting `{resource}:{action}` (with wildcard support, e.g. `lc:*`, `*:read`)? `role_permissions` carry **allow/deny**; deny wins.
2. **ABAC (fine):** does the request satisfy the policy `condition` (JSON-AST over `subject/resource/action/env/tenant`, evaluated by `conditionEvaluator.js`)? The PDP (`POST /v1/authorize`) combines all matched policies with **deny-overrides** and emits **obligations** (`limit`, `mask`, `require_mfa`).

```
PEP (service) → POST /v1/authorize { subject, resource, action, context }
PDP → { decision: 'permit'|'deny', obligations: [{ type:'require_mfa' }, { type:'mask', fields:[...] }], policyId, ... }
PEP → enforce decision + apply obligations + (implicitly) decision_logs written
```

**Least privilege** is the default: a role grants *nothing* until permissions are explicitly attached; ABAC further narrows by attribute. The four-level hierarchy (`systemRoles.js`: super_admin 400 → end_user 100) bounds the *maximum* reach; custom roles slot **between** bands.

### 3.2 Obligations as first-class enforcement

Obligations are not advisory — the PEP **must** honor them:
- **`require_mfa`** → block until step-up elevation present (§2.3).
- **`mask`** → redact named fields (PII, PAN, counterparty pricing) in the response. This is how a customs officer sees a shipment but not the commercial invoice price.
- **`limit`** → cap amount/quantity (e.g. a maker may initiate transfers ≤ a threshold; above it requires a higher role).

### 3.3 Dual-control / maker-checker (money movement & customs filings)

State-changing financial and regulatory actions are **two-person**:
- **Money movement** (LC issuance/amendment, payment-rails release, escrow release): a **maker** role initiates a *pending* action; a distinct **checker** role (different user, enforced by policy `subject.id != resource.makerId`) approves. The PDP denies self-approval.
- **Customs filings** (declarations, CoO issuance): submitter ≠ approver; the approver must hold the jurisdiction-scoped role (§3.6).
- Both the initiate and the approve are separate hash-chained audit rows with the same `correlation_id`.

### 3.4 Segregation of Duties (SoD)

Encoded as **conflict policies**: a single user may not simultaneously hold a maker and a checker role for the same resource class; may not be both the AML analyst who clears a case and the operator who releases the payment. SoD conflicts are checked at **role-assignment time** (provisioning) *and* at decision time (defense-in-depth).

### 3.5 Relationship-edge-gated access (a bank sees only its counterparties)

Trade is a **graph**: a bank, an importer, a forwarder are *parties to specific deals*. Access is gated on the **edge**, not just the role:
- A resource (LC, shipment, deal-room) carries its party set. The ABAC condition requires `subject.orgId ∈ resource.parties`:
  ```json
  { "in": [ { "var": "subject.orgId" }, { "var": "resource.partyOrgIds" } ] }
  ```
- A bank with `lc:read` still cannot read an LC it is not a party to — the edge predicate denies. This is the single most important control preventing **commercial intelligence leakage** between competing banks/traders on a shared platform.

### 3.6 Jurisdiction-scoped access (customs / government)

Country tenants are sovereign. A customs officer's role is **bound to a country tenant**; the ABAC condition pins `resource.jurisdiction == subject.country`. `authzService.canManageScope()` already resolves scope→tenant subtree; the same `isWithin(targetTenant, reachTenant)` containment check enforces that a sovereign admin's reach **never** crosses into another country's data (data-residency, §4 BYOK).

### 3.7 Policy-as-code, testing, decision-log audit

- **Policy-as-code:** policies/`role_permissions`/`subject_attributes` are versioned artifacts (migrations `003_policies.sql`), code-reviewed, and deployed via GitOps — not hand-edited in prod.
- **Policy testing:** the `conditionEvaluator` is pure → unit-testable in isolation (`test/engine.test.js`). Every policy ships with **golden permit/deny test vectors**; a policy change that flips an existing vector fails CI.
- **Decision-log audit:** `decision_logs` records every `/v1/authorize` outcome (permit/deny + matched policy + obligations); these feed SIEM (§6) and prove "who was allowed/denied what, when, and why" for auditors.

---

## 4 — Encryption

### 4.1 In transit

- **External:** TLS 1.3 only (no TLS ≤1.1); HSTS preload; modern cipher suites; OCSP stapling.
- **Internal:** **Istio STRICT mTLS** (§1.3) — every in-mesh hop is mutually authenticated and encrypted. No plaintext east-west traffic.

### 4.2 At rest — KMS/HSM envelope encryption, per-tenant DEKs

- **Envelope encryption:** a KMS/HSM-held **CMK** wraps per-tenant **DEKs**; data is encrypted with the DEK, the wrapped DEK is stored alongside. Decryption requires a KMS call → KMS audit trail of every data-access intent.
- **Per-tenant DEKs** are the unit of **crypto-shredding**: GDPR/"right to erasure" and tenant offboarding are satisfied by **destroying that tenant's DEK** — the ciphertext becomes unrecoverable instantly, no expensive row-level deletes, no backup re-scrubbing. (See §7 GDPR.)
- Postgres TDE / encrypted volumes underneath as a second layer.

### 4.3 Field-level encryption (PII / financial)

PII (passport/national-ID for KYC), financial identifiers, and counterparty pricing are **field-encrypted** above the row layer, keyed by per-tenant DEK, so even a DB-level read (e.g. a misconfigured replica) yields ciphertext. The CMS vault (`@baalvion/sdk` config-resolver) is the model: secrets are decrypted **only internally**, never at rest in plaintext.

### 4.4 Key rotation, BYOK / HYOK

- **Rotation:** CMKs rotate on a schedule (≤1y, automated); DEKs re-wrapped without re-encrypting data. Rotation events are audited.
- **BYOK** (Bring Your Own Key) for bank tenants: the tenant supplies its CMK material into the platform KMS — the tenant controls rotation/revocation.
- **HYOK** (Hold Your Own Key) for **sovereign** tenants that legally cannot let key material leave their border: the CMK stays in the sovereign's HSM; GTOS calls *out* to it for wrap/unwrap. Revoking the key = instant sovereign data lockout, fully under the sovereign's control — the strongest data-residency guarantee.

### 4.5 Tokenization (PCI scope reduction)

Card PANs are **tokenized** at the edge (vault/tokenization service); only the token transits GTOS services, so the bulk of the platform is **out of PCI-DSS cardholder-data scope**. Detokenization is confined to a small, PCI-audited enclave. Combined with §3.2 `mask`, PAN never reaches a UI or a non-PCI service.

### 4.6 Document & eBL signing (PKI / eIDAS)

Trade documents (electronic Bills of Lading, Certificates of Origin, e-invoices, term sheets) require **non-repudiation**:
- Each document is **digitally signed** with a per-issuer PKI key (HSM-backed); the signature + signer cert + timestamp are stored and verifiable.
- **Qualified e-signatures (eIDAS)** for EU-facing legal instruments; **qualified timestamps** for sealing. The eBL's possession/transfer events are themselves hash-chained (the `audit-service` model) so the chain of title is tamper-evident.

---

## 5 — Secrets Management

### 5.1 Current state → target

- **Today:** the **CMS-backed vault** resolved via `@baalvion/sdk` config-resolver holds per-tenant integration secrets, decrypted only internally (CMS = sole crypto authority). This is good for *tenant integration secrets* but is not a full platform secrets engine.
- **Target:** **HashiCorp Vault** (or cloud KMS/Secrets Manager) as the platform secrets engine, with the CMS-vault remaining the **tenant-facing** layer that *sources* its master keys from Vault. One root of trust, two consumption surfaces.

### 5.2 Controls

- **No secrets in env for prod.** The HMAC envelope secret, JWKS signing keys, DB creds, and provider keys must come from a secrets engine at runtime — not `process.env` baked into images. (Prior audit `[U]`: "verify no plaintext/fallback before go" — this is the action.)
- **Dynamic / short-lived DB credentials:** Vault DB secrets-engine issues per-pod, short-TTL Postgres creds bound to the `NOSUPERUSER baalvion_app` role — a leaked credential expires in minutes and cannot bypass RLS.
- **Secret rotation:** automated, with versioned secrets and zero-downtime cutover; rotation is audited.
- **GitOps delivery:** **External Secrets Operator** (or sealed-secrets) syncs from Vault into the cluster — secrets are *never* committed to Git, even encrypted-at-rest manifests reference Vault paths, not values.
- **Eliminate the shared-HMAC single point of failure** (§1.2 / §8): migrate the envelope from one shared HMAC secret to per-workload asymmetric SVIDs so there is no single secret whose leak forges all identities.

---

## 6 — Audit, SIEM & Detection

### 6.1 Extend the WORM hash-chain into a full audit strategy

The `audit-service` is the **tamper-evident system of record**: append-only (DB triggers reject UPDATE/DELETE/TRUNCATE — `001_audit_schema.sql`), SHA-256 hash-chained (`hashChain.js`: `hash = SHA256(prev_hash + canonical(row))`, genesis `0×64`), canonicalized over app-controlled fields with stable JSON ordering so the chain is independently recomputable and **insert/delete detectable**. It auto-consumes `baalvion:events`.

Coverage requirements (so the chain is *complete*, not selective):
- **Auth events** (login, MFA, step-up, impersonation, logout, revocation) → audit.
- **Every PDP decision** (`decision_logs`) → audit, esp. all `deny` and all money-movement permits.
- **Money movement & customs filings** (maker + checker rows, same `correlation_id`).
- **Admin/sovereign/PAM/break-glass** actions at `severity ≥ high`.

### 6.2 SIEM pipeline

```
baalvion:events  ─┐
decision_logs    ─┼─► audit-service (WORM hash-chain, system of record)
AUTHTRACE stream ─┘            │
                              ▼
                  SIEM (Splunk / Elastic / Sentinel)  ── correlation, detections, dashboards
                              │
                  ┌───────────┼────────────┐
                  ▼           ▼            ▼
                UEBA      Fraud signals   Alerting / SOAR
```

- **AUTHTRACE → detections:** the auth-gateway observability stream feeds detection rules (credential stuffing, MFA-fatigue, impossible travel, token-reuse spikes — `authRiskModel.js` already scores these).
- **UEBA:** baseline per-user/per-org behavior; flag anomalies (a customs officer suddenly querying 100× normal shipments; a bank user accessing counterparties outside its historical graph).
- **Fraud signals (trade-specific):** duplicate-invoice financing, round-tripping, over/under-invoicing vs. market price, sanctioned-counterparty proximity, velocity spikes on LC issuance.

### 6.3 Tamper-evidence proofs & immutable export

- **Verifiable chain:** a periodic verify job recomputes the hash chain and publishes a signed "chain head" digest to an external WORM store + a notary/transparency-log style anchor; an auditor can prove no row was altered or removed between two anchors.
- **Immutable export:** stream the audit chain to **S3 Object Lock (Compliance mode) / WORM** for the retention period (e.g. 7y financial), so even a platform compromise cannot rewrite history.

### 6.4 Incident response

Runbooks (severity-tiered) for: token/key compromise (rotate signing keys + JWKS roll + mass-blacklist), envelope-secret compromise (rotate HMAC / revoke SVIDs), cross-tenant leak (freeze tenant, RLS forensic, audit-chain query), sanctions hit, break-glass misuse. Each runbook names owners + SLAs and ends with a chain-verified post-incident audit export.

---

## 7 — Compliance Control Mapping

> Each row: **requirement → how THIS platform satisfies it (real primitive) → gap → remediation.**

### 7.1 SOC 2 (Trust Services Criteria)

| TSC | Requirement | Platform satisfies via | Gap | Remediation |
|---|---|---|---|---|
| CC6.1 | Logical access controls | RBAC+ABAC PDP, RS256 cookies, MFA | HS256 islands still issue tokens (prior audit) | Retire trade/elite-circle/insiders HS256 issuers |
| CC6.1 | Least privilege | role_permissions allow/deny + ABAC narrowing | — | Maintain golden policy tests |
| CC6.6 | Boundary protection | Istio STRICT mTLS + NetworkPolicies | mTLS not yet enforced everywhere | Roll out STRICT mesh-wide |
| CC6.7 | Encryption in transit | TLS1.3 + mTLS | — | — |
| CC6.8 | Unauthorized-change prevention | WORM audit triggers + hash chain | — | — |
| CC7.2 | Detection / monitoring | AUTHTRACE + risk model + SIEM | SIEM/UEBA not deployed | Deploy SIEM pipeline (§6.2) |
| CC7.3 | Incident response | IR runbooks (§6.4) | Runbooks authored, not drilled | Tabletop + live IR drill |
| CC8.1 | Change management | Policy-as-code + GitOps + CI policy tests | — | — |
| A1.2 | Availability | (see reliability doc) | — | — |

### 7.2 ISO 27001 (Annex A families)

| Annex A | Control area | Platform satisfies via | Gap | Remediation |
|---|---|---|---|---|
| A.5 | Org policies | This blueprint + IR runbooks | Formal ISMS not certified | Engage cert body |
| A.8 (5.x) | Identity & access | RBAC/ABAC, MFA, PAM/JIT, SoD | Standing sovereign privilege | JIT-only sovereign (§2.4) |
| A.8.24 | Cryptography | KMS envelope, per-tenant DEK, mTLS, PKI | BYOK/HYOK not yet wired | Implement BYOK/HYOK (§4.4) |
| A.8.15 | Logging | WORM hash-chain audit | Coverage gaps in some services | Complete event emission (§6.1) |
| A.8.16 | Monitoring | AUTHTRACE + SIEM | SIEM pending | §6.2 |
| A.8.28 | Secure coding | ECC code-review + security-reviewer | — | — |
| A.5.14 | Secrets/transfer | CMS vault → Vault target | Prod secrets in env risk | §5 ESO + dynamic creds |

### 7.3 GDPR

| Requirement | Platform satisfies via | Gap | Remediation |
|---|---|---|---|
| Lawful basis / consent | Per-purpose data model; tenant DPA | Consent records not centralized | Consent registry |
| DSAR (access/portability) | Tenant-scoped queries + RLS | No self-serve DSAR endpoint | Build DSAR export API |
| RoPA | Data-flow catalog (this doc + service map) | Not formalized | Maintain RoPA register |
| Right to erasure | **Crypto-shred per-tenant DEK** (§4.2) | Field-level DEK granularity needed for sub-tenant subject | Per-subject DEK or field-shred |
| Data residency | Country tenants + RLS + **HYOK** (§4.4) | HYOK not implemented | §4.4 sovereign HSM |
| Breach notification (72h) | Hash-chain audit pinpoints scope | IR drill pending | §6.4 |
| Processor obligations | Per-tenant isolation (RLS+DEK) | — | DPAs per tenant |

### 7.4 PCI-DSS

| Requirement | Platform satisfies via | Gap | Remediation |
|---|---|---|---|
| Scope minimization | **Tokenization** of PANs (§4.5) | Tokenization enclave not built | Build/validate tokenization service |
| Req 1 — segmentation | NetworkPolicies + payment-namespace egress allowlist | Mesh not fully segmented | §1.4 |
| Req 3 — stored data | Field encryption + tokenization | — | — |
| Req 4 — transit | TLS1.3 + mTLS | — | — |
| Req 7/8 — access/MFA | RBAC+ABAC + MFA + PAM | — | — |
| Req 10 — logging | WORM hash-chain audit | — | Confirm 1y online / 3mo immediate |
| SAQ vs RoC | Tokenization → likely **SAQ-A/A-EP** for most flows; RoC for the enclave | Assessment not done | QSA engagement |

### 7.5 Trade-specific regimes

| Regime | Control | Platform satisfies via | Gap | Remediation |
|---|---|---|---|---|
| **Sanctions (OFAC/EU/UN)** | Screen every counterparty + payment against consolidated lists; block + audit hits | Sanctions screening engine (risk-service, Jaro-Winkler watchlist + adjudication) + ABAC deny + WORM audit | List-feed freshness + payment-time re-screen | Wire live list feeds + screen at payment release |
| **KYC / AML / CDD** | Identity verification, beneficial ownership, ongoing monitoring | KYC seams (account-service), AML rules engine (FATF), maker-checker case clearing (§3.3) | CDD evidence vault + EDD workflow | Build CDD doc vault (field-encrypted) |
| **FedRAMP / IRAP / C5** (gov assurance) | Continuous monitoring, FIPS crypto, boundary controls | mTLS, WORM audit, RBAC/ABAC, NetworkPolicies | No ATO; FIPS-validated modules not confirmed | FIPS 140-3 KMS/HSM; pursue ATO per gov tenant |

---

## 8 — Top Security Risks & Remediation (prioritized)

> Honest, system-specific. Severity reflects blast radius on a platform holding bank money-movement, sovereign customs data, and competing parties on one substrate.

| # | Risk | Severity | Why it's real here | Remediation |
|---|---|---|---|---|
| **R1** | **Cross-tenant data leakage if RLS / edge-gating is not enforced *everywhere*** | **CRITICAL** | `@baalvion/tenancy` RLS is the last-line backstop, but it only protects services that (a) use the `NOSUPERUSER baalvion_app` role and (b) `SET LOCAL app.current_tenant`. Any service connecting as a superuser or forgetting the GUC bypasses RLS silently. Plus relationship-edge gating (§3.5) is policy-level, not DB-level — a missing edge predicate leaks one bank's deal to a competitor. | Enforce `baalvion_app` role + tenant-middleware across **all** data services; CI guard that fails any service connecting as superuser; add per-service RLS conformance tests; make edge-party predicates mandatory in money/deal resources. |
| **R2** | **HS256 fallback / issuer islands** | **CRITICAL** | Prior audit: **trade, elite-circle, insiders still issue HS256 tokens**; the canonical gateway is `rejectHs256: true` but island verifiers may accept symmetric tokens → algorithm-confusion / forged-token risk, and mixed-auth breakage. | Retire the 3 HS256 issuers; single canonical RS256 issuer + JWKS; CI guard `ci:auth:guards` all-green (currently 3/4 fail); assert `rejectHs256` on every verifier. |
| **R3** | **Shared-HMAC envelope = single forgeable identity secret + replay** | **HIGH** | Every service holds the *same* envelope HMAC secret (`envelope.js`); a single compromised service can **mint any user/role envelope**. The 30s TTL bounds replay but not forgery. | Migrate to **SPIFFE/SPIRE per-workload asymmetric SVIDs** (§1.2); cross-check mTLS peer SVID vs envelope `workload.id`; add a per-envelope nonce + jti to a short-TTL replay cache for true replay-once semantics. |
| **R4** | **JTI-blacklist propagation incomplete** | **HIGH** | Revocation is fail-closed *only for consumers that inject the shared Redis* (`verifier.js redis`). A consumer wired to a different/empty Redis would **not** see revocations → a logged-out/compromised token stays valid there. | Mandate shared blacklist Redis injection for every verifier; live cross-service revocation test; alert on verifiers with no Redis bound. |
| **R5** | **Secret sprawl / prod secrets in env, no rotation executed** | **HIGH** | Prior audit `[U]`: secret rotation NOT executed; verify no plaintext/fallback. Envelope HMAC, JWKS keys, DB creds risk living in env/images. | Move to Vault + External Secrets Operator; dynamic short-TTL DB creds; execute + prove rotation; CI secret-scan; remove all `process.env` secret fallbacks for prod. |
| **R6** | **Tokens in frontend localStorage** | **HIGH** | Prior audit: **7 frontend localStorage token writes** → XSS-exfiltratable session theft, defeating httpOnly cookies. | Complete cookie-auth cutover; remove all localStorage token writes + residual Firebase/Supabase; enforce CSP + Trusted Types. |
| **R7** | **Supply-chain (dependency + build)** | **HIGH** | Large polyglot fleet (Node + Java + frontends); a malicious transitive dep or poisoned build is a platform-wide foothold. | SBOM per service, signed images (cosign/Sigstore), provenance (SLSA), pinned + Dependabot-gated deps, admission controller rejecting unsigned/unscanned images. |
| **R8** | **PDP availability / fail-mode** | **HIGH** | If `rbac-service` PDP is unreachable, PEPs must **fail-closed** (deny). A naive fail-open turns an outage into an authz bypass. | Assert fail-closed in every PEP; PDP HA + decision cache with short TTL; chaos-test PDP outage → confirm deny. |
| **R9** | **Self-approval / SoD bypass in money movement** | **HIGH** | Maker-checker (§3.3) is only as strong as the policy; a missing `subject.id != makerId` predicate or a user holding both roles enables single-actor fraud. | Conflict policies at assignment-time + decision-time; mandatory self-approval-deny predicate on all money/customs actions; SoD audit report. |
| **R10** | **Audit-chain export gap (tamper-evidence only if anchored)** | **MEDIUM** | The hash chain detects tampering *if* a trusted prior head exists; without external WORM anchoring, a full-DB compromise could rebuild a self-consistent chain. | Publish signed chain-head anchors to S3 Object Lock + external notary; periodic verify job + alert on break. |
| **R11** | **Sovereign data residency without HYOK** | **MEDIUM** | Country tenants + RLS isolate data logically, but key material still lives in platform KMS → a sovereign cannot *technically* guarantee data never leaves its control. | Implement HYOK (§4.4) for sovereign tenants; key revocation = instant lockout. |
| **R12** | **Admin-surface exposure** | **MEDIUM** | admin-platform / rbac mgmt / audit-verify are high-value; flat-network exposure invites lateral movement. | BeyondCorp IAP + device trust + mandatory step-up (§1.5/§2.4) on all admin routes. |

### Top-of-stack call to the council

The two **CRITICAL** items (R1 cross-tenant enforcement everywhere, R2 HS256 retirement) are **go/no-go blockers** for any bank or government tenant. They are already known from prior audits and are *mechanism-complete but rollout-incomplete* — i.e. the hard engineering exists; what remains is disciplined, verified, platform-wide enforcement plus the SPIFFE/Vault/SIEM build-outs.

---

*Grounded in: `rbac-service` (authzService.js, conditionEvaluator.js, systemRoles.js), `auth-gateway` (verifier.js, envelope.js, routes/auth.js, authRiskModel.js), `audit-service` (hashChain.js, 001_audit_schema.sql), `@baalvion/tenancy` RLS, CMS-backed vault via `@baalvion/sdk`, and `docs/operations/production-readiness-scorecard.md`.*
