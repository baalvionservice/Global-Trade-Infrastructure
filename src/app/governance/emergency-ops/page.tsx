/**
 * @file emergency-ops/page.tsx
 * @description Sovereign Emergency Operations Center (SEOC).
 * High-authority command for managing systemic crises and infrastructure lockdown.
 */
'use client';

import { useEffect, useState } from 'react';
import { platformGovernance } from '@/modules/platform/services/platform-governance.service';
import { GlobalRiskSignal, PlatformThreatLevel } from '@/modules/platform/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Siren, 
  Loader2, 
  AlertTriangle, 
  Zap, 
  ShieldAlert, 
  Lock, 
  Radio, 
  Terminal, 
  ChevronLeft,
  ArrowRight,
  Activity,
  History,
  Gavel,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyOperationsPage() {
  const [signals, setSignals] = useState<GlobalRiskSignal[]>([]);
  const [threatLevel, setThreatLevel] = useState<PlatformThreatLevel>('STABLE');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    platformGovernance.getGlobalRiskSignals().then(setSignals).finally(() => setLoading(false));
  }, []);

  const handleEscalation = async () => {
    setThreatLevel('ELEVATED');
    // Simulation logic for systemic lockdown
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* SEOC HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-red-500/20 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className={cn(
               "h-2 w-2 rounded-full animate-ping",
               threatLevel === 'STABLE' ? 'bg-emerald-500' : 'bg-red-500'
             )} />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Sovereign Emergency Ops Node</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Crisis <br />Center.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative command for systemic crisis orchestration, protocol freezing, and multi-tenant containment."
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className={cn(
              "flex items-center gap-3 px-8 py-3 bg-red-600 rounded-2xl border-2 border-red-500 font-black text-xs uppercase tracking-widest text-white shadow-lg animate-pulse transition-all duration-700",
              threatLevel === 'STABLE' ? "bg-slate-900 border-white/5 text-slate-500 animate-none opacity-40" : ""
           )}>
              <Siren className="h-5 w-5" />
              SYSTEM_STATE: {threatLevel}
           </div>
           <Button variant="destructive" className="h-12 px-6 font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs" onClick={handleEscalation}>
              <ShieldAlert className="mr-3 h-5 w-5" /> Elevate Threat Mode
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* CRITICAL RISK STREAM */}
           <Card className="shadow-none border-none bg-red-600/5 rounded-2xl overflow-hidden flex flex-col relative ring-1 ring-red-600/10">
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-red-500">Systemic Threat Matrix</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Real-time correlation of digital and geopolitical disruption vectors.</CardDescription>
                </div>
                <Radio className="h-8 w-8 text-red-500 animate-pulse" />
              </CardHeader>
              <CardContent className="p-0 z-10">
                 <div className="divide-y divide-white/5">
                    {signals.map((sig, i) => (
                       <motion.div 
                        key={sig.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 flex items-start gap-6 group hover:bg-white/[0.01] transition-colors"
                       >
                          <div className={cn(
                             "h-14 w-20 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500",
                             sig.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'
                          )}>
                             <ShieldAlert className={cn("h-8 w-8", sig.severity === 'critical' ? 'text-red-500' : 'text-orange-500')} />
                          </div>
                          <div className="space-y-4 flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <Badge className={cn(
                                   "text-[9px] uppercase font-black tracking-widest px-3 h-6 border-none shadow-sm",
                                   sig.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                                )}>{sig.severity} RISK</Badge>
                                <span className="text-[10px] font-mono text-slate-600 tracking-widest">{sig.id}</span>
                             </div>
                             <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-[0.9]">{sig.message}</h4>
                             <div className="flex items-center gap-8 pt-2 text-[10px] font-black uppercase text-slate-500 tracking-wide">
                                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Impact: {sig.impactNodes.join(', ')}</span>
                                <span className="flex items-center gap-2"><History className="h-4 w-4" /> Propagated {new Date(sig.timestamp).toLocaleTimeString()} UTC</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-4 shrink-0 border-l-2 pl-12 border-white/5">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black uppercase text-slate-600 leading-none">Confidence</p>
                                <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{Math.round(sig.confidence * 100)}%</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border border-white/10 bg-white/5 opacity-20 group-hover:opacity-100 transition-all">
                                <ArrowRight className="h-6 w-6 text-white" />
                             </Button>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: EMERGENCY CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
           {/* PROTOCOL FREEZE CONTROL */}
           <Card className="shadow-lg border-none bg-red-600 text-white relative overflow-hidden group rounded-2xl h-[350px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Lock className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
                    Systemic Kill-Switch
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Critical Alert: Coordinated identity drift detected across 14 APAC clusters. Sovereign override authorized."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-red-600 border-none rounded-xl hover:scale-[1.02] transition-transform">
                    INITIATE PROTOCOL FREEZE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Incident Response Center</h4>
              <div className="space-y-6">
                 {[
                   { label: 'Triage Latency', val: '140ms', status: 'Optimal', icon: Activity, color: 'text-emerald-400' },
                   { label: 'Containment Speed', val: '4.2s', status: 'Optimal', icon: Zap, color: 'text-blue-400' },
                   { label: 'Evacuation Readiness', val: '100%', status: 'Locked', icon: Globe, color: 'text-indigo-400' }
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

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-8 rounded-2xl border-dashed border-white/5 group hover:border-red-500/20 transition-all duration-700">
              <Gavel className="h-14 w-14 mx-auto text-slate-700 opacity-20 group-hover:text-red-500 transition-all duration-700" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-widest text-slate-300">Liability Handshake</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-4">
                    "All emergency operations are cryptographically recorded on the Sovereign Ledger. Rulings made within the SEOC are legally binding and sovereign-auditable."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">DOWNLOAD CRISIS LOG</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}