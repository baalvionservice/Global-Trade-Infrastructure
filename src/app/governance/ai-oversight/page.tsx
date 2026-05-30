/**
 * @file src/app/governance/ai-oversight/page.tsx
 * @description THE SUPREME AI GOVERNANCE OBSERVATORY.
 * High-authority command node for auditing agentic behavior and model integrity.
 */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Loader2, 
  History, 
  BrainCircuit, 
  Activity, 
  Zap, 
  Lock, 
  Terminal,
  Dna,
  Cpu,
  RefreshCw,
  Search,
  Settings2,
  Scaling,
  Siren,
  Gavel,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIOversightPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Governance Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen selection:bg-primary">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: ORACLE_GOV_CENTER</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">AI <br />Governance.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of autonomous decision finality, recommendation lineage, and multi-model equilibrium."
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-8 border-white/10 bg-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 rounded-2xl">
              <History className="mr-3 h-4 w-4" /> Explainability Ledger
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Settings2 className="mr-3 h-4 w-4" /> Calibrate Weights
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* COHERENCE PULSE */}
           <Card className="shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[500px] relative group">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Planetary Logic Coherence</CardTitle>
                    <CardDescription className="text-slate-400 font-medium italic">High-fidelity visualization of agent reasoning stability and system equilibrium.</CardDescription>
                 </div>
                 <Dna className="h-10 w-10 text-primary opacity-20 group-hover:rotate-45 transition-transform duration-1000" />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex items-center justify-center relative z-10">
                 <div className="text-center space-y-8 max-w-2xl">
                    <div className="relative inline-block">
                       <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                       <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                          <BrainCircuit className="h-48 w-48 text-primary opacity-40" />
                       </motion.div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-4xl font-black tracking-tighter text-white uppercase leading-none">99.98% Aligned</p>
                       <p className="text-sm font-medium italic text-slate-400">"Autonomous trade logic is perfectly synchronized with the Sovereign Execution Matrix. Logic drift is below the 0.002% critical threshold."</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* REASONING LEDGER SNAPSHOT */}
           <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Reasoning Audit Ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-white/5 border-b border-white/5">
                          <tr>
                             <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Trace Identity</th>
                             <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Agent Node</th>
                             <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Confidence</th>
                             <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Law Match</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {[
                            { id: 'TR-1021', agent: 'TREASURY_ORACLE', confidence: 0.99, law: 'AEO_T1' },
                            { id: 'TR-1022', agent: 'COMPLIANCE_GUARD', confidence: 1.00, law: 'OFAC_V4' },
                            { id: 'TR-1023', agent: 'LOGISTICS_SENTINEL', confidence: 0.88, law: 'SGN_PORT_REGS' }
                          ].map(trace => (
                            <tr key={trace.id} className="group hover:bg-white/5 transition-colors">
                               <td className="p-8 font-mono text-[11px] text-primary">{trace.id}</td>
                               <td className="p-8 text-[11px] font-black uppercase text-slate-300">{trace.agent}</td>
                               <td className="p-8">
                                  <div className="flex items-center gap-3">
                                     <span className="text-xs font-black">{Math.round(trace.confidence * 100)}%</span>
                                     <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${trace.confidence * 100}%` }} />
                                     </div>
                                  </div>
                               </td>
                               <td className="p-8 text-right">
                                  <Badge variant="outline" className="text-[8px] font-black border-white/10 uppercase">{trace.law}</Badge>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: GOVERNANCE ORACLE */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl h-[350px]">
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Lock className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Shield className="h-6 w-6 text-white animate-pulse" />
                    Governance Lock
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Policy Protocol: Multi-agent weights have been frozen for the current trade window. No structural inference mutations permitted without supreme council authorization."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    INITIATE LOGIC SEAL
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 text-center space-y-8 rounded-2xl border-dashed border-white/5 group hover:border-red-500/20 transition-all duration-700">
              <Siren className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-red-500 transition-all duration-700" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-300">Liability Kill-Switch</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-8 opacity-40 text-slate-500">
                    "In the event of logic non-conformance, the Sovereign Kill-Switch immediately isolates the cognitive core and reverts all pending state mutations."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800">ARM KILL-SWITCH</Button>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Explainability Metrics</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Audit Readiness', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Finality Latency', val: '140ms', icon: Zap, color: 'text-blue-500' },
                   { label: 'Token Efficiency', val: 'Tier 1', icon: Scaling, color: 'text-indigo-500' }
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
        </div>
      </div>
    </main>
  );
}
