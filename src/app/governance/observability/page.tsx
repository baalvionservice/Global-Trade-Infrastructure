/**
 * @file observability/page.tsx
 * @description THE STRATEGIC OBSERVABILITY COMMAND CENTER.
 * High-authority strategic command for planetary telemetry and platform diagnostics.
 */
'use client';

import { useEffect, useState } from 'react';
import { telemetryService } from '@/modules/observability/services/telemetry.service';
import { tracingService } from '@/modules/observability/services/tracing.service';
import { useObservabilityStore } from '@/modules/observability/store/observability.store';
import { HealthScorecard } from '@/modules/observability/components/health-scorecard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Loader2, 
  ArrowRight, 
  History, 
  ChevronLeft,
  Server,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  Terminal,
  Radio,
  Search,
  Fingerprint,
  Workflow,
  Dna,
  Scaling,
  Siren
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { format } from 'date-fns';

export default function ObservabilityCommandCenter() {
  const { 
    healthScore, 
    overallStatus, 
    liveSignals, 
    updateSignals, 
    isStreaming, 
    toggleStreaming 
  } = (useObservabilityStore as any)();
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const signals = await telemetryService.getLiveSignals();
    updateSignals(signals);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (isStreaming) fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  if (loading && liveSignals.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Telemetry Link...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen selection:bg-primary">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: OBS_COMMAND_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Observability.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of distributed execution finality, institutional telemetry, and systemic diagnostics."
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" className="h-12 px-8 border-white/10 bg-white/5 font-black uppercase text-xs tracking-widest group" onClick={() => toggleStreaming(!isStreaming)}>
              {isStreaming ? <Radio className="mr-3 h-4 w-4 text-emerald-400 animate-pulse" /> : <RefreshCw className="mr-3 h-4 w-4" />}
              {isStreaming ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}
           </Button>
           <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-400 shadow-md">
              <ShieldCheck className="h-5 w-5" />
              Integrity Level: SOVEREIGN
           </div>
        </div>
      </div>

      {/* HEALTH PULSE GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <HealthScorecard score={99.8} status="OPTIMAL" label="Ecosystem Coherence" />
        <HealthScorecard score={94.2} status="STABILIZING" label="Node Finality" />
        <HealthScorecard score={100} status="OPTIMAL" label="Ledger Symmetry" />
        <HealthScorecard score={98.5} status="OPTIMAL" label="Throughput Weight" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LIVE TELEMETRY STREAM */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[650px] relative group">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Planetary Signal Feed</CardTitle>
                  <CardDescription className="text-slate-400 font-medium">Real-time telemetry from distributed execution clusters and jurisdictional gateways.</CardDescription>
                </div>
                <Activity className="h-8 w-8 text-primary opacity-20 group-hover:scale-110 transition-transform duration-1000" />
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar bg-slate-950/20 z-10">
                 <div className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                       {liveSignals.map((sig: any, i: number) => (
                          <motion.div 
                            key={sig.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6 flex items-center justify-between group/row hover:bg-white/[0.02] transition-colors border-b border-white/5"
                          >
                             <div className="flex items-center gap-8 flex-1 min-w-0">
                                <div className="h-12 w-16 rounded-2xl border-2 border-white/10 bg-slate-950 flex items-center justify-center shadow-inner group-hover/row:scale-105 transition-transform">
                                   <Cpu className="h-7 w-7 text-primary opacity-60" />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                   <div className="flex items-center gap-4">
                                      <Badge className="bg-primary text-white text-[9px] font-black uppercase h-5 px-2 border-none shadow-sm">{sig.category}</Badge>
                                      <span className="text-[10px] font-mono text-slate-600 tracking-widest">SIGNAL_ID: {sig.id}</span>
                                   </div>
                                   <h4 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">{sig.metric}</h4>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Source Node: {sig.nodeId} • {format(new Date(sig.timestamp), "HH:mm:ss.SSS")}</p>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-3 shrink-0 border-l border-white/5 pl-12 ml-8">
                                <div className="text-right">
                                   <p className="text-[9px] font-black uppercase text-slate-600 leading-none">Measurement</p>
                                   <p className="text-4xl font-black text-primary tabular-nums tracking-tighter">{sig.value}{sig.unit}</p>
                                </div>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black h-5 uppercase px-2 rounded-full">Optimal</Badge>
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: SYSTEMIC INSIGHTS */}
        <div className="lg:col-span-4 space-y-6">
           {/* DIAGNOSTICS ORACLE */}
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl h-[380px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Fingerprint className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Diagnostics Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Platform Pulse: Inter-node consensus has achieved Level 4 finality. No structural drift detected across the Swiss and Singapore clusters. System is stabilized."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Latency P99</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">124ms</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Consensus</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">SECURE</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    LAUNCH FORENSIC REPLAY
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Domain Availability</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Treasury Node', status: 'Optimal', icon: Landmark, color: 'text-emerald-500' },
                   { label: 'Logistics Fabric', status: 'Stable', icon: Globe, color: 'text-blue-500' },
                   { label: 'Identity Mesh', status: 'Locked', icon: Fingerprint, color: 'text-indigo-500' }
                 ].map(domain => (
                   <div key={domain.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <domain.icon className={cn("h-6 w-6", domain.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{domain.label}</span>
                      </div>
                      <Badge className="bg-emerald-500 text-emerald-950 text-[8px] font-black px-2 uppercase h-5 border-none rounded-full">{domain.status}</Badge>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-6 rounded-2xl border-dashed border-white/5 group hover:border-primary/20 transition-all duration-700">
              <History className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:rotate-[-45deg]" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">Self-Healing Registry</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-40 text-slate-500">
                    "Baalvion nodes automatically re-synchronize state from the immutable ledger upon detecting architectural drift. Zero data-loss verified."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">AUDIT RECOVERY LOG</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}

function Landmark(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/></svg>
}
