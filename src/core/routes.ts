/**
 * @file routes.ts
 * @description Centralized route registry for the Baalvion Institutional OS.
 */
import { PATHS } from '@/lib/paths';
import { UserRole, USER_ROLES } from './roles';
import { 
  LayoutDashboard, 
  Store, 
  FileText, 
  MessageSquare, 
  PackageCheck, 
  Truck, 
  Wallet, 
  ShieldCheck, 
  Globe, 
  History,
  Settings,
  Compass,
  Zap,
  Activity,
  Crosshair,
  Landmark,
  LockKeyhole,
  BarChart3,
  Database,
  Radio,
  Gavel,
  Scale,
  Siren,
  Server,
  Workflow,
  Cpu,
  RefreshCw,
  Scaling,
  Dna,
  Infinity as InfinityIcon,
  Sparkles,
  Rocket,
  Atom
} from 'lucide-react';

export interface RouteMetadata {
  path: string;
  label: string;
  icon: any;
  roles: UserRole[];
  category: 
    | 'EXECUTIVE' 
    | 'DISCOVERY' 
    | 'SOURCING' 
    | 'NEGOTIATIONS' 
    | 'EXECUTION' 
    | 'FINANCIALS' 
    | 'COMPLIANCE' 
    | 'INTELLIGENCE' 
    | 'COLLABORATION' 
    | 'SOVEREIGN_PLATFORM'
    | 'ADMINISTRATION';
}

export const ROUTE_REGISTRY: RouteMetadata[] = [
  // 1. EXECUTIVE
  { path: PATHS.BUYER_DASHBOARD, label: 'Buyer Overview', icon: LayoutDashboard, roles: [USER_ROLES.BUYER_NODE], category: 'EXECUTIVE' },
  { path: PATHS.SELLER_DASHBOARD, label: 'Seller Console', icon: BarChart3, roles: [USER_ROLES.SELLER_NODE], category: 'EXECUTIVE' },
  { path: PATHS.EXECUTIVE_COMMAND, label: 'Sovereign Control', icon: Crosshair, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ORG_OWNER], category: 'EXECUTIVE' },

  // 2. DISCOVERY
  { path: PATHS.MARKETPLACE, label: 'Trade Discovery', icon: Store, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'DISCOVERY' },
  { path: PATHS.MARKET_SIGNALS, label: 'Market Signals', icon: Zap, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'DISCOVERY' },

  // 3. SOURCING
  { path: PATHS.BUYER_RFQS, label: 'RFQs & Tenders', icon: FileText, roles: [USER_ROLES.BUYER_NODE], category: 'SOURCING' },

  // 4. NEGOTIATIONS
  { path: PATHS.DEALS, label: 'Deal Rooms', icon: MessageSquare, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'NEGOTIATIONS' },

  // 5. EXECUTION
  { path: PATHS.ORDERS, label: 'Order Pipeline', icon: PackageCheck, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'EXECUTION' },
  { path: PATHS.LOGISTICS_SHIPMENT, label: 'Global Tracking', icon: Truck, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'EXECUTION' },
  { path: PATHS.CUSTOMS_COMMAND, label: 'Customs Command', icon: Gavel, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMS_AGENT], category: 'EXECUTION' },

  // 6. FINANCIALS
  { path: PATHS.PAYMENTS, label: 'Treasury Wallet', icon: Wallet, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'FINANCIALS' },
  { path: PATHS.ESCROW, label: 'Escrow Vaults', icon: LockKeyhole, roles: [USER_ROLES.BANK_ADMIN, USER_ROLES.BUYER_NODE], category: 'FINANCIALS' },

  // 7. COMPLIANCE
  { path: PATHS.KYC, label: 'Compliance Hub', icon: ShieldCheck, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'COMPLIANCE' },
  { path: PATHS.REGULATORY_INTEL, label: 'Regulatory Intel', icon: Radio, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPLIANCE_OFFICER], category: 'COMPLIANCE' },
  { path: PATHS.GOVERNANCE_AUDIT, label: 'Audit Ledger', icon: History, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PLATFORM_AUDITOR], category: 'COMPLIANCE' },

  // 8. INTELLIGENCE
  { path: PATHS.INTELLIGENCE_HUB, label: 'Command Hub', icon: Compass, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'INTELLIGENCE' },

  // 9. COLLABORATION
  { path: PATHS.MESSAGES, label: 'Unified Inbox', icon: Siren, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'COLLABORATION' },
  
  // 10. SOVEREIGN PLATFORM (Infrastructure & Dev)
  { path: PATHS.INFRA_COMMAND, label: 'Infra Control', icon: Server, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.SOVEREIGN_OPERATOR], category: 'SOVEREIGN_PLATFORM' },
  { path: PATHS.RESILIENCE_COMMAND, label: 'Resilience Engine', icon: ShieldCheck, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.SOVEREIGN_OPERATOR], category: 'SOVEREIGN_PLATFORM' },
  { path: PATHS.DEPLOYMENT_OPS, label: 'Global Rollout', icon: RefreshCw, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.SOVEREIGN_OPERATOR], category: 'SOVEREIGN_PLATFORM' },
  { path: PATHS.OBSERVABILITY_OPS, label: 'Observability', icon: Activity, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PLATFORM_AUDITOR], category: 'SOVEREIGN_PLATFORM' },
  // 11. ADMINISTRATION
  { path: PATHS.PROFILE, label: 'Organization', icon: Settings, roles: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE], category: 'ADMINISTRATION' },
];
