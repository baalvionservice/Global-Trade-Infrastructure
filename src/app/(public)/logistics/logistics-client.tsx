"use client";
/**
 * @file logistics-client.tsx
 * @description "For Logistics" solution page — shows a multi-leg route optimization
 * + live milestone tracker as a peek, and explains how Baalvion ties physical
 * movement to the financial and compliance events around it.
 */

import { PackageSearch, GitPullRequest, ShieldAlert, AreaChart, Ship, Route } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { SolutionPage, BrowserFrame, PeekRow, PeekBadge, type SolutionConfig } from '../_components/solution/solution-page';

function RoutePeek() {
  const legs = [
    { hub: 'Mumbai (INNSA)', status: 'Departed', tone: 'emerald' as const },
    { hub: 'Jebel Ali (AEJEA)', status: 'Transhipment', tone: 'sky' as const },
    { hub: 'Rotterdam (NLRTM)', status: 'ETA 6d', tone: 'slate' as const },
  ];
  return (
    <BrowserFrame label="Control Tower · /logistics-shipment">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Route · Balanced Plan</p>
          <p className="text-lg font-black text-white">3 Legs · 18 Days · $4,210</p>
        </div>
        <PeekBadge tone="emerald">On Track</PeekBadge>
      </div>

      <div className="relative pl-5 space-y-3 pt-1">
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
        {legs.map((leg) => (
          <div key={leg.hub} className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`relative z-10 h-3 w-3 rounded-full border-2 ${leg.tone === 'slate' ? 'border-slate-600 bg-slate-900' : 'border-primary bg-primary'}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{leg.hub}</span>
            </div>
            <PeekBadge tone={leg.tone}>{leg.status}</PeekBadge>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <PeekRow label="Cheapest" value="$3,980" valueClass="text-slate-300 text-[11px]" />
        <PeekRow label="Fastest" value="14 DAYS" valueClass="text-slate-300 text-[11px]" />
      </div>
    </BrowserFrame>
  );
}

const config: SolutionConfig = {
  audience: 'For Logistics & Carriers',
  problem: 'The shipment moves, but the money, documents, and customs status live somewhere else.',
  headline: (
    <>
      Move Freight.<br />
      <span className="text-primary">Synced To Money And Compliance.</span>
    </>
  ),
  subhead:
    'Baalvion plans multi-leg routes across a real carrier network, tracks every milestone live, and ties each leg to the payment, document, and customs events around it — so a delay updates the whole trade, not just a map pin.',
  primaryCta: { label: 'Request Logistics Access', href: PATHS.ACCESS_REQUEST },
  secondaryCta: { label: 'View Platform', href: PATHS.PLATFORM },
  peek: <RoutePeek />,
  proof: [
    { value: 'Multi-Leg', label: 'Route Optimization' },
    { value: '3-Way', label: 'Cheapest / Fastest / Balanced' },
    { value: 'Live', label: 'Milestone Tracking' },
    { value: 'Auto', label: 'Customs Orchestration' },
  ],
  capabilitiesTitle: 'A Control Tower That Knows The Whole Trade',
  capabilitiesLede:
    'Most tracking tools show you a dot on a map. Baalvion connects that dot to the order, the escrow, the documents, and the customs filing it belongs to.',
  capabilities: [
    { icon: Route, title: 'Optimize The Route', how: 'Bounded multi-leg search across a real lane network scores cheapest, fastest, and balanced plans — with synthetic fallbacks when a lane is missing.' },
    { icon: PackageSearch, title: 'Track Every Milestone', how: 'Live origin-to-destination visibility across carriers and transport modes, with port milestones surfaced as they happen.' },
    { icon: GitPullRequest, title: 'Automate The Paperwork', how: 'Digital Bills of Lading and carrier assignment flow through automated workflows wired into customs gateways.' },
    { icon: ShieldAlert, title: 'Get Ahead Of Delays', how: 'Predictive alerts flag corridor congestion and at-risk legs early, and escalate high-risk cargo before it becomes a problem.' },
  ],
  stepsTitle: 'Plan, Move, Reconcile',
  steps: [
    { title: 'Plan', desc: 'Request a route and compare cheapest, fastest, and balanced options across your carrier network.' },
    { title: 'Move', desc: 'Book the plan, generate the e-BoL, and track each leg live as milestones fire.' },
    { title: 'Reconcile', desc: 'Delivery updates the order, releases escrow, and closes the customs and document loop automatically.' },
  ],
  closingTitle: 'Connect Movement To Everything Else',
  closingDesc:
    'Bring your carrier network and tracking onto a platform where logistics, finance, and compliance move together.',
};

export function LogisticsClient() {
  return <SolutionPage config={config} />;
}
