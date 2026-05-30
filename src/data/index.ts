import { USER_ROLES, type UserRole } from '@/core/roles';
import {
  Activity,
  AlertTriangle,
  Banknote,
  Bot,
  CreditCard,
  DollarSign,
  GanttChartSquare,
  Globe,
  Landmark,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
  Cpu,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

/**
 * @file data/index.ts
 * @description Centralized high-scale institutional data for the Baalvion Infrastructure Platform.
 */

// Data types
export type HeroCard = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  description: string;
  role: UserRole[];
};

export type Kpi = {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: LucideIcon;
  iconClass?: string;
  roles: UserRole[];
};

export type TradeVolume = {
  date: string;
  value: number;
};

export type PartnerPerformance = {
  name: string;
  volume: number;
};

export type FxRate = {
  pair: string;
  rate: number;
  change: string;
};

export type SystemAlert = {
  id: number;
  type: 'Critical' | 'Info' | 'Resolved';
  title: string;
  description: string;
  time: string;
  timestamp: string;
  details: string;
};

export type Trade = {
  id: string;
  importer: string;
  exporter: string;
  value: string;
  status: 'Approved' | 'Pending' | 'In Transit' | 'Disputed' | 'Settled';
};

export type AiInsight = {
  id: number;
  insight: string;
};

// Data for the main hero cards on the dashboard (Investor-Grade)
export const heroCards: HeroCard[] = [
  {
    title: 'Aggregate Settlement Volume',
    value: 1240000000000,
    prefix: '$',
    icon: Banknote,
    description: 'Trillions in cross-border flow',
    role: Object.values(USER_ROLES) as UserRole[],
  },
  {
    title: 'Network Active Nodes',
    value: 48,
    icon: Cpu,
    description: 'High-availability ledger nodes',
    role: [USER_ROLES.SUPER_ADMIN, USER_ROLES.BANK_ADMIN],
  },
  {
    title: 'Institutional Partners',
    value: 1240,
    icon: Users,
    description: 'Banks, Gov & Enterprises',
    role: [USER_ROLES.SUPER_ADMIN, USER_ROLES.SOVEREIGN_ADMIN, USER_ROLES.COMPLIANCE_ADMIN],
  },
  {
    title: 'Systemic Compliance Rate',
    value: 99.98,
    suffix: '%',
    icon: ShieldCheck,
    description: 'Real-time ledger audit pass',
    role: Object.values(USER_ROLES) as UserRole[],
  },
];

// Data for the secondary row of KPI cards
export const kpiData: Kpi[] = [
    {
    title: 'On-Chain Finality',
    value: '12.4s',
    change: '-0.2s',
    description: 'avg settlement speed',
    icon: Activity,
    iconClass: 'text-green-600',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.BANK_ADMIN, USER_ROLES.SOVEREIGN_ADMIN],
  },
  {
    title: 'API Gateway Uptime',
    value: '99.999%',
    change: 'Stable',
    description: 'Carrier-grade reliability',
    icon: Zap,
    roles: [USER_ROLES.SUPER_ADMIN],
  },
  {
    title: 'Network Risk Index',
    value: 'Optimal',
    change: 'Stable',
    description: 'across all corridors',
    icon: ShieldAlert,
    iconClass: 'text-indigo-600',
    roles: Object.values(USER_ROLES) as UserRole[],
  },
  {
    title: 'Liquidity Depth',
    value: '$1.84B',
    change: '+14%',
    description: 'escrow pool growth',
    icon: BarChart3,
    iconClass: 'text-primary',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.BANK_ADMIN, USER_ROLES.SELLER],
  },
];

// Data for the Trade Volume line chart
export const tradeVolumeData: TradeVolume[] = [
  { date: '2024-10-01', value: 245000000 },
  { date: '2024-10-02', value: 312000000 },
  { date: '2024-10-03', value: 289000000 },
  { date: '2024-10-04', value: 354000000 },
  { date: '2024-10-05', value: 410000000 },
  { date: '2024-10-06', value: 150000000 },
  { date: '2024-10-07', value: 120000000 },
];

// Data for the Partner Performance bar chart
export const partnerPerformanceData: PartnerPerformance[] = [
  { name: 'J.P. Morgan', volume: 450000 },
  { name: 'HSBC', volume: 380000 },
  { name: 'Goldman Sachs', volume: 320000 },
  { name: 'DBS Bank', volume: 280000 },
  { name: 'BNP Paribas', volume: 210000 },
];

// Data for the Live FX Rates table
export const fxRatesData: FxRate[] = [
  { pair: 'USD/INR', rate: 83.54, change: '+0.12%' },
  { pair: 'EUR/USD', rate: 1.08, change: '-0.05%' },
  { pair: 'GBP/USD', rate: 1.27, change: '+0.02%' },
  { pair: 'USD/JPY', rate: 157.1, change: '-0.25%' },
];

// Data for the system alerts
export const systemAlerts: SystemAlert[] = [
  {
    id: 1,
    type: 'Critical',
    title: 'Sanctions Hit on TRD-005',
    description: 'Counterparty flagged on OFAC list.',
    time: '2m ago',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    details: 'Automated screening detected a high-probability match for "Steel Works" in the updated sanctions registry. Operational accounts restricted.',
  },
];

// Data for the recent trades list
export const recentTrades: Trade[] = [
  { id: 'TRD-001', importer: 'Global Imports', exporter: 'Export Corp', value: '$250,000', status: 'Approved' },
  { id: 'TRD-002', importer: 'Tech Solutions', exporter: 'Component King', value: '$15,000', status: 'Pending' },
  { id: 'TRD-003', importer: 'Fashion Forward', exporter: 'Textile Masters', value: '$85,000', status: 'In Transit' },
];

// Data for the partner activity feed
export const partnerActivity = [
  { id: 1, partner: 'J.P. Morgan', activity: 'Approved settlement for TRD-004', time: '5m ago' },
  { id: 2, partner: 'HSBC', activity: 'New trade TRD-015 initiated', time: '12m ago' },
];

// Data for the AI-driven insights
export const aiInsights: AiInsight[] = [
  {
    id: 1,
    insight: 'Network signal: Global demand for Solar PV infrastructure in India is trending +14% WoW.',
  },
  {
    id: 2,
    insight: "Settlement success rate for 'Tech Solutions' has dropped by 15% this quarter. Recommend review.",
  },
];
