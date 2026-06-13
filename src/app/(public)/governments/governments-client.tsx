"use client";
/**
 * @file governments-client.tsx
 * @description "For Governments & Regulators" solution page — shows a customs
 * declaration + sanctions screening result as a peek, and explains how Baalvion
 * gives authorities real-time oversight without exposing commercial data.
 */

import { Eye, ShieldCheck, Scale, FileText, Globe, Network } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { SolutionPage, BrowserFrame, PeekRow, PeekBadge, type SolutionConfig } from '../_components/solution/solution-page';

function CustomsPeek() {
  return (
    <BrowserFrame label="Customs Oversight · /governance/customs">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Declaration #ICE-9920</p>
          <p className="text-lg font-black text-white">HS 0901.21 · Roasted Coffee</p>
        </div>
        <PeekBadge tone="emerald">Accepted</PeekBadge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Gateway</p>
          <p className="text-xs font-black text-white">ICEGATE · IN</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Duty Assessed</p>
          <p className="text-xs font-black text-white tabular-nums">$2,140.00</p>
        </div>
      </div>

      <div className="space-y-2">
        <PeekRow icon={ShieldCheck} label="Sanctions · OpenSanctions" value="NO MATCH" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={Scale} label="Dual-Use Goods Check" value="CLEAR" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={FileText} label="Audit Log" value="IMMUTABLE" valueClass="text-slate-300 text-[11px]" />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <PeekBadge tone="slate">ACE · US</PeekBadge>
        <PeekBadge tone="slate">CDS · EU</PeekBadge>
        <PeekBadge tone="slate">Mirsal · AE</PeekBadge>
      </div>
    </BrowserFrame>
  );
}

const config: SolutionConfig = {
  audience: 'For Governments & Regulators',
  problem: 'Trade indicators arrive weeks late, and enforcement happens after the goods are already gone.',
  headline: (
    <>
      See Trade As It Happens.<br />
      <span className="text-primary">Enforce At The Point Of Filing.</span>
    </>
  ),
  subhead:
    'Baalvion connects customs filing across ICEGATE, ACE, CDS, and Mirsal with live sanctions screening and immutable audit logs — giving authorities real-time, read-only oversight without touching commercially sensitive data.',
  primaryCta: { label: 'Request Sovereign Access', href: PATHS.ACCESS_REQUEST },
  secondaryCta: { label: 'View Governance Architecture', href: PATHS.PLATFORM },
  peek: <CustomsPeek />,
  proof: [
    { value: '4', label: 'Customs Gateways' },
    { value: 'Real-Time', label: 'Trade Visibility' },
    { value: 'Read-Only', label: 'Oversight Access' },
    { value: 'Immutable', label: 'Audit Logs' },
  ],
  capabilitiesTitle: 'Infrastructure For Sovereign Oversight',
  capabilitiesLede:
    'Move from lagging, fragmented indicators to structured, real-time intelligence — with enforcement embedded at the moment a trade is filed, not after the fact.',
  capabilities: [
    { icon: Globe, title: 'Customs At The Source', how: 'Declarations file directly into national gateways (ICEGATE, ACE, CDS, Mirsal) with tariff and HS-code validation built into the workflow.' },
    { icon: ShieldCheck, title: 'Screening On Every Trade', how: 'Parties and goods are checked against sanctions and dual-use watchlists before clearance — fail-closed, every time.' },
    { icon: Eye, title: 'Macro Visibility', how: 'Anonymized, read-only dashboards show national trade flows, corridors, and commodity movements without exposing private commercial terms.' },
    { icon: FileText, title: 'Audit-Ready By Default', how: 'Every action writes an immutable, timestamped log — the evidence base for policy, disputes, and regulatory review is always there.' },
  ],
  stepsTitle: 'Data-Driven Governance, Built In',
  steps: [
    { title: 'Connect', desc: 'Bind your customs gateway and watchlist sources through API-first, hierarchical access control.' },
    { title: 'Monitor', desc: 'Watch filings, screenings, and corridor flows in real time from a secure read-only oversight portal.' },
    { title: 'Act', desc: 'Trigger alerts on anomalies and breaches, and base policy on aggregated, verified trade intelligence.' },
  ],
  closingTitle: 'Transform Trade Governance',
  closingDesc:
    'Engage our institutional team to connect Baalvion with your customs, sanctions, and oversight systems.',
};

export function GovernmentsClient() {
  return <SolutionPage config={config} />;
}
