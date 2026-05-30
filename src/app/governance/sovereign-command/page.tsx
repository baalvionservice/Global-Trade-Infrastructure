/**
 * @file sovereign-command/page.tsx
 * @description THE SUPREME PLATFORM OBSERVATORY.
 * High-authority command console for Sovereign Platform Governance and Planetary Orchestration.
 */
'use client';

import { useEffect, useState } from 'react';
import { platformGovernance } from '@/modules/platform/services/platform-governance.service';
import { SovereignTenant, PlatformHealthMetric, GlobalRiskSignal } from '@/modules/platform/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  TrendingUp,
  BrainCircuit,
  Database,
  Lock,
  ArrowUpRight,
  Maximize,
  Workflow,
  Search,
  Command,
  Radio,
  Siren,
  History,
  Fingerprint,
  Cpu,
  Scaling,
  Dna,
  HardDrive
} from 'lucide-react';
import { cn, formatNumber, formatCurrency, getFlag } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function SovereignCommandCenterPage() {
  const [pulse, setPulse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const data = await platformGovernance.getSovereignPulse();
    setPulse(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !pulse) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Sovereign Link...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen selection:bg-primary">
      {/* SOVEREIGN HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: SOVEREIGN_KERNEL_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Global <br />Command.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of institutional trade finality, multi-tenant boundaries, and systemic economic equilibrium."
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-400 shadow-md animate-in zoom-in duration-500">
              <ShieldCheck className="h-5 w-5" />
              Integrity Level: SUPREME
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Siren className="mr-3 h-5 w-5" /> Emergency Operations
           </Button>
        </div>
      </div>

      {/* STRATEGIC KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pulse.systemMetrics.map((kpi: PlatformHealthMetric, i: number) => (
          <motion.div key={kpi.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10 p-8">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wide">{kpi.label}</CardTitle>
                  <div className={cn(
                    "p-2 rounded-lg",
                    kpi.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                  )}>
                    <Activity className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter text-white tabular-nums">
                    {kpi.value}{kpi.unit}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                     <span className={cn(
                       "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                       kpi.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                     )}>{kpi.trend === 'up' ? '↑' : '→'} {kpi.trend.toUpperCase()}</span>
                  </div>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* GLOBAL TENANT FABRIC */}
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[700px] relative">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black uppercase tracking-tighter">Planetary Tenant Mesh</CardTitle>
                 <CardDescription className="text-slate-400 font-medium italic">High-fidelity oversight of institutional cluster boundaries and cross-tenant trade velocity.</CardDescription>
              </div>
              <Globe className="h-10 w-10 text-primary opacity-20 group-hover:rotate-45 transition-transform duration-1000" />
           </CardHeader>
           <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar z-10">
              <div className="divide-y divide-white/5">
                 {pulse.tenants.map((tenant: SovereignTenant) => (
                    <div key={tenant.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-16 rounded-2xl border-2 border-white/10 bg-slate-950 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                             <Server className="h-7 w-7 text-primary opacity-60" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{tenant.name}</h3>
                                <Badge className="bg-primary text-white text-[8px] font-black h-5 px-2 border-none shadow-lg tracking-widest">{tenant.isolationState}</Badge>
                             </div>
                             <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
                                <span>ID: {tenant.id}</span>
                                <span>•</span>
                                <span>Region: {tenant.region} Node</span>
                                <span>•</span>
                                <span>Residency: {tenant.dataResidency}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right space-y-1">
                             <p className="text-[9px] font-black uppercase text-slate-600 leading-none">Sync Integrity</p>
                             <p className="text-2xl font-black text-emerald-400 tabular-nums tracking-tighter">{tenant.uptime}%</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                             <ArrowUpRight className="h-6 w-6 text-white" />
                          </Button>
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* SIDEBAR: SYSTEMIC RISK & EMERGENCY */}
        <div className="lg:col-span-4 space-y-6">
           {/* GLOBAL RISK SENTINEL */}
           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Radio className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Strategic Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <div className="space-y-6">
                    {pulse.signals.map((sig: GlobalRiskSignal) => (
                       <div key={sig.id} className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-4">
                          <div className="flex items-center justify-between">
                             <Badge className={cn(
                                "text-[8px] font-black uppercase border-none px-2 h-5 shadow-lg",
                                sig.severity === 'critical' ? 'bg-red-600' : 'bg-orange-600'
                             )}>{sig.severity} Alert</Badge>
                             <span className="text-[9px] font-black uppercase opacity-40 text-white tracking-widest">{sig.category}</span>
                          </div>
                          <p className="text-sm font-bold italic leading-relaxed text-white">"{sig.message}"</p>
                          <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                             <span>Nodes: {sig.impactNodes.join(', ')}</span>
                             <span>Conf: {Math.round(sig.confidence * 100)}%</span>
                          </div>
                       </div>
                    ))}
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-CALIBRATE MESH WEIGHTS
                 </Button>
              </CardContent>
           </Card>

           {/* SOVEREIGN INFRA KPIS */}
           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Core Performance</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Network Throughput', val: '12.4k ops/s', icon: Scaling, color: 'text-blue-500' },
                   { label: 'Ledger Symmetry', val: '100%', icon: Database, color: 'text-emerald-500' },
                   { label: 'Oracle Sync', val: 'Locked', icon: Cpu, color: 'text-indigo-500' }
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

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-6 rounded-2xl border-dashed border-white/5 group hover:border-primary/20 transition-all duration-700">
              <Dna className="h-14 w-14 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:rotate-45" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-slate-300">Self-Healing Registry</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-4">
                    "Baalvion nodes automatically re-synchronize state from the immutable ledger upon detecting structural drift. Zero data-loss verified."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">RECONSTRUCT STATE FROM REPLICA</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}