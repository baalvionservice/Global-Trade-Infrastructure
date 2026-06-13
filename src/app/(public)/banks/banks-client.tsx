"use client";
/**
 * @file banks-client.tsx
 * @description "For Banks" solution page — shows the escrow → ledger → settlement
 * money path as a live-looking peek, and explains in plain language how Baalvion
 * helps a bank settle trade flows without ripping out core systems.
 */

import { Landmark, ShieldCheck, GitBranch, ScrollText, Lock, ArrowDownUp } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { SolutionPage, BrowserFrame, PeekRow, PeekBadge, type SolutionConfig } from '../_components/solution/solution-page';

function BankingPeek() {
  return (
    <BrowserFrame label="Settlement Console · /escrow">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Escrow Vault</p>
          <p className="text-2xl font-black text-white tabular-nums">$1,917.50</p>
        </div>
        <PeekBadge tone="emerald">Funds Held</PeekBadge>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 pt-1">Double-Entry Ledger</p>
        <div className="rounded-2xl bg-slate-950 border border-white/5 divide-y divide-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[11px] font-bold text-slate-400">DR · Escrow Receivable</span>
            <span className="text-xs font-black tabular-nums text-sky-400">1,917.50</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[11px] font-bold text-slate-400">CR · Seller Payable</span>
            <span className="text-xs font-black tabular-nums text-emerald-400">1,917.50</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Balanced</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">0.00 drift</span>
          </div>
        </div>
      </div>

      <PeekRow icon={ArrowDownUp} label="Net Settlement · T+1" value="SCHEDULED" valueClass="text-amber-400 text-[11px]" />
      <PeekRow icon={ShieldCheck} label="Sanctions Screen" value="CLEARED" valueClass="text-emerald-400 text-[11px]" />
    </BrowserFrame>
  );
}

const config: SolutionConfig = {
  audience: 'For Banks & Financial Institutions',
  problem: 'Trade settlement still runs on spreadsheets, swift messages, and manual reconciliation.',
  headline: (
    <>
      Settle Trade Flows.<br />
      <span className="text-primary">Without The Reconciliation Nightmare.</span>
    </>
  ),
  subhead:
    'Baalvion gives your bank a real-time escrow, double-entry ledger, and net-settlement engine that plugs into your core banking and treasury systems over API — so money moves with an audit trail, not a fire drill.',
  primaryCta: { label: 'Request Bank Access', href: PATHS.ACCESS_REQUEST },
  secondaryCta: { label: 'View Architecture', href: PATHS.PLATFORM },
  peek: <BankingPeek />,
  proof: [
    { value: '0.00', label: 'Ledger Drift Tolerance' },
    { value: 'T+1', label: 'Net Settlement Cycle' },
    { value: 'RS256', label: 'Signed Money Movements' },
    { value: '100%', label: 'Audit-Trail Coverage' },
  ],
  capabilitiesTitle: 'What Your Bank Runs On Baalvion',
  capabilitiesLede:
    'Not another marketplace. The financial rails underneath trade — escrow, ledger, settlement, and screening — exposed as services your existing stack can call.',
  capabilities: [
    { icon: Lock, title: 'Conditional Escrow', how: 'Hold buyer funds against milestones and release only when delivery or compliance conditions are met — disputes pause the release, not the books.' },
    { icon: ScrollText, title: 'Double-Entry Ledger', how: 'Every movement posts balanced debit/credit entries with a transactional outbox, so your GL and ours never diverge.' },
    { icon: ArrowDownUp, title: 'Net Settlement', how: 'Intraday netting and T+0/T+1 scheme-file generation cut the number of cross-border transfers you actually have to make.' },
    { icon: ShieldCheck, title: 'Sanctions & AML', how: 'Counterparties are screened against OpenSanctions watchlists before money moves — fail-closed, with regulator-ready logs.' },
  ],
  stepsTitle: 'Integrate Without Replacing Your Core',
  steps: [
    { title: 'Connect', desc: 'Bind your core banking, treasury, or FX platform via signed API adapters. No rip-and-replace.' },
    { title: 'Orchestrate', desc: 'Baalvion holds escrow, posts the ledger, screens parties, and nets settlement as trades execute.' },
    { title: 'Reconcile', desc: 'A continuous reconciliation worker detects drift and backfills automatically — you keep authoritative control.' },
  ],
  closingTitle: 'Bank-Grade Rails For Global Trade',
  closingDesc:
    'Talk to our institutional team about connecting Baalvion to your settlement, escrow, and compliance stack.',
};

export function BanksClient() {
  return <SolutionPage config={config} />;
}
