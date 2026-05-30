/**
 * @file soc/page.tsx
 * @description THE GLOBAL SECURITY OPERATIONS CENTER.
 * High-authority command for planetary threat correlation and autonomous defense.
 */
'use client';

import { useEffect, useState } from 'react';
import { activeDefense, RuntimeSignal } from '@/modules/security/services/active-defense.service';
import { strategicThreatOracle, StrategicSignal, ThreatActor } from '@/modules/security/services/threat-intelligence.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Activity, 
  Loader2, 
  Terminal, 
  AlertTriangle,
  Fingerprint,
  History,
  Radio,
  Siren,
  Crosshair,
  Globe,
  ArrowRight,
  Database,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecurityOpsPage() {
  const [threats, setThreats] = useState<RuntimeSignal[]>([]);
  const [signals, setSignals] = useState<StrategicSignal[]>([]);
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [tList, sList, aList] = await Promise.all([
      activeDefense.getActiveSignals(),
      strategicThreatOracle.getStrategicSignals(),
      strategicThreatOracle.getAdversaryMap()
    ]);
    setThreats(tList);
    setSignals(sList);
    setActors(aList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && threats.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-red-500 animate-pulse">Establishing Security Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6 selection:bg-red-600">
      {/* SOC HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Service Node: SECURITY_OPS_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">SOC <br />Control.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of adversarial patterns, identity drift, and autonomous containment finality."
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-400 shadow-md">
              <ShieldCheck className="h-5 w-5" />
              Sentinel Mode: ARMED
           </div>
           <Button className="h-12 px-6 bg-red-600 text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Siren className="mr-3 h-5 w-5" /> Emergency Operations
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* RUNTIME THREAT STREAM */}
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[700px] relative group">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Active Runtime Defense</CardTitle>
                 <CardDescription className="text-slate-400 font-medium italic">eBPF-driven trace of container execution drift and anomalous system calls.</CardDescription>
              </div>
              <Radio className="h-8 w-8 text-red-500 animate-pulse" />
           </CardHeader>
           <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar z-10 font-mono">
              <div className="divide-y divide-white/5">
                 <AnimatePresence initial={false}>
                    {threats.map((threat, i) => (
                       <motion.div 
                         key={threat.id} 
                         initial={{ opacity: 0, x: -20 }} 
                         animate={{ opacity: 1, x: 0 }} 
                         className="p-6 flex items-start gap-6 group hover:bg-white/[0.01] transition-colors"
                       >
                          <div className={cn(
                             "h-14 w-20 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500",
                             threat.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'
                          )}>
                             <ShieldAlert className={cn("h-8 w-8", threat.severity === 'critical' ? 'text-red-500' : 'text-orange-500')} />
                          </div>
                          <div className="space-y-4 flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <Badge className={cn(
                                   "text-[9px] uppercase font-black h-6 px-3 border-none shadow-lg tracking-widest",
                                   threat.severity === 'critical' ? "bg-red-600 text-white" : "bg-orange-600 text-white"
                                )}>{threat.severity} ALERT</Badge>
                                <span className="text-[11px] font-mono text-slate-600 tracking-widest">TRACE_ID: {threat.id}</span>
                             </div>
                             <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-[0.9]">{threat.message}</h4>
                             <div className="flex items-center gap-6 pt-2 text-[10px] font-black uppercase text-slate-500 tracking-wide">
                                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Node: {threat.nodeId}</span>
                                <span className="flex items-center gap-2"><History className="h-4 w-4" /> Observed {new Date(threat.timestamp).toLocaleTimeString()} UTC</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-6 shrink-0 border-l border-white/5 pl-12 ml-10">
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border border-white/10 bg-white/5 opacity-20 group-hover:opacity-100 transition-all">
                                <ArrowRight className="h-6 w-6 text-white" />
                             </Button>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </CardContent>
        </Card>

        {/* SIDEBAR: ADVERSARY OVERSIGHT */}
        <div className="lg:col-span-4 space-y-6">
           {/* STRATEGIC ORACLE */}
           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl h-[350px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Crosshair className="h-6 w-6 text-white animate-pulse" />
                    Strategic Threat Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Adversarial Alert: {signals[0]?.title}. Detected pattern matching known corridor bypass signatures. ARMING for autonomous containment."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    INITIATE BATCH QUARANTINE
                 </Button>
              </CardContent>
           </Card>

           {/* THREAT ACTOR MONITOR */}
           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Adversary Matrix</h4>
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {actors.map(actor => (
                   <div key={actor.id} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{actor.alias}</span>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Origin: {actor.origin}</p>
                         </div>
                      </div>
                      <span className="text-2xl font-black text-red-600 tabular-nums">{actor.threatLevel}%</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-8 rounded-2xl border-dashed border-white/5 group hover:border-red-500/20 transition-all duration-700">
              <Terminal className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-red-500 transition-all duration-700 group-hover:rotate-[-45deg]" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-300">Forensic Audit Replay</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-6 opacity-40 text-slate-500">
                    "Launch high-fidelity session replays for every state mutation in the cyber fabric. Every autonomous action is cryptographically justified."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">OPEN EVIDENCE VAULT</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
