# GTOS — Navigation & Permissions Spec

> **Status:** Phase 2/3 architecture spec — implementable into `src/core/routes.ts`, `src/core/roles.ts`, and the backend RBAC service (`:3005`).
> **Authoring council:** Product Architect + Enterprise SaaS Architect.
> **Ground truth extended (not replaced):** `RouteMetadata{path,label,icon,roles,category}` + `ROUTE_REGISTRY` flat array + `CATEGORY_ORDER`; `sidebar-nav.tsx` groups by category with `FULL_ACCESS_ROLES` bypass; `USER_ROLES` + `PERMISSION_MATRIX` (resource × action); RBAC `:3005` system-roles `super_admin>country_admin>organization_admin>end_user`, perm strings `{resource}:{action}` (+ `resource:*`, `*:action` wildcards), ABAC PDP `POST /v1/authorize` (deny-overrides + obligations `{limit,mask,require_mfa}`); JWT carries `roles[]+permissions[]`.

This spec **adds** sections/modules; it never removes an existing route. Every existing route in `ROUTE_REGISTRY` (lines 62–179 of `routes.ts`) is preserved verbatim and folded into the L1→L2→L3 tree below.

---

## Part 0 — Type-system extensions (do these first)

### 0.1 `RouteCategory` union additions (`src/core/routes.ts`)

The current union has 14 keys. Add **11** new keys (Network is placed near the top so the relationship graph is reachable; verticals follow their workflow neighbours):

```ts
export type RouteCategory =
  // ── existing (unchanged) ──
  | 'COMMAND' | 'MARKETPLACE' | 'SOURCING' | 'NEGOTIATIONS' | 'EXECUTION'
  | 'LOGISTICS' | 'FINANCE' | 'COMPLIANCE' | 'INTELLIGENCE' | 'GOVERNANCE'
  | 'IDENTITY' | 'INFRASTRUCTURE' | 'SOVEREIGN' | 'ADMINISTRATION'
  // ── NEW ──
  | 'NETWORK'          // first-class participant graph
  | 'PRODUCTS'         // catalog / SKU / spec master
  | 'TRADE_DOCS'       // trade documentation (L/C, B/L, CoO, packing list…)
  | 'QUALITY'          // quality & inspection
  | 'WAREHOUSING'      // warehousing / inventory / 3PL
  | 'SUPPLIERS'        // supplier lifecycle (distinct from sourcing list)
  | 'BANKING'          // banking network
  | 'GOV_GATEWAY'      // government gateway (single-window / filings)
  | 'RESOLUTION'       // trade resolution / disputes / arbitration
  | 'SUSTAINABILITY'   // ESG / carbon / due-diligence
  | 'PORTS';           // ports & terminals
```

### 0.2 `CATEGORY_ORDER` additions

Insert into the ordered array (drives sidebar group order). Recommended placement keeps the operational flow Discovery→Source→Negotiate→Execute and clusters new verticals next to their parent flow:

```ts
export const CATEGORY_ORDER: { key: RouteCategory; label: string }[] = [
  { key: 'COMMAND',        label: 'Command' },
  { key: 'NETWORK',        label: 'Network' },                 // NEW — high (graph is the backbone)
  { key: 'MARKETPLACE',    label: 'Marketplace' },
  { key: 'PRODUCTS',       label: 'Products' },                // NEW — after Marketplace
  { key: 'SOURCING',       label: 'Sourcing & RFQ' },
  { key: 'SUPPLIERS',      label: 'Supplier Lifecycle' },      // NEW — after Sourcing
  { key: 'NEGOTIATIONS',   label: 'Negotiations' },
  { key: 'EXECUTION',      label: 'Orders & Execution' },
  { key: 'TRADE_DOCS',     label: 'Trade Documentation' },     // NEW — after Execution
  { key: 'QUALITY',        label: 'Quality & Inspection' },    // NEW
  { key: 'LOGISTICS',      label: 'Logistics' },
  { key: 'WAREHOUSING',    label: 'Warehousing' },             // NEW — after Logistics
  { key: 'PORTS',          label: 'Ports & Terminals' },       // NEW — after Logistics
  { key: 'FINANCE',        label: 'Finance & Treasury' },
  { key: 'BANKING',        label: 'Banking Network' },         // NEW — after Finance
  { key: 'COMPLIANCE',     label: 'Compliance & Risk' },
  { key: 'GOV_GATEWAY',    label: 'Government Gateway' },       // NEW — after Compliance
  { key: 'SUSTAINABILITY', label: 'Sustainability & ESG' },    // NEW
  { key: 'RESOLUTION',     label: 'Trade Resolution' },        // NEW
  { key: 'INTELLIGENCE',   label: 'Intelligence' },
  { key: 'GOVERNANCE',     label: 'Governance & Admin' },
  { key: 'IDENTITY',       label: 'Identity & Security' },
  { key: 'INFRASTRUCTURE', label: 'Infrastructure & Ops' },
  { key: 'SOVEREIGN',      label: 'Sovereign Command' },
  { key: 'ADMINISTRATION', label: 'Settings' },
];
```

**Net:** 14 → **25 sections.** No code in `sidebar-nav.tsx` changes — it already iterates `CATEGORY_ORDER` and renders any category that has visible routes, with `FULL_ACCESS_ROLES` (SUPER_ADMIN, PLATFORM_ADMIN, SOVEREIGN_ADMIN, SOVEREIGN_OPERATOR, ORG_OWNER, EXECUTIVE_DIRECTOR) seeing all.

### 0.3 Icon imports to add (`lucide-react`)

Append to the existing import block:

```ts
import {
  // …existing…
  Package, Boxes, Tag, Warehouse, Factory, Anchor, Container, Leaf, Sprout,
  ShieldQuestion, Handshake, FileSignature, ScrollText, ClipboardList,
  Microscope, Banknote, Building, Globe2, UsersRound, Share2, Link2, Stamp,
} from 'lucide-react';
```

> Engineer note: keep one canonical icon per concept. Where a needed glyph collides with an existing import (e.g. `Boxes`, `Building2`, `Ship`, `Truck`, `Landmark`, `Gavel`, `Scale`), reuse the already-imported symbol rather than re-importing.

### 0.4 `PERMISSION_MATRIX` resource additions (`src/core/roles.ts`)

The current `PermissionResource` union (9 resources) is **too coarse** for the new domains. Extend it additively (existing 9 keep their meaning; existing matrix entries stay valid):

```ts
export type PermissionResource =
  // ── existing (unchanged) ──
  | 'sourcing' | 'negotiation' | 'settlement' | 'logistics' | 'compliance'
  | 'governance' | 'infrastructure' | 'identity' | 'constitution'
  // ── NEW (fine-grained domains) ──
  | 'products' | 'listings' | 'rfq' | 'deals' | 'orders' | 'shipments'
  | 'documents' | 'customs' | 'payments' | 'escrow' | 'treasury' | 'fx'
  | 'quality' | 'warehouse' | 'suppliers' | 'banking' | 'govGateway'
  | 'resolution' | 'sustainability' | 'ports' | 'network';
```

`PermissionAction` is unchanged (`create|read|update|delete|approve|audit|settle|override|export|seal`).

> **Back-compat shim:** the coarse legacy resources remain as *roll-up aliases* for nav-gating, while the fine-grained resources are the **authoritative** PDP keys. Backend RBAC perm strings use the fine-grained form, e.g. `documents:seal`, `customs:approve`, `escrow:settle`. Map legacy→fine in the PEP: `settlement → {payments,escrow,treasury,fx}`, `sourcing → {products,listings,rfq,suppliers}`, `negotiation → {deals}`, `logistics → {shipments,ports,warehouse}`.

---

## Part 1 — GLOBAL NAVIGATION TREE (Phase 2)

Legend per L2: `path` · `RouteMetadata{...}` shape · L3 = sub-views/tabs/workflows (rendered as in-page tabs or nested route segments under the L2 path).
Role bundles reused from `routes.ts`: `TRADE = [BUYER_NODE, SELLER_NODE]`, `ADMIN = [SUPER_ADMIN, ORG_OWNER, SOVEREIGN_OPERATOR]`. New bundles proposed at the end of Part 1.

### L1: COMMAND  *(existing — unchanged)*
| L2 module | path | RouteMetadata | L3 sub-views |
|---|---|---|---|
| Global Observatory | `/dashboard` | `{path:'/dashboard',label:'Global Observatory',icon:LayoutDashboard,roles:[...TRADE,...ADMIN],category:'COMMAND'}` | KPIs · Live deals · Alerts |
| Executive Command | `/executive/command` | `{…,icon:Crosshair,roles:ADMIN,category:'COMMAND'}` | Org P&L · Exposure · Directives |
| Buyer Overview | `/buyer/dashboard` | `{…,roles:[BUYER_NODE],category:'COMMAND'}` | Open RFQs · Orders · Spend |
| Seller Console | `/seller/dashboard` | `{…,icon:BarChart3,roles:[SELLER_NODE],category:'COMMAND'}` | Listings · Quotes · Revenue |
| Agent Console | `/agent/dashboard` | `{…,icon:Users,roles:[AGENT,...ADMIN],category:'COMMAND'}` | Assignments · Commissions |

### L1: NETWORK  *(NEW — the participant graph)*
> The Network section makes every counterparty type first-class. Each L2 module is a **directory + entity workspace** with the same L3 tab contract: **Profiles · Relationships · Permissions · Compliance status · Activity history · Trade-graph**. Reads are governed by ABAC edge-visibility (see Part 2 policy NET-1).

| L2 module | path | RouteMetadata | L3 sub-views (uniform contract) |
|---|---|---|---|
| Network Overview | `/network` | `{path:'/network',label:'Network Graph',icon:Share2,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | Graph canvas · My edges · Pending invites |
| Buyers | `/network/buyers` | `{…,icon:UsersRound,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | Profiles · Relationships · Permissions · Compliance · Activity · Trade-graph |
| Sellers | `/network/sellers` | `{…,icon:Store,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Suppliers | `/network/suppliers` | `{…,icon:Building2,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Manufacturers | `/network/manufacturers` | `{…,icon:Factory,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Banks | `/network/banks` | `{…,icon:Landmark,roles:[...ADMIN,BANK_ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Insurers | `/network/insurers` | `{…,icon:ShieldCheck,roles:[...ADMIN,INSURANCE_ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Carriers | `/network/carriers` | `{…,icon:Truck,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Ports | `/network/ports` | `{…,icon:Anchor,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Warehouses | `/network/warehouses` | `{…,icon:Warehouse,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Customs Authorities | `/network/customs` | `{…,icon:BadgeCheck,roles:[...ADMIN,CUSTOMS_AGENT,CUSTOMS_OFFICER],category:'NETWORK'}` | (same 6 tabs) |
| Governments | `/network/governments` | `{…,icon:Globe2,roles:[...ADMIN,NATIONAL_REGULATOR,GOV_AGENCY],category:'NETWORK'}` | (same 6 tabs) |
| Inspectors | `/network/inspectors` | `{…,icon:Microscope,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |
| Trade Agents | `/network/agents` | `{…,icon:Handshake,roles:[...TRADE,...ADMIN],category:'NETWORK'}` | (same 6 tabs) |

### L1: MARKETPLACE  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Trade Discovery | `/marketplace` | `{…,icon:Store,roles:TRADE,category:'MARKETPLACE'}` | Catalog · Saved searches |
| Market Prices | `/marketplace/prices` | `{…,icon:BarChart3,roles:TRADE,…}` | Indices · History · Alerts |
| Opportunity Radar | `/discovery/radar` | `{…,icon:Radar,roles:TRADE,…}` | Live · Watchlist |
| Market Signals | `/discovery/signals` | `{…,icon:Zap,roles:TRADE,…}` | Feeds · Triggers |

### L1: PRODUCTS  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Product Catalog | `/products` | `{path:'/products',label:'Product Catalog',icon:Package,roles:[...TRADE,...ADMIN],category:'PRODUCTS'}` | All products · Categories · Drafts |
| Product Detail/Spec | `/products/specs` | `{…,icon:ClipboardList,roles:[...TRADE,...ADMIN],…}` | Specifications · Variants · Media · Certifications |
| SKU & Master Data | `/products/sku` | `{…,icon:Tag,roles:[...ADMIN,OPERATIONS_DIRECTOR],…}` | SKU registry · GTIN/UPC · Units of measure |
| HS / Commodity Mapping | `/products/classification` | `{…,icon:FileText,roles:[...TRADE,...ADMIN],…}` | HS codes · Dual-use flags · Tariff preview |
| Listings | `/products/listings` | `{…,icon:Boxes,roles:[SELLER_NODE,...ADMIN],…}` | Active · Pending · Pricing rules |

### L1: SOURCING & RFQ  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Buyer RFQs | `/buyer/rfqs` | `{…,icon:FileText,roles:[BUYER_NODE],…}` | Open · Awarded · Templates |
| Incoming RFQs | `/seller/rfqs` | `{…,icon:FileText,roles:[SELLER_NODE],…}` | Inbox · Quoted · Declined |
| My Listings | `/seller/listings` | `{…,icon:Boxes,roles:[SELLER_NODE],…}` | Active · Draft |
| Auctions | `/sourcing/auctions` | `{…,icon:Gavel,roles:TRADE,…}` | Live · Sealed-bid · History |
| Sourcing Pipeline | `/sourcing/pipeline` | `{…,icon:GitBranch,roles:TRADE,…}` | Stages · Kanban |
| Suppliers (list) | `/suppliers` | `{…,icon:Building2,roles:[...TRADE,...ADMIN],…}` | Directory *(deep workspace lives in SUPPLIERS section)* |

### L1: SUPPLIER LIFECYCLE  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Supplier Directory | `/suppliers/directory` | `{path:'/suppliers/directory',label:'Supplier Directory',icon:Building2,roles:[...TRADE,...ADMIN],category:'SUPPLIERS'}` | All · Approved · Watchlist |
| Onboarding | `/suppliers/onboarding` | `{…,icon:GitBranch,roles:[...ADMIN,OPERATIONS_DIRECTOR],…}` | Intake · KYC/KYB · Documents · Approval |
| Qualification & Scoring | `/suppliers/scoring` | `{…,icon:BadgeCheck,roles:[...ADMIN,COMPLIANCE_OFFICER],…}` | Risk score · Financial health · Capacity |
| Performance | `/suppliers/performance` | `{…,icon:BarChart3,roles:[...TRADE,...ADMIN],…}` | OTIF · Defect rate · SLA scorecards |
| Contracts & Agreements | `/suppliers/contracts` | `{…,icon:FileSignature,roles:[...ADMIN,EXECUTIVE_DIRECTOR],…}` | MSAs · Pricing · Renewals |
| Offboarding | `/suppliers/offboarding` | `{…,icon:RefreshCw,roles:ADMIN,…}` | Termination · Data retention |

### L1: NEGOTIATIONS  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Deal Rooms | `/deals` | `{…,icon:MessageSquare,roles:TRADE,…}` | Active · Counter-offers · Term sheets |
| Contract Workspace | `/negotiations/contracts` | `{…,icon:FileText,roles:TRADE,…}` | Drafts · Clauses · E-sign |
| Messages | `/messages` | `{…,icon:Inbox,roles:[...TRADE,...ADMIN],…}` | Threads · Attachments |

### L1: ORDERS & EXECUTION  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Order Pipeline | `/orders` | `{…,icon:PackageCheck,roles:[...TRADE,...ADMIN],…}` | Open · In-fulfilment · Closed |
| Trade Management | `/trade-management` | `{…,icon:Workflow,roles:[...TRADE,...ADMIN],…}` | Milestones · Exceptions |
| Agent Marketplace | `/agents` | `{…,icon:Users,roles:TRADE,…}` | Hire · Assignments |
| Field Operations | `/field/operations` | `{…,icon:Crosshair,roles:ADMIN,…}` | Tasks · Geo-ops |

### L1: TRADE DOCUMENTATION  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Document Center | `/trade-docs` | `{path:'/trade-docs',label:'Document Center',icon:ScrollText,roles:[...TRADE,...ADMIN],category:'TRADE_DOCS'}` | Inbox · By-order · Templates · Status |
| Letters of Credit | `/trade-docs/lc` | `{…,icon:FileSignature,roles:[...TRADE,...ADMIN,BANK_ADMIN],…}` | Drafts · Issued · UCP600 checks · Amendments |
| Bills of Lading | `/trade-docs/bl` | `{…,icon:FileText,roles:[...TRADE,...ADMIN,CUSTOMS_AGENT],…}` | Draft · eB/L · Endorsements · Surrender |
| Certificates of Origin | `/trade-docs/coo` | `{…,icon:Stamp,roles:[...TRADE,...ADMIN,GOV_AGENCY],…}` | Issue · Preferential · Chamber-attest |
| Commercial / Packing | `/trade-docs/commercial` | `{…,icon:ClipboardList,roles:[...TRADE,...ADMIN],…}` | Invoice · Packing list · Insurance cert |
| Document Vault | `/documents` | `{…,icon:FileText,roles:[...TRADE,...ADMIN],…}` *(existing route — re-homed here)* | All docs · Versions · Seals |

### L1: QUALITY & INSPECTION  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Quality Hub | `/quality` | `{path:'/quality',label:'Quality Hub',icon:Microscope,roles:[...TRADE,...ADMIN],category:'QUALITY'}` | Overview · Open NCRs · Trends |
| Inspection Orders | `/quality/inspections` | `{…,icon:ClipboardCheck,roles:[...TRADE,...ADMIN],…}` | Scheduled · In-progress · Reports |
| Standards & Specs | `/quality/standards` | `{…,icon:FileCheck,roles:[...ADMIN,COMPLIANCE_OFFICER],…}` | ISO/HACCP · AQL plans |
| Certificates | `/quality/certificates` | `{…,icon:BadgeCheck,roles:[...TRADE,...ADMIN],…}` | Issued · Expiring · Lab results |
| Non-Conformance | `/quality/ncr` | `{…,icon:Siren,roles:[...TRADE,...ADMIN],…}` | NCR queue · CAPA · Resolution |

### L1: LOGISTICS  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Global Tracking | `/logistics-shipment` | `{…,icon:Truck,roles:[...TRADE,...ADMIN],…}` | Map · Milestones · ETAs |
| Control Tower | `/logistics-shipment/control-tower` | `{…,icon:Radar,roles:ADMIN,…}` | Exceptions · Dwell · Rerouting |
| Shipments | `/shipments` | `{…,icon:Ship,roles:[...TRADE,...ADMIN],…}` | List · Detail · Events |
| Carriers | `/carriers` | `{…,icon:Truck,roles:TRADE,…}` | Rate cards · Bookings |
| Customs | `/customs` | `{…,icon:BadgeCheck,roles:[...TRADE,...ADMIN],…}` | Declarations · Holds |

### L1: WAREHOUSING  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Warehouse Network | `/warehousing` | `{path:'/warehousing',label:'Warehouse Network',icon:Warehouse,roles:[...TRADE,...ADMIN],category:'WAREHOUSING'}` | Facilities · Capacity · Map |
| Inventory | `/warehousing/inventory` | `{…,icon:Boxes,roles:[...TRADE,...ADMIN],…}` | Stock · Lots/Batches · Reservations |
| Inbound/Outbound | `/warehousing/flows` | `{…,icon:RefreshCw,roles:[...ADMIN,LOGISTICS_COORDINATOR],…}` | ASN · Receiving · Picking · Dispatch |
| Storage & Yards | `/warehousing/storage` | `{…,icon:Container,roles:[...ADMIN,WAREHOUSE_OPERATOR],…}` | Zones · Cold-chain · Bonded |
| 3PL Operators | `/warehousing/operators` | `{…,icon:Building,roles:ADMIN,…}` | Providers · SLAs · Billing |

### L1: PORTS & TERMINALS  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Port Directory | `/ports` | `{path:'/ports',label:'Port Directory',icon:Anchor,roles:[...TRADE,...ADMIN],category:'PORTS'}` | Ports · Terminals · Berths |
| Berth & Slot Booking | `/ports/bookings` | `{…,icon:Ship,roles:[...ADMIN,LOGISTICS_COORDINATOR,PORT_AUTHORITY],…}` | Schedules · Allocations · Windows |
| Gate & Yard Ops | `/ports/operations` | `{…,icon:Container,roles:[...ADMIN,PORT_AUTHORITY],…}` | Gate moves · Yard · Dwell |
| Vessel Schedules | `/ports/vessels` | `{…,icon:Ship,roles:[...TRADE,...ADMIN],…}` | Arrivals · Departures · AIS |
| Port Charges | `/ports/charges` | `{…,icon:Banknote,roles:[...ADMIN,FINANCE_DIRECTOR],…}` | Tariffs · Demurrage · Invoices |

### L1: FINANCE & TREASURY  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Payments | `/payments` | `{…,icon:Wallet,roles:[...TRADE,...ADMIN],…}` | Outgoing · Incoming · Rails |
| Escrow Vaults | `/escrow` | `{…,icon:LockKeyhole,roles:[...TRADE,...ADMIN],…}` | Held · Release conditions |
| Treasury | `/financials/treasury` | `{…,icon:Landmark,roles:ADMIN,…}` | Cash · FX positions · Hedging |
| Trade Finance | `/financials/trade-finance` | `{…,icon:Landmark,roles:ADMIN,…}` | LC · BG · Invoice finance |
| Credit Lines | `/financials/credit-lines` | `{…,icon:Scale,roles:ADMIN,…}` | Limits · Utilization |
| Invoices | `/financials/invoices` | `{…,icon:FileText,roles:[...TRADE,...ADMIN],…}` | AR · AP |
| Settlement | `/finance-settlement` | `{…,icon:RefreshCw,roles:ADMIN,…}` | Netting · Reconciliation |
| Insurance | `/insurance` | `{…,icon:ShieldCheck,roles:[...TRADE,...ADMIN],…}` | Policies · Claims |

### L1: BANKING NETWORK  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Banking Overview | `/banking-network` | `{path:'/banking-network',label:'Banking Network',icon:Landmark,roles:[...ADMIN,BANK_ADMIN,FINANCE_DIRECTOR],category:'BANKING'}` | Connected banks · Corridors · Status |
| Correspondent Network | `/banking-network/correspondents` | `{…,icon:Network,roles:[...ADMIN,BANK_ADMIN],…}` | RMA · Nostro/Vostro · SWIFT BICs |
| Instruments | `/banking-network/instruments` | `{…,icon:FileSignature,roles:[...ADMIN,BANK_ADMIN,FINANCE_DIRECTOR],…}` | LC · BG · Collections (issued/advised) |
| Settlement Rails | `/banking-network/rails` | `{…,icon:RefreshCw,roles:[...ADMIN,BANK_ADMIN,TREASURY_OPERATOR],…}` | SWIFT · SEPA · ACH · UPI · routing |
| Bank Compliance | `/banking-network/compliance` | `{…,icon:ShieldCheck,roles:[...ADMIN,BANK_ADMIN,COMPLIANCE_OFFICER],…}` | Sanctions · AML on flows · attestations |

### L1: COMPLIANCE & RISK  *(existing — unchanged)*
| L2 | path | shape | L3 |
|---|---|---|---|
| Compliance Hub | `/compliance` | `{…,icon:ShieldCheck,roles:[...TRADE,...ADMIN],…}` | Cases · Screening |
| KYC Verification | `/compliance/kyc` | `{…,icon:BadgeCheck,roles:[...TRADE,...ADMIN],…}` | KYC · KYB · UBO |
| Regulatory | `/compliance-regulatory` | `{…,icon:Scale,roles:[...TRADE,...ADMIN],…}` | Rules · Declarations |
| HS Code Engine | `/compliance-regulatory/hs-codes` | `{…,icon:FileText,roles:[...TRADE,...ADMIN],…}` | Lookup · Dual-use |
| Document Vault | `/documents` *(also linked from TRADE_DOCS)* | `{…,icon:FileText,roles:[...TRADE,...ADMIN],…}` | — |

### L1: GOVERNMENT GATEWAY  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Gateway Overview | `/gov-gateway` | `{path:'/gov-gateway',label:'Government Gateway',icon:Globe2,roles:[...ADMIN,CUSTOMS_AGENT,CUSTOMS_OFFICER,GOV_AGENCY,NATIONAL_REGULATOR],category:'GOV_GATEWAY'}` | Connected authorities · Filing status |
| Customs Filings | `/gov-gateway/filings` | `{…,icon:FileCheck,roles:[...ADMIN,CUSTOMS_AGENT,CUSTOMS_OFFICER],…}` | Import · Export · Transit · Amendments |
| Single Window | `/gov-gateway/single-window` | `{…,icon:Network,roles:[...ADMIN,GOV_AGENCY],…}` | Submissions · Cross-agency routing |
| Permits & Licenses | `/gov-gateway/permits` | `{…,icon:Stamp,roles:[...ADMIN,GOV_AGENCY,COMPLIANCE_OFFICER],…}` | Applications · Issued · Renewals |
| Duties & Tariffs | `/gov-gateway/duties` | `{…,icon:Banknote,roles:[...ADMIN,CUSTOMS_OFFICER,FINANCE_DIRECTOR],…}` | Assessment · Payments · Drawback |
| Inspection Holds | `/gov-gateway/holds` | `{…,icon:Siren,roles:[...ADMIN,CUSTOMS_OFFICER],…}` | Holds · Releases · Examinations |

### L1: SUSTAINABILITY & ESG  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| ESG Overview | `/sustainability` | `{path:'/sustainability',label:'ESG Overview',icon:Leaf,roles:[...TRADE,...ADMIN],category:'SUSTAINABILITY'}` | Score · Targets · Disclosures |
| Carbon Footprint | `/sustainability/carbon` | `{…,icon:Sprout,roles:[...TRADE,...ADMIN],…}` | Shipment CO₂e · Scope 1/2/3 · Offsets |
| Supply-Chain Due Diligence | `/sustainability/due-diligence` | `{…,icon:ShieldQuestion,roles:[...ADMIN,COMPLIANCE_OFFICER],…}` | CSDDD/UFLPA · Forced-labor · Conflict minerals |
| Certifications | `/sustainability/certifications` | `{…,icon:BadgeCheck,roles:[...TRADE,...ADMIN],…}` | FSC · Fairtrade · Organic |
| ESG Reporting | `/sustainability/reporting` | `{…,icon:FileText,roles:[...ADMIN,EXECUTIVE_DIRECTOR,NATIONAL_REGULATOR],…}` | GHG · CBAM · regulator export |

### L1: TRADE RESOLUTION  *(NEW)*
| L2 | path | RouteMetadata | L3 |
|---|---|---|---|
| Resolution Center | `/resolution` | `{path:'/resolution',label:'Resolution Center',icon:Gavel,roles:[...TRADE,...ADMIN,ARBITRATOR],category:'RESOLUTION'}` | My cases · Open · Closed |
| Disputes | `/resolution/disputes` | `{…,icon:Scale,roles:[...TRADE,...ADMIN],…}` | File · Evidence · Timeline |
| Mediation | `/resolution/mediation` | `{…,icon:Handshake,roles:[...ADMIN,ARBITRATOR],…}` | Sessions · Proposals |
| Arbitration | `/resolution/arbitration` | `{…,icon:Gavel,roles:[...ADMIN,ARBITRATOR],…}` | Tribunal · Awards · Enforcement |
| Claims | `/resolution/claims` | `{…,icon:FileText,roles:[...TRADE,...ADMIN,INSURANCE_ADMIN],…}` | Insurance · Cargo · Recovery |

### L1: INTELLIGENCE  *(existing — unchanged)*
Hub `/intelligence-hub` + `/analytics`, `/risk`, `/geopolitical`, `/maritime`, `/sea-routes`, `/disruptions`, `/ai-center`, plus `/crisis-center`. (All 9 existing entries retained verbatim.)

### L1: GOVERNANCE & ADMIN  *(existing — unchanged)*
All 15 existing `/governance/*` entries retained (Admin Overview, Platform Admin, Organizations, Commerce/Economic Command, Bank/Compliance/Customs Admin, Regulatory, Disputes, Approvals, Policies, Directives, Master Data, Audit Ledger).
> Note: `/governance/disputes` (admin oversight) and `/resolution/*` (participant workflow) are intentionally distinct surfaces over the same dispute domain.

### L1: IDENTITY & SECURITY  *(existing — unchanged)*
All 7 entries retained (`/governance/identity`, `/security/rbac`, `/security/tenants`, `/security`, `/soc`, `/certification`, `/onboarding`).

### L1: INFRASTRUCTURE & OPS  *(existing — unchanged)*
All 8 entries retained.

### L1: SOVEREIGN COMMAND  *(existing — unchanged)*
All 6 entries retained.

### L1: SETTINGS  *(existing — unchanged)*
`/profile`, `/settings/integrations`, `/settings/notifications`, `/settings/security` retained.

### New role bundles to declare in `routes.ts`
```ts
const AUTHORITY = [USER_ROLES.BANK_ADMIN, USER_ROLES.INSURANCE_ADMIN, USER_ROLES.CUSTOMS_AGENT];
const GOV = [USER_ROLES.NATIONAL_REGULATOR, USER_ROLES.GOV_AGENCY, USER_ROLES.CUSTOMS_OFFICER];
const OPS = [USER_ROLES.OPERATIONS_DIRECTOR, USER_ROLES.LOGISTICS_COORDINATOR,
             USER_ROLES.WAREHOUSE_OPERATOR, USER_ROLES.PORT_AUTHORITY];
```

> **Engineer fill-in checklist:** for each L2 above, append one `RouteMetadata` literal to `ROUTE_REGISTRY` using the shown shape; L3 tabs render inside the L2 page (Next.js nested segments under the L2 path, e.g. `app/(dashboard)/network/buyers/[tab]/page.tsx` or a tabbed client component). Government/customs surfaces also live under a country-tenant guard (Part 2 §tenant-isolation).

---

## Part 2 — USER TYPES & PERMISSION MATRIX (Phase 3)

### 2.1 The 16 required user types → mapped onto `USER_ROLES`

| # | Required user type | Reuse existing `USER_ROLES` key | New key needed | RBAC system-role | Tenant scope |
|---|---|---|---|---|---|
| 1 | Buyer | `BUYER` / `BUYER_NODE` | — | `end_user` | organization |
| 2 | Seller | `SELLER` / `SELLER_NODE` | — | `end_user` | organization |
| 3 | Supplier | — | **`SUPPLIER`** (`'Supplier Node'`) | `end_user` | organization |
| 4 | Manufacturer | — | **`MANUFACTURER`** (`'Manufacturer Node'`) | `end_user` | organization |
| 5 | Freight Forwarder | partial (`LOGISTICS_COORDINATOR`) | **`FREIGHT_FORWARDER`** (`'Freight Forwarder'`) | `organization_admin` | organization |
| 6 | Carrier | — | **`CARRIER`** (`'Carrier Node'`) | `end_user` | organization |
| 7 | Customs Broker | partial (`CUSTOMS_AGENT`=authority) | **`CUSTOMS_BROKER`** (`'Customs Broker'`) | `end_user` | organization |
| 8 | Customs Officer | — | **`CUSTOMS_OFFICER`** (`'Customs Officer'`) | `country_admin` | **country** |
| 9 | Inspector | — | **`INSPECTOR`** (`'Quality Inspector'`) | `end_user` | organization |
| 10 | Warehouse Operator | — | **`WAREHOUSE_OPERATOR`** (`'Warehouse Operator'`) | `end_user` | organization |
| 11 | Port Authority | — | **`PORT_AUTHORITY`** (`'Port Authority'`) | `country_admin` | **country** |
| 12 | Bank | `BANK_ADMIN` | — | `organization_admin` | organization |
| 13 | Insurance Provider | `INSURANCE_ADMIN` | — | `organization_admin` | organization |
| 14 | Government Agency | partial (`NATIONAL_REGULATOR`) | **`GOV_AGENCY`** (`'Government Agency'`) | `country_admin` | **country** |
| 15 | Platform Admin | `PLATFORM_ADMIN` | — | `super_admin` | platform |
| 16 | Sovereign Admin | `SOVEREIGN_ADMIN` | — | `super_admin` | platform |

### 2.2 `USER_ROLES` additions (`src/core/roles.ts`)

```ts
// --- TRADE PARTICIPANTS (additions) ---
SUPPLIER: 'Supplier Node',
MANUFACTURER: 'Manufacturer Node',
CARRIER: 'Carrier Node',
FREIGHT_FORWARDER: 'Freight Forwarder',
CUSTOMS_BROKER: 'Customs Broker',
INSPECTOR: 'Quality Inspector',
WAREHOUSE_OPERATOR: 'Warehouse Operator',
// --- EXTERNAL AUTHORITY / SOVEREIGN NODES (additions) ---
CUSTOMS_OFFICER: 'Customs Officer',     // country-tenant authority (distinct from CUSTOMS_AGENT broker-side)
PORT_AUTHORITY: 'Port Authority',       // country-tenant
GOV_AGENCY: 'Government Agency',         // country-tenant
```

> **Disambiguation:** existing `CUSTOMS_AGENT='Customs Authority'` is the **trader-facing broker authority**; new `CUSTOMS_OFFICER` is the **state-side officer** bound to a country tenant. Keep both; they sit on opposite sides of every filing.

Each new role needs a `PERMISSION_MATRIX[role]` entry (legacy coarse keys, kept for nav-gating) — minimum viable:

```ts
[USER_ROLES.SUPPLIER]:          { sourcing:['read','update'], negotiation:['create','read','update'], logistics:['read'] },
[USER_ROLES.MANUFACTURER]:      { sourcing:['read','update'], negotiation:['read'], logistics:['create','read','update'] },
[USER_ROLES.CARRIER]:           { logistics:['create','read','update'] },
[USER_ROLES.FREIGHT_FORWARDER]: { logistics:['create','read','update','approve'], compliance:['read'] },
[USER_ROLES.CUSTOMS_BROKER]:    { logistics:['read','update'], compliance:['create','read','update'] },
[USER_ROLES.INSPECTOR]:         { compliance:['read','update'], logistics:['read'] },
[USER_ROLES.WAREHOUSE_OPERATOR]:{ logistics:['read','update'] },
[USER_ROLES.CUSTOMS_OFFICER]:   { logistics:['read','approve','audit'], compliance:['read','update','audit'] },
[USER_ROLES.PORT_AUTHORITY]:    { logistics:['read','update','approve','audit'] },
[USER_ROLES.GOV_AGENCY]:        { compliance:['read','audit','export'], governance:['read','audit'], constitution:['read'] },
```

### 2.3 Authoritative PERMISSION MATRIX — 16 user types × 25 resource domains

Cells list allowed **actions** as fine-grained `{resource}:{action}` perms (PDP-authoritative; wildcards allowed, e.g. a Platform Admin gets `*:read`). `—` = no access. `r/c/u/d/a/ap/s/o/x/sl` abbreviate read/create/update/delete/audit/approve/settle/override/export/seal.

| User type ↓ \ Resource → | products | listings | rfq | deals | orders | shipments | documents | customs | payments | escrow | treasury | fx | compliance | quality | warehouse | suppliers | banking | govGateway | resolution | sustainability | ports | network | governance | identity | infrastructure |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Buyer** | r | r | c,r,u | c,r,u | r | r | r | r | r | r | — | r | r | r | r | r | — | — | c,r | r | r | r(own edges) | — | r(self) | — |
| **Seller** | c,r,u | c,r,u,d | r | c,r,u | r,u | c,r,u | c,r | r | r | r | — | r | r | c,r | r | — | — | — | c,r | r | r | r(own edges) | — | r(self) | — |
| **Supplier** | c,r,u | c,r,u | r | c,r,u | r | r | c,r | r | r | r | — | — | r | c,r,u | r | r(self) | — | — | c,r | c,r,u | r | r(own edges) | — | r(self) | — |
| **Manufacturer** | c,r,u | c,r,u | r | r | r | c,r,u | c,r | r | r | — | — | — | r | c,r,u | r,u | r(self) | — | — | c,r | c,r,u | r | r(own edges) | — | r(self) | — |
| **Freight Forwarder** | r | — | — | r | r | c,r,u,ap | c,r,u | c,r,u | r | — | — | — | r | r | r,u | — | — | r | c,r | r | c,r,u | r(own edges) | — | r(self) | — |
| **Carrier** | — | — | — | r | r | c,r,u | r | r | r | — | — | — | r | — | r | — | — | — | c,r | r | c,r,u | r(own edges) | — | r(self) | — |
| **Customs Broker** | r | — | — | r | r | r,u | c,r,u | c,r,u,ap | r | — | — | — | c,r,u | r | r | — | — | c,r,u | c,r | r | r | r(own edges) | — | r(self) | — |
| **Customs Officer** | r | — | — | — | r | r,a | r,a | c,r,u,ap,a,**o** | r | — | — | — | r,u,ap,a | r | r | — | — | c,r,u,ap,a | r | r,x | r,ap | r(jurisdiction) | r,a | r(self) | — |
| **Inspector** | r | — | — | r | r | r | c,r,u | r | — | — | — | — | r,u | c,r,u,ap,**sl** | r | r | — | — | c,r | c,r | r | r(own edges) | — | r(self) | — |
| **Warehouse Operator** | r | — | — | — | r | r,u | r | r | — | — | — | — | r | r | c,r,u,ap | — | — | — | c,r | r | r | r(own edges) | — | r(self) | — |
| **Port Authority** | — | — | — | — | r | r,u,ap,a | r | r,ap,a | r | — | — | — | r | — | r | — | — | r,ap | r | r | c,r,u,ap,a,**o** | r(jurisdiction) | r,a | r(self) | — |
| **Bank** | — | — | — | r | r | r | r,**sl** | r | r,ap,s,a | r,ap,s,a | r | r,a | r,a | — | — | r | c,r,u,ap,s,a | r | c,r | r | — | r(relationship edges) | — | r | — |
| **Insurance Provider** | r | — | — | r | r | r,a | r,**sl** | r | r | — | — | — | r,a | r | r | r | r | — | c,r,ap | r,a | r | r(relationship edges) | — | r | — |
| **Government Agency** | r | — | — | — | r | r,a | r,a,x | r,ap,a,x | r | — | — | — | r,ap,a,x | r,a | r | r | r,a | c,r,u,ap,a,x,**o** | r,a | r,a,x | r,ap | r(country),a | r,a | r(country) | — |
| **Platform Admin** | r,a | r,a | r,a | r,a | r,a | r,a | r,a | r,a | r,a | r,a | r,a | r,a | r,a,x | r,a | r,a | r,a | r,a | r,a | r,a | r,a,x | r,a | r,a | c,r,u,ap | r,u,a | r,u,a |
| **Sovereign Admin** | a | a | a | a | a | a | a,**sl** | a,**o** | a | a | a | a | a,x | a | a | a | a | a,**o** | a,**o** | a,x | a | a | c,r,u,d,ap,**o** | r,u,a | r,u,a |

> Reading the matrix into perms: e.g. Customs Officer `customs` cell `c,r,u,ap,a,o` → `customs:create customs:read customs:update customs:approve customs:audit customs:override`. Bank `documents:seal` (`sl`) authorizes LC/instrument sealing. Inspector `quality:seal` seals inspection certificates. `network` cells are *edge-scoped* (see NET-1) not blanket reads. Platform/Sovereign Admin rows correspond to RBAC wildcards (`*:read`, `*:audit`, and `*:override` for Sovereign) — but commercial *creation* perms (e.g. `deals:create`) stay with participants by design; admins audit, not transact.

### 2.4 Representative ABAC policies (PDP `POST /v1/authorize`, deny-overrides + obligations)

**NET-1 — Counterparty edge visibility (network reads).**
```json
{ "id":"net-edge-visibility", "effect":"permit",
  "target":{ "action":"network:read" },
  "condition":"subject.org_id == resource.org_id || graph.hasEdge(subject.org_id, resource.entity_id)",
  "obligations":[{ "type":"mask", "fields":["bank_account","ubo_details","contract_value"],
                   "when":"!graph.hasEdge(subject.org_id, resource.entity_id)" }] }
```
A Bank/Insurer sees only counterparties it holds a relationship edge to; non-edge entities return masked stubs (name + status only).

**CUST-1 — Customs Officer jurisdiction scoping.**
```json
{ "id":"customs-jurisdiction", "effect":"permit",
  "target":{ "action":["customs:read","customs:approve","govGateway:read"] },
  "condition":"resource.country == subject.jurisdiction && resource.tenant_type == 'country'",
  "obligations":[] }
```
Officers can read/approve only filings whose `resource.country` equals their assigned `subject.jurisdiction`. Cross-jurisdiction → implicit deny.

**SETTLE-MFA — Step-up auth on money-moving + override actions.**
```json
{ "id":"settle-require-mfa", "effect":"permit",
  "target":{ "action":["payments:settle","escrow:settle","treasury:settle",
                        "customs:override","govGateway:override","governance:override"] },
  "condition":"subject.amount_authority >= resource.amount",
  "obligations":[{ "type":"require_mfa" },
                 { "type":"limit", "field":"amount", "max":"subject.amount_authority" }] }
```
Returns `require_mfa` obligation; PEP must enforce a fresh MFA assertion before executing. `limit` caps per-transaction value to the subject's authority.

**XTEN-1 — Cross-tenant deal visibility (buyer↔seller across orgs).**
```json
{ "id":"cross-tenant-deal", "effect":"permit",
  "target":{ "action":["deals:read","deals:update","documents:read"] },
  "condition":"resource.party_ids contains subject.org_id",
  "obligations":[{ "type":"mask", "fields":["counterparty_margin","internal_notes"] }] }
```
A deal spans two organization tenants; each party reads the shared deal record but counterparty-private fields are masked. This is the controlled exception to org-tenant isolation.

**RESIDENCY-1 — Data-residency masking on exports.**
```json
{ "id":"data-residency", "effect":"permit",
  "target":{ "action":["compliance:export","govGateway:export","sustainability:export"] },
  "condition":"resource.data_region == subject.region || subject.system_role == 'super_admin'",
  "obligations":[{ "type":"mask", "fields":["pii","bank_details"],
                   "when":"resource.data_region != subject.region" },
                 { "type":"audit", "channel":"audit-service" }] }
```
Cross-region exports strip PII/bank fields unless caller is super_admin; every export is force-audited.

**GOV-SINGLEWINDOW — Government agency single-window scope.**
```json
{ "id":"gov-single-window", "effect":"permit",
  "target":{ "action":["govGateway:read","govGateway:approve","permits:approve"] },
  "condition":"resource.country == subject.country && subject.agency_codes contains resource.agency_code",
  "obligations":[{ "type":"audit", "channel":"audit-service" },
                 { "type":"require_mfa", "when":"action == 'govGateway:approve'" }] }
```
An agency officer only acts on submissions routed to their agency within their country tenant; approvals require MFA and are audited.

### 2.5 Tenant-isolation implications

- **Country tenants** (RBAC `country_admin` scope): `CUSTOMS_OFFICER`, `PORT_AUTHORITY`, `GOV_AGENCY`, `NATIONAL_REGULATOR`. Their data partition key is `country`; the PEP MUST inject `tenant_type='country' AND country=subject.jurisdiction` into every query and never resolve them under an organization tenant. Government Gateway / Customs / Ports authority surfaces live behind a **country-tenant guard**.
- **Organization tenants** (RBAC `organization_admin`/`end_user`): all commercial entities (Buyer, Seller, Supplier, Manufacturer, Carrier, Freight Forwarder, Customs Broker, Inspector, Warehouse Operator, Bank, Insurance Provider). Partition key is `org_id`; row-level isolation via the existing `@baalvion/tenancy` RLS (NOSUPERUSER `baalvion_app` role, `app.current_tenant` GUC).
- **Platform tenants** (RBAC `super_admin`): Platform/Sovereign Admin operate above tenants; their reads are audit-scoped (`*:audit`), and any cross-tenant write requires an `override` perm + MFA + force-audit (SETTLE-MFA / RESIDENCY-1).
- **The Network section spans tenants by design** but is gated by NET-1 edge visibility + XTEN-1, so cross-tenant reads are always either edge-authorized or masked — never blanket. The trade-graph is the only place a participant legitimately "sees across" the tenant boundary, and only along its own relationship edges.
- **JWT contract:** issue `roles[]` (display roles) + `permissions[]` (fine-grained `{resource}:{action}` incl. wildcards) + `tenant_type`, `org_id`/`country`, `jurisdiction`, `amount_authority`, `region`, `agency_codes[]` as ABAC subject attributes consumed by the PDP. Frontend `sidebar-nav.tsx` gating stays role-based (unchanged); the backend PDP enforces the fine-grained matrix + obligations on every mutating call.

---

## Summary
Wrote `docs/architecture/GTOS/02-navigation-and-permissions.md` — a Phase-2/3 spec that **extends** (never replaces) the live `routes.ts`/`roles.ts`/RBAC ground truth.
**Part 0** adds 11 `RouteCategory` keys (14→25 sections), the `CATEGORY_ORDER` placement, new lucide icons, and 21 fine-grained `PermissionResource` additions with a legacy→fine PEP mapping.
**Part 1** gives the full L1→L2→L3 navigation tree covering every existing route verbatim plus all new domains and a first-class **NETWORK** section (13 participant directories, uniform 6-tab Profiles/Relationships/Permissions/Compliance/Activity/Trade-graph contract), each L2 with route path + drop-in `RouteMetadata{}` literal and 3 new role bundles.
**Part 2** maps the 16 required user types onto `USER_ROLES` (reusing 6, adding 10 new keys with `'display'` names + RBAC system-role/tenant-scope placement), and provides the authoritative **16 × 25 permission matrix** as `{resource}:{action}` cells.
It includes **6 ABAC policies** (edge visibility, customs jurisdiction, settle/override MFA, cross-tenant deal masking, data-residency export masking, gov single-window) with concrete `permit`/`condition`/`obligations` JSON, plus tenant-isolation rules separating country tenants (govt/customs/ports) from organization tenants (commercial) and the JWT subject-attribute contract.
The doc reads as a fill-in spec: each L2 → one `ROUTE_REGISTRY` literal; each new role → one `USER_ROLES` + `PERMISSION_MATRIX` entry; each policy → one PDP rule.
