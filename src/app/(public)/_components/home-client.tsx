"use client";
/**
 * @file home-client.tsx
 * @description Public home — the front door. Show, don't tell: a visitor should
 * understand in seconds what Baalvion is (the operating system for global trade),
 * see one trade running end to end, and route to the solution page for their world.
 * Shares the dark institutional language and peek primitives with the solution pages.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Landmark, Boxes, Globe, Truck, FileCheck2, Workflow,
  Link2, Fingerprint, Code2, ArrowDownUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PATHS } from '@/lib/paths';
import { BrowserFrame, PeekRow, PeekBadge } from './solution/solution-page';

const TICKER = [
  { label: 'Settlement Cycle', val: 'T+1' },
  { label: 'Ledger Drift', val: '0.00' },
  { label: 'Customs Gateways', val: '4' },
  { label: 'Screening', val: 'Fail-Closed' },
];

const AUDIENCES = [
  { title: 'Banks', desc: 'Escrow, ledger, and net settlement that plug into your core systems.', icon: Landmark, href: PATHS.SOLUTIONS_BANKS },
  { title: 'Enterprises', desc: 'Run a trade end to end on one source of truth.', icon: Boxes, href: PATHS.SOLUTIONS_ENTERPRISES },
  { title: 'Governments', desc: 'Real-time customs filing and sanctions screening.', icon: Globe, href: PATHS.SOLUTIONS_GOV },
  { title: 'Logistics', desc: 'Route optimization and live tracking, synced to the trade.', icon: Truck, href: PATHS.SOLUTIONS_LOGISTICS },
];

const STAGES = ['RFQ', 'Quote', 'Deal', 'Order', 'Ship', 'Settle'];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
} as const;

function TradePeek() {
  const active = 3;
  return (
    <BrowserFrame label="One Trade · End To End">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Order #GTI-4471</p>
          <p className="text-base font-black text-white">Arabica Green Coffee · 18 MT</p>
        </div>
        <PeekBadge tone="sky">In Transit</PeekBadge>
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        {STAGES.map((s, i) => (
          <div key={s} className="flex-1 space-y-1.5">
            <div className={i <= active ? 'h-1.5 rounded-full bg-primary' : 'h-1.5 rounded-full bg-white/10'} />
            <p className={`text-[8px] font-black uppercase tracking-wider text-center ${i <= active ? 'text-primary' : 'text-slate-600'}`}>{s}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-1">
        <PeekRow icon={ArrowDownUp} label="Payment · Escrow" value="$41,200 HELD" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={Globe} label="Customs · ICEGATE" value="CLEARED" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={FileCheck2} label="Documents · 6 of 6" value="VERIFIED" valueClass="text-emerald-400 text-[11px]" />
        <PeekRow icon={ShieldCheck} label="Sanctions Screen" value="NO MATCH" valueClass="text-emerald-400 text-[11px]" />
      </div>
    </BrowserFrame>
  );
}

export function HomeClient() {
  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 selection:bg-primary selection:text-white overflow-hidden">
      {/* LIVE KERNEL TICKER */}
      <div className="h-12 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 md:px-10 justify-between overflow-hidden shrink-0 z-40 sticky top-0">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 whitespace-nowrap">Platform: Operational</span>
          </div>
          {TICKER.map((s) => (
            <div key={s.label} className="flex items-center gap-2 whitespace-nowrap border-l border-white/5 pl-8 first:border-0 first:pl-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{s.label}:</span>
              <span className="text-[10px] font-black text-slate-200 tabular-nums">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="relative px-4 md:px-10 pt-20 pb-28 md:pt-28 md:pb-36 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,_var(--tw-gradient-stops))] from-primary/20 to-transparent opacity-60" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center relative z-10">
          <motion.div {...fadeUp} className="lg:col-span-6 space-y-8">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/40 bg-primary/10 text-primary font-black uppercase text-[9px] tracking-[0.4em] rounded-full">
              The Global Trade Operating System
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
              Sourcing To Settlement.<br /><span className="text-primary">On One Platform.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
              Baalvion runs the whole trade — RFQs, escrow-secured payments, customs, compliance, and logistics — on one governed platform that banks, enterprises, governments, and carriers share.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="h-14 px-9 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform group" asChild>
                <Link href={PATHS.ONBOARD}>Join Baalvion <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
              <Button variant="outline" className="h-14 px-9 border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10" asChild>
                <Link href={PATHS.PLATFORM}>View Platform</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="lg:col-span-6">
            <TradePeek />
          </motion.div>
        </div>
      </section>

      {/* AUDIENCE ROUTER */}
      <section className="px-4 md:px-10 py-28">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="max-w-2xl space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Built For Every Side Of The Trade</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">One Platform. Four Worlds.</h2>
            <p className="text-lg text-slate-400 leading-relaxed">The same trade looks different from each seat. Pick yours to see exactly how Baalvion helps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCES.map((a, i) => (
              <motion.div key={a.title} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <Link href={a.href} className="group block h-full">
                  <div className="h-full p-8 rounded-[28px] border border-white/5 bg-slate-900/40 hover:border-primary/40 hover:bg-slate-900/70 transition-all space-y-5">
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 w-fit group-hover:bg-primary/20 transition-colors">
                      <a.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">{a.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{a.desc}</p>
                    </div>
                    <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEROPERABILITY */}
      <section className="px-4 md:px-10 py-28 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="space-y-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Integrate, Don't Replace</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-[0.95]">Connects To What You Already Run.</h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Bind your core banking, ERP, TMS, or customs gateway through signed API adapters. Baalvion orchestrates the trade across them — you keep authoritative control of your own systems.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Signed API Adapters', icon: Fingerprint },
                { label: 'Event-Bus Sync', icon: Workflow },
                { label: 'Custom Connectors', icon: Link2 },
                { label: 'Developer API', icon: Code2 },
              ].map((f) => (
                <div key={f.label} className="p-5 rounded-2xl border border-white/5 bg-slate-950 flex items-center gap-3 group hover:border-primary/30 transition-all">
                  <f.icon className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <BrowserFrame label="Federation Node · api.baalvion.com">
              <PeekRow icon={Workflow} label="Core Banking" value="CONNECTED" valueClass="text-emerald-400 text-[11px]" />
              <PeekRow icon={Boxes} label="ERP / TMS" value="CONNECTED" valueClass="text-emerald-400 text-[11px]" />
              <PeekRow icon={Globe} label="Customs Gateway" value="CONNECTED" valueClass="text-emerald-400 text-[11px]" />
              <PeekRow icon={Fingerprint} label="Identity Signature" value="SHA-256 HMAC" valueClass="text-slate-300 text-[11px]" />
              <div className="pt-1">
                <PeekBadge tone="emerald">All adapters healthy</PeekBadge>
              </div>
            </BrowserFrame>
          </motion.div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-4 md:px-10 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">Run Your Trade On Baalvion</h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Verify your organization and start executing — or talk to our institutional team about connecting your systems.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="h-14 px-10 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200" asChild>
              <Link href={PATHS.ONBOARD}>Join Baalvion</Link>
            </Button>
            <Button variant="outline" className="h-14 px-10 border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/5" asChild>
              <Link href={PATHS.ACCESS_REQUEST}>Request Institutional Access</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
