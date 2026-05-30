/**
 * @file regulatory/page.tsx
 * @description THE SOVEREIGN REGULATORY INTELLIGENCE HUB.
 * High-authority command for geopolitical trade oversight and policy monitoring.
 */
'use client';

import { useEffect, useState } from 'react';
import { sanctionsService } from '@/services/sanctions-service';
import { regulatoryAI } from '@/services/regulatory-ai-service';
import { SanctionSignal } from '@/types/regulatory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  Globe, 
  TrendingUp, 
  Loader2, 
  ArrowRight, 
  Zap, 
  History, 
  Lock, 
  Compass,
  Radio,
  Siren,
  Search,
  Activity,
  Scaling,
  Landmark,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function RegulatoryIntelligenceHub() {
  const [signals, setSignals] = useState<SanctionSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    sanctionsService.getRecentSignals().then(setSignals).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6 bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing SIGINT Handshake...</p>
    </div>
  );

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.INTELLIGENCE_HUB)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary transition-all">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command hub
          </Button>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign SIGINT Hub</p>
            <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Regulatory Intel</h2>
            <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority monitoring of geopolitical signals, sanctions propagation, and jurisdictional trade restrictions.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-red-50 rounded-2xl border-2 border-red-100 text-xs font-black uppercase tracking-widest text-red-600 shadow-xl animate-in zoom-in duration-500">
              <Siren className="h-4 w-4 animate-pulse" />
              Intelligence Mode: ARMED
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* GLOBAL THREAT STREAM */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-wide">Autonomous Sanctions Stream</CardTitle>
                  <CardDescription className="text-sm font-medium italic mt-2">Real-time correlation of systemic disruption vectors and global restricted lists.</CardDescription>
                </div>
                <Radio className="h-8 w-8 text-red-500 opacity-40 animate-pulse" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    <AnimatePresence>
                       {signals.map((sig, i) => (
                          <motion.div 
                            key={sig.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 flex items-start gap-6 group hover:bg-red-500/[0.01] transition-colors"
                          >
                             <div className={cn(
                                "h-14 w-20 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500",
                                sig.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                             )}>
                                <ShieldAlert className={cn("h-8 w-8", sig.severity === 'critical' ? 'text-red-600' : 'text-orange-600')} />
                             </div>
                             <div className="space-y-4 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                   <Badge className="bg-slate-900 text-white text-[10px] font-black uppercase h-6 px-3 border-none shadow-lg tracking-widest">{sig.type} LIST</Badge>
                                   <span className="text-[11px] font-mono text-muted-foreground opacity-40">SIGNAL_ID: {sig.id}</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{sig.entityName}</h4>
                                <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-red-500/10 pl-8">"{sig.description}"</p>
                                <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-wide">
                                   <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Jurisdiction: GLOBAL</span>
                                   <span className="flex items-center gap-2"><History className="h-4 w-4" /> {format(new Date(sig.timestamp), "HH:mm:ss")} UTC</span>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-6 shrink-0 border-l-2 pl-12 border-muted/50">
                                <div className="text-right space-y-1">
                                   <p className="text-[9px] font-black uppercase opacity-40 leading-none">Match Conf.</p>
                                   <p className="text-4xl font-black tracking-tighter text-red-600 tabular-nums">{Math.round(sig.matchConfidence * 100)}%</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border-2 opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all">
                                   <ArrowRight className="h-6 w-6" />
                                </Button>
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: RISK COMMAND */}
        <div className="lg:col-span-4 space-y-8">
           {/* RISK ORACLE PANEL */}
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Adversarial Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Strategic Alert: Detected pattern matching 'Vessel Identity Spoofing' in the APAC-West corridor. High probability of sanctions evasion bypass. Arming autonomous rebalancing."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Threat Index</span>
                       <span className="text-4xl font-black text-red-300 tracking-tighter block mt-2">HIGH</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Confidence</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">98%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-SCAN JURISDICTIONAL GRAPH
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem finality</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Rule Synchronization', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Sanctions Finality', val: '100%', icon: Lock, color: 'text-blue-500' },
                   { label: 'Regulatory Drift', val: 'Minimal', icon: Activity, color: 'text-indigo-500' }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/10 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-3xl font-black tracking-tighter tabular-nums group-hover:scale-110 transition-transform duration-500">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Compass className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Sovereign Graph Mapping</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4 opacity-60">
                    "Baalvion intelligence is currently mapping 14,240 cross-jurisdictional industrial nodes against the 2024 Strategic Restriction Registry."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
