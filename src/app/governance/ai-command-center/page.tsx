/**
 * @file ai-command-center/page.tsx
 * @description THE SUPREME AI CIVILIZATION OBSERVATORY.
 * High-authority command for managing agentic autonomy and strategic foresight.
 */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BrainCircuit, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Dna, 
  Loader2, 
  History,
  Lock,
  ArrowRight,
  Database,
  Radio,
  Cpu,
  Workflow,
  Sparkles,
  Fingerprint,
  Scaling,
  Globe
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function AICommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching live cognitive state
    setTimeout(() => {
      setActiveMissions([
        { id: 'MSN-8821', title: 'APAC Corridor Rebalance', status: 'EXECUTING', confidence: 99, progress: 84, agent: 'Coordinator Prime' },
        { id: 'MSN-8822', title: 'Identity Drift Mitigation', status: 'VALIDATING', confidence: 100, progress: 12, agent: 'Compliance Guard' },
        { id: 'MSN-8823', title: 'Treasury Swap Optimization', status: 'STAGED', confidence: 94, progress: 100, agent: 'Treasury Oracle' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Cognitive Singularity...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign Decision Node: CIVILIZATION_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Cognition Hub.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-3xl leading-relaxed">
            "Authoritative planetary oversight of multi-agent reasoning civilizations and autonomous operational finality."
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 rounded-2xl">
              <Database className="mr-3 h-4 w-4" /> Replay Reasoning Logs
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Sparkles className="mr-3 h-5 w-5 fill-current" /> Calibrate Logic Fabric
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
           {/* AGENT FLEET MONITOR */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Coordinator Prime', role: 'ORCHESTRATOR', status: 'ACTIVE', score: 998 },
                { name: 'Treasury Oracle', role: 'FINANCIAL', status: 'ACTIVE', score: 994 },
                { name: 'Logistics Sentinel', role: 'OPERATIONAL', status: 'THINKING', score: 882 }
              ].map((agent, i) => (
                <motion.div key={agent.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                   <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl p-6 space-y-8 group hover:bg-white/5 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Cpu className="h-32 w-32" /></div>
                      <div className="flex items-center justify-between relative z-10">
                         <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 shadow-inner group-hover:bg-primary/20 transition-all">
                            <BrainCircuit className="h-8 w-8 text-primary" />
                         </div>
                         <Badge className={cn(
                           "text-[10px] font-black uppercase h-7 px-4 rounded-full border-none shadow-xl",
                           agent.status === 'THINKING' ? "bg-blue-600 animate-pulse" : "bg-primary"
                         )}>{agent.status}</Badge>
                      </div>
                      <div className="space-y-3 relative z-10">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{agent.role}</p>
                         <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">{agent.name}</h3>
                      </div>
                      <div className="space-y-4 pt-4 relative z-10 border-t border-white/5">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                            <span>Intelligence Maturity</span>
                            <span className="text-white">{Math.round(agent.score / 10)}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${agent.score / 10}%` }} />
                         </div>
                      </div>
                   </Card>
                </motion.div>
              ))}
           </div>

           {/* ACTIVE MISSION MANDATES */}
           <Card className="shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Autonomous Mission Ledger</CardTitle>
                  <CardDescription className="text-slate-500 font-medium mt-1">Real-time trace of civilization-scale operational coordination.</CardDescription>
                </div>
                <Workflow className="h-10 w-10 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-white/5">
                    {activeMissions.map((mission, i) => (
                       <div key={mission.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                             <div className="h-24 w-24 rounded-2xl border-2 border-white/5 bg-slate-950 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                <Zap className="h-10 w-10 text-primary opacity-60" />
                             </div>
                             <div className="space-y-4 flex-1 min-w-0">
                                <div className="flex items-center gap-6">
                                   <Badge className="bg-primary text-white text-[10px] font-black h-7 px-4 border-none shadow-xl tracking-widest">{mission.status}</Badge>
                                   <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest opacity-40">ID: {mission.id}</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-[1.1] truncate">{mission.title}</h4>
                                <div className="space-y-2">
                                   <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                                      <span>Execution Progress</span>
                                      <span className="text-emerald-400">{mission.progress}%</span>
                                   </div>
                                   <Progress value={mission.progress} className="h-1.5 bg-white/5" />
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-6 shrink-0 border-l border-white/5 pl-12 ml-10">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black uppercase text-slate-600 leading-none">Logic Conf.</p>
                                <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{mission.confidence}%</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border border-white/10 bg-white/5 opacity-20 group-hover:opacity-100 transition-all">
                                <ArrowRight className="h-6 w-6 text-white" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: COGNITIVE OVERSIGHT */}
        <div className="lg:col-span-4 space-y-8">
           {/* REASONING SYMMETRY */}
           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl h-[380px]">
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Radio className="h-6 w-6 text-white animate-pulse" />
                    Cognitive Symmetry Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Platform Singularity: Multi-agent reasoning state is maintained at Tier-1 threshold. Logic drift index: 0.002%."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Inference Velocity</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">142ms</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Consensus</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">100%</span>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* SYSTEMIC GOVERNANCE MONITOR */}
           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">AI Health Matrix</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Reasoning Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Artifact Depth', val: '4.2k Petabytes', icon: Database, color: 'text-indigo-500' },
                   { label: 'Policy Sync', val: 'Locked', icon: Lock, color: 'text-blue-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-8">
                         <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      </div>
                      <span className="text-3xl font-black tracking-tighter text-white tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/30 p-16 text-center space-y-6 rounded-2xl border-dashed border-white/5">
              <Scaling className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:scale-110" />
              <div className="space-y-4">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">Civilization Evolution</p>
                 <p className="text-xs font-medium italic leading-relaxed px-8 opacity-40 text-slate-500">
                    "Baalvion intelligence is architected as an autonomous operating civilization. Post-platform evolution is scheduled following 365d stability verification."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-14 border-white/10 font-black uppercase text-[10px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">RECONSTRUCT GLOBAL KNOWLEDGE</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
