/**
 * @file routes.ts
 * @description Centralized route registry that drives the navigation rail.
 * Comprehensive coverage of every operational + governance dashboard, grouped for clean UX.
 */
import { PATHS } from '@/lib/paths';
import { UserRole, USER_ROLES } from './roles';
import {
  LayoutDashboard, Store, FileText, MessageSquare, PackageCheck, Truck, Wallet,
  ShieldCheck, Globe, History, Settings, Compass, Zap, Activity, Crosshair,
  Landmark, LockKeyhole, BarChart3, Database, Radio, Gavel, Scale, Siren, Server,
  Workflow, Cpu, RefreshCw, Ship, Building2, Radar, Boxes, GitBranch, FileCheck,
  Network, Eye, BadgeCheck, Users, Inbox, ClipboardCheck, Bell, Plug,
} from 'lucide-react';

export type RouteCategory =
  | 'COMMAND'
  | 'MARKETPLACE'
  | 'SOURCING'
  | 'NEGOTIATIONS'
  | 'EXECUTION'
  | 'LOGISTICS'
  | 'FINANCE'
  | 'COMPLIANCE'
  | 'INTELLIGENCE'
  | 'GOVERNANCE'
  | 'IDENTITY'
  | 'INFRASTRUCTURE'
  | 'SOVEREIGN'
  | 'ADMINISTRATION';

export interface RouteMetadata {
  path: string;
  label: string;
  icon: any;
  roles: UserRole[];
  category: RouteCategory;
}

// Convenience role bundles.
const TRADE = [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE];
const ADMIN = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ORG_OWNER, USER_ROLES.SOVEREIGN_OPERATOR];

// Ordered list of categories — also drives the sidebar group order + section labels.
export const CATEGORY_ORDER: { key: RouteCategory; label: string }[] = [
  { key: 'COMMAND', label: 'Command' },
  { key: 'MARKETPLACE', label: 'Marketplace' },
  { key: 'SOURCING', label: 'Sourcing & RFQ' },
  { key: 'NEGOTIATIONS', label: 'Negotiations' },
  { key: 'EXECUTION', label: 'Orders & Execution' },
  { key: 'LOGISTICS', label: 'Logistics' },
  { key: 'FINANCE', label: 'Finance & Treasury' },
  { key: 'COMPLIANCE', label: 'Compliance & Risk' },
  { key: 'INTELLIGENCE', label: 'Intelligence' },
  { key: 'GOVERNANCE', label: 'Governance & Admin' },
  { key: 'IDENTITY', label: 'Identity & Security' },
  { key: 'INFRASTRUCTURE', label: 'Infrastructure & Ops' },
  { key: 'SOVEREIGN', label: 'Sovereign Command' },
  { key: 'ADMINISTRATION', label: 'Settings' },
];

export const ROUTE_REGISTRY: RouteMetadata[] = [
  // ── COMMAND ──
  { path: '/dashboard', label: 'Global Observatory', icon: LayoutDashboard, roles: [...TRADE, ...ADMIN], category: 'COMMAND' },
  { path: '/executive/command', label: 'Executive Command', icon: Crosshair, roles: ADMIN, category: 'COMMAND' },
  { path: '/buyer/dashboard', label: 'Buyer Overview', icon: LayoutDashboard, roles: [USER_ROLES.BUYER_NODE], category: 'COMMAND' },
  { path: '/seller/dashboard', label: 'Seller Console', icon: BarChart3, roles: [USER_ROLES.SELLER_NODE], category: 'COMMAND' },
  { path: '/agent/dashboard', label: 'Agent Console', icon: Users, roles: [USER_ROLES.AGENT, ...ADMIN], category: 'COMMAND' },

  // ── MARKETPLACE ──
  { path: '/marketplace', label: 'Trade Discovery', icon: Store, roles: TRADE, category: 'MARKETPLACE' },
  { path: '/marketplace/prices', label: 'Market Prices', icon: BarChart3, roles: TRADE, category: 'MARKETPLACE' },
  { path: '/discovery/radar', label: 'Opportunity Radar', icon: Radar, roles: TRADE, category: 'MARKETPLACE' },
  { path: '/discovery/signals', label: 'Market Signals', icon: Zap, roles: TRADE, category: 'MARKETPLACE' },

  // ── SOURCING ──
  { path: '/buyer/rfqs', label: 'Buyer RFQs', icon: FileText, roles: [USER_ROLES.BUYER_NODE], category: 'SOURCING' },
  { path: '/seller/rfqs', label: 'Incoming RFQs', icon: FileText, roles: [USER_ROLES.SELLER_NODE], category: 'SOURCING' },
  { path: '/seller/listings', label: 'My Listings', icon: Boxes, roles: [USER_ROLES.SELLER_NODE], category: 'SOURCING' },
  { path: '/sourcing/auctions', label: 'Auctions', icon: Gavel, roles: TRADE, category: 'SOURCING' },
  { path: '/sourcing/pipeline', label: 'Sourcing Pipeline', icon: GitBranch, roles: TRADE, category: 'SOURCING' },
  { path: '/suppliers', label: 'Suppliers', icon: Building2, roles: [...TRADE, ...ADMIN], category: 'SOURCING' },

  // ── NEGOTIATIONS ──
  { path: '/deals', label: 'Deal Rooms', icon: MessageSquare, roles: TRADE, category: 'NEGOTIATIONS' },
  { path: '/negotiations/contracts', label: 'Contract Workspace', icon: FileText, roles: TRADE, category: 'NEGOTIATIONS' },
  { path: '/messages', label: 'Messages', icon: Inbox, roles: [...TRADE, ...ADMIN], category: 'NEGOTIATIONS' },

  // ── EXECUTION ──
  { path: '/orders', label: 'Order Pipeline', icon: PackageCheck, roles: [...TRADE, ...ADMIN], category: 'EXECUTION' },
  { path: '/trade-management', label: 'Trade Management', icon: Workflow, roles: [...TRADE, ...ADMIN], category: 'EXECUTION' },
  { path: '/trade-ops', label: 'Trade Operations', icon: Ship, roles: [...TRADE, ...ADMIN], category: 'EXECUTION' },
  { path: '/agents', label: 'Agent Marketplace', icon: Users, roles: TRADE, category: 'EXECUTION' },
  { path: '/field/operations', label: 'Field Operations', icon: Crosshair, roles: ADMIN, category: 'EXECUTION' },

  // ── LOGISTICS ──
  { path: '/logistics-shipment', label: 'Global Tracking', icon: Truck, roles: [...TRADE, ...ADMIN], category: 'LOGISTICS' },
  { path: '/logistics-shipment/control-tower', label: 'Control Tower', icon: Radar, roles: ADMIN, category: 'LOGISTICS' },
  { path: '/shipments', label: 'Shipments', icon: Ship, roles: [...TRADE, ...ADMIN], category: 'LOGISTICS' },
  { path: '/carriers', label: 'Carriers', icon: Truck, roles: TRADE, category: 'LOGISTICS' },
  { path: '/customs', label: 'Customs', icon: BadgeCheck, roles: [...TRADE, ...ADMIN], category: 'LOGISTICS' },

  // ── FINANCE ──
  { path: '/payments', label: 'Payments', icon: Wallet, roles: [...TRADE, ...ADMIN], category: 'FINANCE' },
  { path: '/escrow', label: 'Escrow Vaults', icon: LockKeyhole, roles: [...TRADE, ...ADMIN], category: 'FINANCE' },
  { path: '/financials/treasury', label: 'Treasury', icon: Landmark, roles: ADMIN, category: 'FINANCE' },
  { path: '/financials/trade-finance', label: 'Trade Finance', icon: Landmark, roles: ADMIN, category: 'FINANCE' },
  { path: '/financials/credit-lines', label: 'Credit Lines', icon: Scale, roles: ADMIN, category: 'FINANCE' },
  { path: '/financials/invoices', label: 'Invoices', icon: FileText, roles: [...TRADE, ...ADMIN], category: 'FINANCE' },
  { path: '/finance-settlement', label: 'Settlement', icon: RefreshCw, roles: ADMIN, category: 'FINANCE' },
  { path: '/insurance', label: 'Insurance', icon: ShieldCheck, roles: [...TRADE, ...ADMIN], category: 'FINANCE' },

  // ── COMPLIANCE ──
  { path: '/compliance', label: 'Compliance Hub', icon: ShieldCheck, roles: [...TRADE, ...ADMIN], category: 'COMPLIANCE' },
  { path: '/compliance/kyc', label: 'KYC Verification', icon: BadgeCheck, roles: [...TRADE, ...ADMIN], category: 'COMPLIANCE' },
  { path: '/compliance-regulatory', label: 'Regulatory', icon: Scale, roles: [...TRADE, ...ADMIN], category: 'COMPLIANCE' },
  { path: '/compliance-regulatory/hs-codes', label: 'HS Code Engine', icon: FileText, roles: [...TRADE, ...ADMIN], category: 'COMPLIANCE' },
  { path: '/documents', label: 'Document Vault', icon: FileText, roles: [...TRADE, ...ADMIN], category: 'COMPLIANCE' },

  // ── INTELLIGENCE ──
  { path: '/intelligence-hub', label: 'Intelligence Hub', icon: Compass, roles: [...TRADE, ...ADMIN], category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/analytics', label: 'Analytics', icon: BarChart3, roles: [...TRADE, ...ADMIN], category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/risk', label: 'Risk Intelligence', icon: Siren, roles: ADMIN, category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/geopolitical', label: 'Geopolitical', icon: Globe, roles: [...TRADE, ...ADMIN], category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/maritime', label: 'Maritime', icon: Ship, roles: [...TRADE, ...ADMIN], category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/sea-routes', label: 'Sea Routes', icon: Radar, roles: [...TRADE, ...ADMIN], category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/disruptions', label: 'Disruptions', icon: Siren, roles: [...TRADE, ...ADMIN], category: 'INTELLIGENCE' },
  { path: '/intelligence-hub/ai-center', label: 'AI Command Center', icon: Cpu, roles: ADMIN, category: 'INTELLIGENCE' },
  { path: '/crisis-center', label: 'Crisis Center', icon: Siren, roles: ADMIN, category: 'INTELLIGENCE' },

  // ── GOVERNANCE & ADMIN ──
  { path: '/governance', label: 'Admin Overview', icon: ShieldCheck, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/platform-admin', label: 'Platform Admin', icon: Server, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/organizations', label: 'Organizations', icon: Building2, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/onboarding', label: 'Onboarding Review', icon: BadgeCheck, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/platform-status', label: 'Platform Status', icon: Activity, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/commerce-command', label: 'Commerce Command', icon: Store, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/economic-command', label: 'Economic Command', icon: Activity, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/bank-admin', label: 'Bank Admin', icon: Landmark, roles: [...ADMIN, USER_ROLES.BANK_ADMIN], category: 'GOVERNANCE' },
  { path: '/governance/compliance-admin', label: 'Compliance Admin', icon: ShieldCheck, roles: [...ADMIN, USER_ROLES.COMPLIANCE_OFFICER], category: 'GOVERNANCE' },
  { path: '/governance/customs', label: 'Customs Command', icon: Gavel, roles: [...ADMIN, USER_ROLES.CUSTOMS_AGENT], category: 'GOVERNANCE' },
  { path: '/governance/regulatory', label: 'Regulatory', icon: Scale, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/disputes', label: 'Disputes', icon: Gavel, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/approvals', label: 'Approvals', icon: ClipboardCheck, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/policies', label: 'Policies', icon: FileCheck, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/directives', label: 'Directives', icon: FileText, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/master-data', label: 'Master Data', icon: Database, roles: ADMIN, category: 'GOVERNANCE' },
  { path: '/governance/audit-logs', label: 'Audit Ledger', icon: History, roles: [...ADMIN, USER_ROLES.PLATFORM_AUDITOR], category: 'GOVERNANCE' },

  // ── IDENTITY & SECURITY ──
  { path: '/governance/identity', label: 'Identity Fabric', icon: Users, roles: ADMIN, category: 'IDENTITY' },
  { path: '/governance/security/rbac', label: 'Roles & Permissions', icon: LockKeyhole, roles: ADMIN, category: 'IDENTITY' },
  { path: '/governance/security/tenants', label: 'Tenants', icon: Building2, roles: ADMIN, category: 'IDENTITY' },
  { path: '/governance/security', label: 'Security Command', icon: ShieldCheck, roles: ADMIN, category: 'IDENTITY' },
  { path: '/governance/soc', label: 'Security Ops Center', icon: Eye, roles: ADMIN, category: 'IDENTITY' },
  { path: '/governance/certification', label: 'Certification', icon: BadgeCheck, roles: ADMIN, category: 'IDENTITY' },
  { path: '/governance/onboarding', label: 'Tenant Onboarding', icon: GitBranch, roles: ADMIN, category: 'IDENTITY' },

  // ── INFRASTRUCTURE & OPS ──
  { path: '/governance/infrastructure', label: 'Infra Control', icon: Server, roles: ADMIN, category: 'INFRASTRUCTURE' },
  { path: '/governance/resilience', label: 'Resilience Engine', icon: ShieldCheck, roles: ADMIN, category: 'INFRASTRUCTURE' },
  { path: '/governance/observability', label: 'Observability', icon: Activity, roles: [...ADMIN, USER_ROLES.PLATFORM_AUDITOR], category: 'INFRASTRUCTURE' },
  { path: '/governance/deployment', label: 'Deployment', icon: RefreshCw, roles: ADMIN, category: 'INFRASTRUCTURE' },
  { path: '/governance/automation', label: 'Automation', icon: Workflow, roles: ADMIN, category: 'INFRASTRUCTURE' },
  { path: '/governance/interoperability', label: 'Interoperability', icon: Network, roles: ADMIN, category: 'INFRASTRUCTURE' },
  { path: '/governance/workflow-builder', label: 'Workflow Builder', icon: Workflow, roles: ADMIN, category: 'INFRASTRUCTURE' },
  { path: '/governance/control-tower', label: 'Control Tower', icon: Crosshair, roles: ADMIN, category: 'INFRASTRUCTURE' },

  // ── SOVEREIGN COMMAND ──
  { path: '/governance/sovereign-admin', label: 'Sovereign Admin', icon: ShieldCheck, roles: ADMIN, category: 'SOVEREIGN' },
  { path: '/governance/sovereign-command', label: 'Sovereign Command', icon: Crosshair, roles: ADMIN, category: 'SOVEREIGN' },
  { path: '/governance/strategy-intelligence', label: 'Strategy Intelligence', icon: Compass, roles: ADMIN, category: 'SOVEREIGN' },
  { path: '/governance/war-room', label: 'War Room', icon: Siren, roles: ADMIN, category: 'SOVEREIGN' },
  { path: '/governance/emergency-ops', label: 'Emergency Ops', icon: Siren, roles: ADMIN, category: 'SOVEREIGN' },
  { path: '/governance/ecosystem', label: 'Ecosystem', icon: Globe, roles: ADMIN, category: 'SOVEREIGN' },

  // ── PLATFORM CONSOLE (platform_owner org type only) ──
  { path: '/platform/organizations', label: 'Organizations', icon: Building2, roles: ADMIN, category: 'GOVERNANCE' },

  // ── ORGANIZATION SELF-ADMINISTRATION (all org types) ──
  { path: '/organization/settings', label: 'Organization Settings', icon: Settings, roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },
  { path: '/organization/users',    label: 'Users & Roles',          icon: Users,    roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },
  { path: '/organization/audit',    label: 'Activity Log',           icon: History,  roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },

  // ── SETTINGS ──
  { path: '/profile', label: 'Profile & Organization', icon: Settings, roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },
  { path: '/settings/integrations', label: 'Integrations', icon: Plug, roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },
  { path: '/settings/notifications', label: 'Notifications', icon: Bell, roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },
  { path: '/settings/security', label: 'Account Security', icon: LockKeyhole, roles: [...TRADE, ...ADMIN], category: 'ADMINISTRATION' },
];
