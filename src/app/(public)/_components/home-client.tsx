"use client";
/**
 * @file home-client.tsx
 * @description THE AUTHORITATIVE INSTITUTIONAL GATEWAY.
 * HARDENED: Resolved icon imports and ensured successful hydration.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { 
  Globe, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Cpu,
  BarChart3,
  Database,
  Landmark,
  Lock,
  Workflow,
  Link2,
  Code2,
  Fingerprint
} from "lucide-react";
import { PATHS } from '@/lib/paths';
import { motion } from 'framer-motion';
import { cn, formatNumber } from '@/lib/utils';

export function HomeClient() {
  const stats = [
    { label: 'Settlement Volume', val: 1240000000000, icon: BarChart3, color: 'text-emerald-500' },
    { label: 'Active Nodes', val: '14,240', icon: Cpu, color: 'text-blue-500' },
    { label: 'Compliance Rate', val: '99.98%', icon: ShieldCheck, color: 'text-indigo-500' },
    { label: 'Ledger Latency', val: '140ms', icon: Activity, color: 'text-orange-500' },
  ];

  const ecosystems = [
    { 
      title: 'Trade Execution', 
      desc: 'Sovereign-grade procurement workflows for contracts, RFQs, and bulk auctions.',
      icon: Database,
      items: ['Smart RFQ Engine', 'Reverse Auctions', 'Immutable Contracts']
    },
    { 
      title: 'Finance & Settlement', 
      desc: 'Multi-currency liquidity vaults with automated escrow and FX-lock finality.',
      icon: Landmark,
      items: ['Escrow Registry', 'Trade Finance', 'FX Optimization']
    },
    { 
      title: 'Regulatory Compliance', 
      desc: 'Real-time sanctions screening, KYC resolution, and jurisdictional law enforcement.',
      icon: ShieldCheck,
      items: ['Sanctions Shield', 'Audit Ledger', 'Policy Runtime']
    },
    { 
      title: 'Logistics Intelligence', 
      desc: 'End-to-end corridor telemetry, port milestones, and predictive transit delay alerts.',
      icon: Globe,
      items: ['IoT Telemetry', 'Port Discovery', 'Delay Forecasting']
    }
  ];

  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 selection:bg-primary selection:text-white overflow-hidden">
      <div className="h-12 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 md:px-10 justify-between overflow-hidden shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 whitespace-nowrap">Core Kernel: ACTIVE</span>
           </div>
           {stats.map(s => (
             <div key={s.label} className="flex items-center gap-2 whitespace-nowrap border-l border-white/5 pl-8 first:border-0 first:pl-0">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{s.label}:</span>
                <span className="text-[10px] font-black text-slate-200 tabular-nums">
                  {formatNumber(s.val)}
                </span>
             </div>
           ))}
        </div>
        <div className="hidden lg:flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
           <span className="text-primary font-bold">SOVEREIGN_NODE_STABLE</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col">
        <section className="relative px-4 md:px-10 pt-24 pb-32 md:pt-40 md:pb-48 overflow-hidden border-b border-white/5">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-primary/20 to-transparent opacity-60" />
           <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 relative z-10">
              <div className="lg:col-span-7 space-y-12">
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <Badge variant="outline" className="px-5 py-2 border-primary/40 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-[0.5em] rounded-full shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                      Institutional Layer v4.2 Stable
                    </Badge>
                    <h1 className="text-6xl md:text-[120px] font-black uppercase tracking-tighter leading-[0.85] text-white">
                      Physical <br />Movement. <br /><span className="text-primary">Digital Finality.</span>
                    </h1>
                 </motion.div>
                 
                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-slate-300 font-medium italic leading-relaxed max-w-2xl border-l-4 border-primary/30 pl-10">
                   "Baalvion is the authoritative digital infrastructure for the $33T global trade economy, enabling institutions to execute with absolute trust."
                 </motion.p>
                 
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-5">
                    <Button className="h-16 px-12 bg-primary text-white font-black uppercase tracking-widest text-sm shadow-3xl hover:scale-105 transition-all group rounded-2xl" asChild>
                       <Link href={PATHS.ACCESS_REQUEST}>
                          ONBOARD INSTITUTION <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </Button>
                    <Button variant="outline" className="h-16 px-12 border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 rounded-2xl transition-all" asChild>
                       <Link href={PATHS.PLATFORM}>VIEW ARCHITECTURE</Link>
                    </Button>
                 </motion.div>
              </div>

              <div className="lg:col-span-5">
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="p-1 border border-white/5 bg-slate-900/40 rounded-[48px] shadow-3xl backdrop-blur-2xl">
                    <div className="p-10 space-y-12">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Strategic Perspectives</p>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Login to Operational Nodes</h3>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          {[
                            { role: 'Buyer', icon: Users, path: PATHS.BUYER_DASHBOARD, color: 'text-blue-500' },
                            { role: 'Seller', icon: Landmark, path: PATHS.SELLER_DASHBOARD, color: 'text-emerald-500' },
                            { role: 'Admin', icon: ShieldCheck, path: PATHS.OVERSIGHT_PLATFORM_ADMIN, color: 'text-orange-500' },
                            { role: 'Treasury', icon: Landmark, path: PATHS.FINANCE_SETTLEMENT, color: 'text-indigo-500' }
                          ].map((perspective) => (
                             <Link key={perspective.role} href={perspective.path} className="group">
                                <div className="p-8 rounded-[32px] border border-white/5 bg-slate-950 flex flex-col items-center gap-5 transition-all group-hover:bg-white/5 group-hover:border-primary/40 h-full shadow-lg">
                                   <div className={cn("p-4 rounded-2xl bg-white/5 transition-colors group-hover:bg-white/10", perspective.color)}>
                                      <perspective.icon className="h-6 w-6" />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white text-center leading-none">{perspective.role} Node</span>
                                </div>
                             </Link>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        <section className="py-40 px-4 md:px-10 bg-slate-900/20">
           <div className="max-w-7xl mx-auto space-y-24">
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Ecosystem Foundations</p>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">Unified Infrastructure.</h2>
                 <p className="text-lg text-slate-400 font-medium italic">Baalvion dissolves the barriers between fragmented trade systems into a single institutional layer.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {ecosystems.map((eco, i) => (
                    <motion.div key={eco.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                       <Card className="h-full bg-slate-950 border-white/5 rounded-[40px] overflow-hidden group hover:border-primary/40 transition-all shadow-2xl">
                          <CardContent className="p-10 space-y-8 flex flex-col h-full">
                             <div className="p-5 rounded-[24px] bg-white/5 w-fit group-hover:bg-primary/20 transition-all border border-white/5">
                                <eco.icon className="h-7 w-7 text-primary" />
                             </div>
                             <div className="space-y-3">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{eco.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium italic">"{eco.desc}"</p>
                             </div>
                             <div className="space-y-3 pt-4 mt-auto">
                                {eco.items.map(item => (
                                   <div key={item} className="flex items-center gap-3">
                                      <div className="h-1 w-1 rounded-full bg-primary" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item}</span>
                                   </div>
                                ))}
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        <section className="py-40 px-4 md:px-10 border-t border-white/5">
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Interoperability Hub</p>
                    <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">Plug-and-Play <br />Institutional Sync.</h2>
                 </div>
                 <p className="text-xl text-slate-400 font-medium italic leading-relaxed">
                   Connect your core banking, ERP, or TMS infrastructure via secure, cryptographically verified adapters.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Event-Bus Sync', icon: Workflow },
                      { label: 'Custom Adapters', icon: Link2 },
                      { label: 'Identity Signatures', icon: Fingerprint },
                      { label: 'API Orchestration', icon: Code2 }
                    ].map(feat => (
                       <div key={feat.label} className="p-6 border border-white/5 bg-slate-950 flex items-center gap-4 group hover:bg-primary/5 transition-all">
                          <feat.icon className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{feat.label}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-[64px] blur-[120px] animate-pulse" />
                 <Card className="bg-slate-900/50 border-white/10 rounded-[64px] shadow-3xl backdrop-blur-xl relative z-10 overflow-hidden">
                    <CardHeader className="p-12 border-b border-white/5 bg-white/5">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-3 w-3 rounded-full bg-red-500/50" />
                             <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                             <div className="h-3 w-3 rounded-full bg-green-500/50" />
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-500 border-white/10">v1.4.2_FEDERATION_NODE</Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="p-12 space-y-8">
                       <div className="space-y-6">
                          <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-950 border border-white/5">
                             <div className="p-3 rounded-2xl bg-white/5"><Database className="h-6 w-6 text-primary" /></div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase">System Endpoint</p>
                                <p className="text-sm font-mono text-emerald-400">api.baalvion.com/v1/fed/sync</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-950 border border-white/5">
                             <div className="p-3 rounded-2xl bg-white/5"><Lock className="h-6 w-6 text-indigo-400" /></div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase">Auth Signature</p>
                                <p className="text-sm font-mono text-slate-400 truncate">sha256_0x88fA992d99c42...</p>
                             </div>
                          </div>
                       </div>
                       <Button className="w-full h-16 bg-white text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl" asChild>
                          <Link href={PATHS.ACCESS_REQUEST}>GENERATE ACCESS TOKEN</Link>
                       </Button>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}