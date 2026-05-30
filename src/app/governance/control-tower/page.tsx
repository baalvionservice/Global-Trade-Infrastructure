"use client";

/**
 * @file control-tower/page.tsx
 * @description THE GLOBAL TRADE SINGULARITY OBSERVATORY. 
 * High-authority command for planetary orchestration and institutional finality.
 */
import { useEffect, useState } from 'react';
import { adminService, HeatmapData, PlatformStats } from '@/services/admin-service';
import { eventStore } from '@/lib/governance-events';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  BrainCircuit, 
  Database,
  Lock,
  ArrowUpRight,
  Workflow,
  Search,
  Command,
  Radio,
  History,
  Fingerprint,
  Cpu,
  Scaling,
  Dna
} from 'lucide-react';
import { cn, formatNumber, formatCurrency, getFlag } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';

export default function GlobalSingularityObservatory() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [sData] = await Promise.all([
        adminService.getPlatformOverview()
      ]);
      setStats(sData);
      setRecentEvents(eventStore.getAllEvents().slice(0, 15));
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Singularity Link...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign Data Fabric v4.2</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8] text-white">Data Singularity.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of trade finality, multi-tenant orchestration, and systemic economic equilibrium."
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 font-black uppercase text-xs tracking-widest hover:bg-white/10 rounded-2xl">
              <Search className="mr-3 h-4 w-4" /> Resolve Entity Hash
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs" asChild>
              <Link href={PATHS.GOVERNANCE_STABILIZATION}>
                 <Lock className="mr-3 h-5 w-5 fill-current" /> Seal Ledger
              </Link>
           </Button>
        </div>
      </div>

      {/* STRATEGIC KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Decision Finality', val: '450ms', sub: 'Single Kernel Speed', icon: Database, color: 'text-blue-500' },
          { label: 'Ledger Symmetry', val: '100%', sub: 'Equilibrium Index', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Ingestion Delay', val: '14ms', sub: 'Real-time Signal Sync', icon: Activity, color: 'text-orange-500' },
          { label: 'Fabric Integrity', val: 'Tier 1', sub: 'Verified Provenance', icon: BrainCircuit, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10 p-8">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wide">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter text-slate-100 tabular-nums">{kpi.val}</div>
                  <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-widest italic">{kpi.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* EVENT REPLAY / LEDGER STREAM */}
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[700px] relative group">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Institutional Event Ledger</CardTitle>
                 <CardDescription className="text-slate-400 font-medium italic">Immutable append-only trace of global institutional state mutations.</CardDescription>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="border-white/10 text-white font-black text-[10px] uppercase h-10 px-6 rounded-xl hover:bg-white/5">
                    <History className="mr-2 h-3.5 w-3.5" /> REPLAY HISTORY
                 </Button>
              </div>
           </CardHeader>
           <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar z-10 font-mono text-[11px] leading-relaxed">
              <div className="divide-y divide-white/5">
                 <AnimatePresence initial={false}>
                    {recentEvents.map((event, i) => (
                       <motion.div 
                         key={event.eventId} 
                         initial={{ opacity: 0, x: -10 }} 
                         animate={{ opacity: 1, x: 0 }} 
                         className="p-8 flex items-center justify-between group hover:bg-white/5 transition-all"
                       >
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                             <div className="text-slate-600 w-24 shrink-0">{new Date(event.timestamp).toLocaleTimeString()}.{new Date(event.timestamp).getMilliseconds()}</div>
                             <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-4">
                                   <Badge className="bg-primary text-white text-[8px] font-black h-5 border-none shadow-lg tracking-widest">{event.aggregateType}</Badge>
                                   <span className="text-emerald-400 font-black">ACTION::{event.eventType}</span>
                                </div>
                                <div className="text-slate-400 truncate italic text-[10px]">"ID: {event.aggregateId} • Tenant: {event.metadata.tenantId} • Signed by: {event.metadata.actorId}"</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-6 shrink-0 border-l border-white/5 pl-10 ml-6">
                             <div className="text-right space-y-0.5">
                                <p className="text-[9px] font-black uppercase text-slate-600 leading-none">VERSION</p>
                                <p className="text-sm font-black text-slate-100">v{event.version}</p>
                             </div>
                             <div className="p-2 rounded-lg bg-emerald-500/10"><ShieldCheck className="h-4 w-4 text-emerald-400" /></div>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </CardContent>
        </Card>

        {/* SIDEBAR: DATA GOVERNANCE */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl h-[350px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Radio className="h-6 w-6 text-white animate-pulse" />
                    Data Governance Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Fabric Insight: Distributed state symmetry is maintained at Tier-1 threshold. 14 node replicas are perfectly synchronized with the global kernel."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-SCAN FABRIC INTEGRITY
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Ecosystem finality</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Replication Lag', val: '14ms', icon: RefreshCw, color: 'text-emerald-500' },
                   { label: 'Symmetry Index', val: '100%', icon: ShieldCheck, color: 'text-blue-500' },
                   { label: 'Auth Handshakes', val: '4.2k/s', icon: Lock, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-white tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-8 rounded-2xl border-dashed border-white/5">
              <Scaling className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:scale-110" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">Lakehouse Topology</p>
                 <p className="text-xs font-medium italic leading-relaxed px-6 opacity-40 text-slate-500">
                    "Baalvion operates on a unified Lakehouse architecture, fusing real-time event streaming with high-scale analytical finality for institutional BI."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800">LAUNCH ANALYTICS WAREHOUSE</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
