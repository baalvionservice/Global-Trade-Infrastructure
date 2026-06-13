"use client";
/**
 * @file enterprises-client.tsx
 * @description "For Enterprises" solution page — shows one trade running end to end
 * (RFQ → quote → deal → order → shipped → settled) as a peek, and explains how
 * Baalvion replaces a stack of disconnected tools with one source of truth.
 */

import { GanttChartSquare, Landmark, ShieldCheck, Truck, FileCheck2, Workflow } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { SolutionPage, BrowserFrame, PeekRow, PeekBadge, type SolutionConfig } from '../_components/solution/solution-page';

function LifecyclePeek() {
  const stages = ['RFQ', 'Quote', 'Deal', 'Order', 'Ship', 'Settle'];
  const activeIndex = 3;
  return (
    <BrowserFrame label="Trade Command · /trade-management">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Order #GTI-4471</p>
          <p className="text-lg font-black text-white">Arabica Green Coffee · 18 MT</p>
        </div>
        <PeekBadge tone="sky">In Transit</PeekBadge>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        {stages.map((s, i) => (
          <div key={s} className="flex-1 space-y-1.5">
            <div className={i <= activeIndex ? 'h-1.5 rounded-full bg-primary' : 'h-1.5 rounded-full bg-white/10'} />
            <p className={`text-[8px] font-black uppercase tracking-wider text-center ${i <= activeIndex ? 'text-primary' : 'text-slate-600'}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <PeekRow icon={Landmark} label="Payment · Escrow" value="$41,200 HELD" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={FileCheck2} label="Documents · 6 of 6" value="VERIFIED" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={ShieldCheck} label="Compliance Screen" value="CLEARED" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={Truck} label="ETA · Rotterdam" value="6 DAYS" valueClass="text-sky-400 text-[11px]" />
      </div>
    </BrowserFrame>
  );
}

const config: SolutionConfig = {
  audience: 'For Global Enterprises',
  problem: 'Your trade lives across email, ERP, a forwarder portal, the bank, and three spreadsheets.',
  headline: (
    <>
      Run A Trade End To End.<br />
      <span className="text-primary">On One Source Of Truth.</span>
    </>
  ),
  subhead:
    'From the first RFQ to final settlement, Baalvion keeps your orders, payments, documents, compliance, and shipments on one platform — so everyone sees the same status and nothing falls through the cracks.',
  primaryCta: { label: 'Request Enterprise Access', href: PATHS.ACCESS_REQUEST },
  secondaryCta: { label: 'See Pricing', href: PATHS.PRICING },
  peek: <LifecyclePeek />,
  proof: [
    { value: '1', label: 'Source Of Truth' },
    { value: '6→0', label: 'Disconnected Tools' },
    { value: 'Live', label: 'Shipment Visibility' },
    { value: 'Server-Side', label: 'Price & Tax Math' },
  ],
  capabilitiesTitle: 'One Platform, Every Step Of The Deal',
  capabilitiesLede:
    'Stop stitching together procurement, finance, compliance, and logistics tools. Baalvion runs the whole trade lifecycle with the handoffs already wired.',
  capabilities: [
    { icon: GanttChartSquare, title: 'Execute The Deal', how: 'RFQs, quotes, contracts, and orders in structured workflows — with documents generated and tracked automatically as you go.' },
    { icon: Landmark, title: 'Move The Money', how: 'Escrow-secured payments and server-computed totals (price + duty + tax + FX) mean the amount is always authoritative, not whatever the client sent.' },
    { icon: ShieldCheck, title: 'Stay Compliant', how: 'Counterparties and goods are screened in real time, and every order carries an audit-ready compliance and KYC trail.' },
    { icon: Truck, title: 'See The Shipment', how: 'Live milestone tracking from origin to destination, with predictive alerts when a leg is about to slip.' },
  ],
  stepsTitle: 'From Fragmentation To Flow',
  steps: [
    { title: 'Onboard', desc: 'Verify your organization once. Invite your team with the right roles and you are operational.' },
    { title: 'Transact', desc: 'Raise an RFQ, accept a quote, place the order. Payment, documents, and compliance attach automatically.' },
    { title: 'Track & Close', desc: 'Watch the shipment move in real time and let escrow release on delivery — settled, reconciled, done.' },
  ],
  closingTitle: 'Transform Your Trade Operations',
  closingDesc:
    'Bring procurement, finance, compliance, and logistics onto one governed platform built for cross-border trade.',
};

export function EnterprisesClient() {
  return <SolutionPage config={config} />;
}
