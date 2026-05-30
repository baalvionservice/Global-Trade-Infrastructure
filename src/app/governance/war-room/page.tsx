'use client';

/**
 * @file src/app/governance/war-room/page.tsx
 * @description THE SUPREME CRISIS COMMAND CENTER.
 * High-intensity terminal for managing systemic failures, trade blocks, and adversarial disruption.
 * HARDENED: Integrated with Geopolitical Cognition and Active Defense Runtime.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { missionOrchestrator } from '@/modules/executive/services/mission-orchestrator.service';
import { geopoliticalCognition } from '@/services/intelligence/geopolitical-cognition';
import { activeDefense } from '@/modules/security/services/active-defense.service';
import { CrisisEvent } from '@/modules/executive/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Siren, 
  Loader2, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Lock, 
  Globe, 
  History, 
  Radio, 
  Terminal, 
  ArrowRight,
  Gavel,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Dna,
  Users,
  Compass,
  Crosshair,
  Scaling,
  RefreshCw,
  Search
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstitutionalWarRoom() {
  const [crises, setCrises] = useState<CrisisEvent[]>([]);
  const [threatLevel, setThreatLevel] = useState('EMERGENCY');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
       const cList = await missionOrchestrator.getActiveCrises();
       setCrises(cList);
       setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && crises.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-red-500 animate-pulse">ARMING CRISIS COMMAND HANDSHAKE...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6 selection:bg-red-600">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-red-500/20 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Crisis Node: COMMAND_BUNKER_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8] text-white">War Room.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-3xl leading-relaxed">
            "Authoritative command for systemic containment, adversarial neutralization, and operational state recovery."
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-4 px-8 py-4 bg-red-600 rounded-3xl border-2 border-red-500 font-black text-xs uppercase tracking-widest text-white shadow-lg animate-pulse">
              <Siren className="h-6 w-6" />
              SYSTEM_MODE: {threatLevel}
           </div>
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 rounded-2xl">
              <History className="mr-3 h-4 w-4" /> Replay Incident Chain
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
           {/* THREAT TOPOLOGY */}
           <Card className="shadow-none border-none bg-red-950/20 rounded-2xl overflow-hidden flex flex-col h-[550px] relative group border border-red-900/30">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, red 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Systemic Disruption Heatmap</CardTitle>
                    <CardDescription className="text-slate-500 font-medium italic">High-fidelity mapping of active adversarial signatures and corridor failures.</CardDescription>
                 </div>
                 <Radio className="h-8 w-8 text-red-500 animate-pulse" />
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center p-0 relative">
                 <div className="relative text-center space-y-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                       <Globe className="h-80 w-80 text-red-500 opacity-20" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Crosshair className="h-14 w-20 text-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-widest text-red-400">4 Active Incidents Staged</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Containment Protocol: AUTONOMOUS_ENFORCING</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* ACTIVE CRISIS LEDGER */}
           <AnimatePresence>
              {crises.map((crisis, i) => (
                <motion.div 
                  key={crisis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="shadow-lg border-none bg-red-600/10 rounded-2xl overflow-hidden ring-1 ring-red-600/30">
                     <CardContent className="p-0 flex flex-col md:flex-row">
                        <div className="md:w-4 bg-red-600 animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.6)]" />
                        <div className="flex-1 p-6 space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-6">
                                    <Badge className="bg-red-600 text-white text-[10px] font-black h-7 px-4 border-none shadow-xl tracking-wide uppercase">{crisis.severity}</Badge>
                                    <span className="text-[11px] font-mono text-slate-500 tracking-widest">INCIDENT_ID: {crisis.id}</span>
                                 </div>
                                 <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-[0.9]">{crisis.title}</h3>
                              </div>
                              <Radio className="h-8 w-8 text-red-500 animate-pulse" />
                           </div>

                           <p className="text-2xl font-bold italic leading-relaxed text-slate-300 border-l-4 border-red-600/40 pl-10 max-w-4xl">
                              "{crisis.message}"
                           </p>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {crisis.impactedClusters.map(node => (
                                 <div key={node} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 group/node hover:bg-white/10 transition-all">
                                    <Globe className="h-5 w-5 text-red-400 opacity-40 group-hover/node:rotate-90 transition-transform duration-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{node} Cluster</span>
                                    <Badge variant="outline" className="text-[8px] font-black text-red-400 border-red-400/30">ISOLATED</Badge>
                                 </div>
                              ))}
                           </div>

                           <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-white/5">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Containment State</p>
                                 <div className="flex items-center gap-6">
                                    <span className="text-2xl font-black text-red-400 uppercase tracking-tight">{crisis.status}</span>
                                    <div className="h-1.5 w-64 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                       <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <Button variant="ghost" className="h-12 px-6 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 rounded-3xl">
                                    ISOLATE SEGMENTS
                                 </Button>
                                 <Button className="h-12 px-16 bg-white text-red-600 font-black uppercase tracking-widest text-sm shadow-lg hover:scale-105 transition-all rounded-3xl">
                                    AUTHORIZE RECOVERY SAGA
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* SIDEBAR: CRISIS COMMAND */}
        <div className="lg:col-span-4 space-y-8">
           {/* INCIDENT COMMAND MATRIX */}
           <Card className="shadow-none border-2 border-white/5 bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-red-500">Incident Command Matrix</h4>
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Neutralization Velocity', val: '14ms', icon: Zap, color: 'text-red-500' },
                   { label: 'Operational Quarantine', val: 'Active', icon: Lock, color: 'text-blue-500' },
                   { label: 'Continuity Index', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black text-white tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl h-[380px]">
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Flame className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Zap className="h-6 w-6 text-white animate-pulse" />
                    Strategic Intervention Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Adversarial Alert: Systemic identity variance matching known 'Corridor Bypass' patterns detected. 14 node replicas are currently undergoing re-authentication."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-2xl hover:scale-[1.02] transition-transform">
                    ROTATE AUTHENTICATION KEYS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Compass className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-45" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Recovery Simulation Lab</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Launch high-fidelity 'What-If' scenarios for global trade war propagation or treasury shock interventions. All models are synchronized with the Digital Twin."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background" onClick={() => router.push(PATHS.GOVERNANCE_SIMULATION)}>OPEN SIMULATION DESK</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
