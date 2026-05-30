/**
 * @file governance/page.tsx
 * @description Sovereign Governance & Administration overview — the landing for the admin cluster.
 * Surfaces live platform KPIs (real trade-service aggregates) and a navigable map of every
 * governance / oversight / administration module.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService, PlatformStats } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Loader2, Lock, Users, Activity, Building2, Gavel, FileCheck,
  Landmark, ScrollText, Radar, Ship, Cpu, Server, ShieldAlert,
  Network, GitBranch, ClipboardCheck, Globe, BadgeCheck, Boxes, Workflow,
  Eye, Siren, ArrowRight, Database,
} from 'lucide-react';

interface ModuleLink { label: string; href: string; icon: any; desc: string; }
interface ModuleGroup { title: string; items: ModuleLink[]; }

const GROUPS: ModuleGroup[] = [
  {
    title: 'Commerce & Economic Command',
    items: [
      { label: 'Commerce Command', href: '/governance/commerce-command', icon: Boxes, desc: 'Trade execution oversight' },
      { label: 'Economic Command', href: '/governance/economic-command', icon: Activity, desc: 'Liquidity & market control' },
      { label: 'Organizations', href: '/governance/organizations', icon: Building2, desc: 'Tenant registry & KYC' },
      { label: 'Bank Admin', href: '/governance/bank-admin', icon: Landmark, desc: 'Banking rails & settlement' },
    ],
  },
  {
    title: 'Compliance, Risk & Disputes',
    items: [
      { label: 'Compliance Admin', href: '/governance/compliance-admin', icon: FileCheck, desc: 'KYC / AML / sanctions' },
      { label: 'Disputes & Arbitration', href: '/governance/disputes', icon: Gavel, desc: 'Case resolution' },
      { label: 'Approvals', href: '/governance/approvals', icon: ClipboardCheck, desc: 'Two-key authority queue' },
      { label: 'Regulatory', href: '/governance/regulatory', icon: ScrollText, desc: 'Rules & advisories' },
      { label: 'Customs', href: '/governance/customs', icon: BadgeCheck, desc: 'Tariffs & clearance' },
      { label: 'Audit Logs', href: '/governance/audit-logs', icon: Eye, desc: 'Immutable audit trail' },
    ],
  },
  {
    title: 'Sovereign & Strategy',
    items: [
      { label: 'Sovereign Admin', href: '/governance/sovereign-admin', icon: ShieldCheck, desc: 'Root authority' },
      { label: 'Control Tower', href: '/governance/control-tower', icon: Radar, desc: 'Executive command' },
      { label: 'War Room', href: '/governance/war-room', icon: Siren, desc: 'Crisis operations' },
      { label: 'Directives', href: '/governance/directives', icon: ScrollText, desc: 'Active mandates' },
      { label: 'Intelligence', href: '/governance/intelligence', icon: Radar, desc: 'Strategic intel' },
      { label: 'Policies', href: '/governance/policies', icon: ScrollText, desc: 'Policy engine' },
    ],
  },
  {
    title: 'Maritime & Logistics',
    items: [
      { label: 'Maritime', href: '/governance/maritime', icon: Ship, desc: 'Fleet & corridors' },
      { label: 'SLA Monitoring', href: '/governance/sla', icon: Activity, desc: 'Carrier SLAs' },
    ],
  },
  {
    title: 'Identity & Access',
    items: [
      { label: 'Identity', href: '/governance/identity', icon: Users, desc: 'Identity fabric' },
      { label: 'Permissions', href: '/governance/permissions', icon: Lock, desc: 'RBAC matrix' },
      { label: 'Certification', href: '/governance/certification', icon: BadgeCheck, desc: 'Accreditations' },
      { label: 'Onboarding', href: '/governance/onboarding', icon: GitBranch, desc: 'Tenant onboarding' },
    ],
  },
  {
    title: 'Platform & Infrastructure',
    items: [
      { label: 'Platform Admin', href: '/governance/platform-admin', icon: Server, desc: 'Master control tower' },
      { label: 'Master Data', href: '/governance/master-data', icon: Database, desc: 'Reference data' },
      { label: 'Infrastructure', href: '/governance/infrastructure', icon: Cpu, desc: 'Compute & data plane' },
      { label: 'Security', href: '/governance/security', icon: ShieldAlert, desc: 'SOC & defense' },
      { label: 'Observability', href: '/governance/observability', icon: Activity, desc: 'Telemetry & traces' },
      { label: 'Workflow Builder', href: '/governance/workflow-builder', icon: Workflow, desc: 'Automation studio' },
      { label: 'Interoperability', href: '/governance/interoperability', icon: Network, desc: 'Connectors & APIs' },
      { label: 'Ecosystem', href: '/governance/ecosystem', icon: Globe, desc: 'Partner network' },
    ],
  },
];

export default function GovernanceOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminService.getPlatformOverview()
      .then((s) => { if (!cancelled) setStats(s); })
      .catch(() => { /* graceful: render shell with zeroed KPIs */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const kpis = [
    { label: 'Global Liquidity', value: stats ? formatCurrency(stats.volume.total) : '—', sub: 'Escrow-backed', icon: Lock, color: 'text-emerald-600' },
    { label: 'Institutions', value: stats ? String(stats.entities.total) : '—', sub: `${stats?.entities.activeTenants ?? 0} active`, icon: Building2, color: 'text-blue-600' },
    { label: 'Active Deals', value: stats ? String(stats.operations.activeDeals) : '—', sub: 'In negotiation', icon: Activity, color: 'text-purple-600' },
    { label: 'In Transit', value: stats ? String(stats.operations.shipmentsInTransit) : '—', sub: 'Live shipments', icon: Ship, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" /> Sovereign Governance
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Authoritative oversight across commerce, compliance, identity, and infrastructure.
          </p>
        </div>
        <Badge variant="outline" className="gap-2 font-bold">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="h-2 w-2 rounded-full bg-emerald-500" />}
          {loading ? 'Syncing' : 'Live'}
        </Badge>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</span>
                <k.icon className={cn('h-4 w-4', k.color)} />
              </div>
              <div className="text-2xl font-black mt-2">{k.value}</div>
              <div className="text-[11px] text-muted-foreground font-medium">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module map */}
      {GROUPS.map((group, gi) => (
        <motion.section
          key={group.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.04 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{group.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {group.items.map((m) => (
              <Link key={m.href} href={m.href} className="group">
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-colors">
                      <m.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm truncate">{m.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{m.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
