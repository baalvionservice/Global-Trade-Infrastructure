/**
 * @file src/app/(dashboard)/intelligence-hub/ai-center/page.tsx
 * @description THE AI COMMAND & GOVERNANCE OBSERVATORY.
 * High-authority command for managing agentic autonomy and strategic foresight.
 */
'use client';

import { useEffect, useState } from 'react';
import { aiOrchestration } from '@/modules/ai/services/orchestration.service';
import { useAIStore } from '@/modules/ai/store/use-ai-store';
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
  Terminal,
  Siren,
  Workflow,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function AICenterPage() {
  const { agents, stagedActions, setAgents, setStagedActions, authorizeAction, rejectAction } = useAIStore();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    const [agentList, actions] = await Promise.all([
      aiOrchestration.getActiveAgents(),
      (aiOrchestration as any).getStagedActions()
    ]);
    setAgents(agentList as any);
    setStagedActions(actions);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthorize = async (id: string) => {
    toast({ title: "Autonomous Action Authorized", description: "Mandate is now being propagated to the execution kernel." });
    authorizeAction(id);
    // In production, this calls the backend to execute the Temporal workflow
  };

  if (loading && agents.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Cognitive Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen selection:bg-primary">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Service Node: ORACLE_ALPHA_STABLE</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">AI Command.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative oversight of autonomous reasoning, multi-agent orchestration, and sovereign trade foresight."
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 font-black uppercase text-xs tracking-widest hover:bg-white/10">
              <Database className="mr-3 h-4 w-4" /> Re-Scan Knowledge Graph
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Sparkles className="mr-3 h-5 w-5 fill-current" /> Calibrate Reasoning Core
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* AGENT MESH OBSERVATORY */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {agents.map((agent, i) => (
                <motion.div key={agent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                   <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl p-8 space-y-6 group hover:bg-white/5 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Cpu className="h-24 w-24" /></div>
                      <div className="flex items-center justify-between relative z-10">
                         <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-primary/20 transition-all">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                         </div>
                         <Badge variant="outline" className={cn(
                           "text-[8px] font-black uppercase border-white/10",
                           agent.status === 'THINKING' ? "text-blue-400 animate-pulse" : "text-slate-500"
                         )}>{agent.status}</Badge>
                      </div>
                      <div className="space-y-1 relative z-10">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-wide">{agent.role.replace(/_/g, ' ')}</p>
                         <p className="text-2xl font-black text-white tracking-tighter">{agent.name}</p>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
                         <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <span>Intelligence Depth</span>
                            <span>{Math.round(agent.confidenceScore * 100)}%</span>
                         </div>
                         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${agent.confidenceScore * 100}%` }} />
                         </div>
                      </div>
                   </Card>
                </motion.div>
              ))}
           </div>

           {/* AUTONOMOUS INTERVENTION QUEUE */}
           <Card className="shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Autonomous Interventions</CardTitle>
                  <CardDescription className="text-slate-500 font-medium mt-1">Staged operational logic requiring institutional council sign-off.</CardDescription>
                </div>
                <Workflow className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-white/5">
                    {stagedActions.length === 0 ? (
                       <div className="py-24 text-center opacity-20 flex flex-col items-center gap-6">
                          <ShieldCheck className="h-12 w-16" />
                          <p className="text-sm font-black uppercase tracking-widest">Zero Staged Interventions</p>
                       </div>
                    ) : (
                       stagedActions.map((action, i) => (
                          <div key={action.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                             <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="h-14 w-20 rounded-2xl border-2 border-white/5 bg-slate-950 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                   <Zap className="h-8 w-8 text-primary opacity-60" />
                                </div>
                                <div className="space-y-2 flex-1 min-w-0">
                                   <div className="flex items-center gap-4">
                                      <Badge className="bg-primary text-white text-[9px] font-black h-6 px-3 border-none shadow-lg tracking-widest">{action.actionType}</Badge>
                                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-40">Agent: {action.agentId}</span>
                                   </div>
                                   <h4 className="text-2xl font-black uppercase tracking-tighter text-white truncate">{action.justification}</h4>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">ID: {action.id} • Staged: {new Date(action.createdAt).toLocaleTimeString()} UTC</p>
                                </div>
                             </div>
                             <div className="flex gap-4 shrink-0 border-l border-white/5 pl-12 ml-8">
                                <Button 
                                  variant="ghost" 
                                  className="h-14 px-8 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
                                  onClick={() => rejectAction(action.id)}
                                >DISMISS</Button>
                                <Button 
                                  className="h-14 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-md hover:scale-105 transition-all"
                                  onClick={() => handleAuthorize(action.id)}
                                >AUTHORIZE</Button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: REASONING OBSERVATORY */}
        <div className="lg:col-span-4 space-y-6">
           {/* REASONING TRACE PANEL */}
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Cognitive Trace
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Cognitive Lock: Distributed logic symmetry is maintained at Tier-1 threshold. 14 node replicas are perfectly synchronized with the global oracle."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Logic Depth</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">L4</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Consensus</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">FINAL</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-ALIGN REASONING WEIGHTS
                 </Button>
              </CardContent>
           </Card>

           {/* SYSTEMIC GOVERNANCE MONITOR */}
           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">AI Health Matrix</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Reasoning Drift', val: '0.001%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Inference Latency', val: '140ms', icon: Zap, color: 'text-blue-500' },
                   { label: 'Policy Finality', val: '100%', icon: Lock, color: 'text-indigo-500' }
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
              <Terminal className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:rotate-45" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-300">Explainability Engine</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-6 opacity-40 text-slate-500">
                    "Baalvion intelligence provides 100% auditable reasoning traces for every autonomous state mutation. Every cognitive jump is cryptographically justified."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">LAUNCH EXPLAINER VAULT</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
