'use client';

/**
 * @file src/app/(dashboard)/discovery/signals/page.tsx
 * @description The Global Strategic Intelligence observatory.
 * High-fidelity oversight of geopolitical signals, commodity volatility, and jurisdictional risk.
 */

import { useEffect, useState } from 'react';
import { riskIntelligenceService, RiskSignal } from '@/services/risk-intelligence-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  TrendingUp, 
  Activity, 
  Loader2, 
  Zap, 
  ArrowRight,
  Compass,
  Radar,
  Radio,
  Siren,
  History,
  Lock,
  Landmark,
  Target,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function MarketSignalsPage() {
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskIntelligenceService.getGlobalSignals().then(setSignals).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Satellite Intelligence Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Node: GLOBAL_SIGINT_01</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Market <br />Signals.</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-2xl border-2 border-red-500/10 shadow-2xl text-xs font-black uppercase tracking-widest text-red-600">
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
                  <CardTitle className="text-xl font-black uppercase tracking-wide">Autonomous Signal Stream</CardTitle>
                  <CardDescription className="text-sm font-medium italic mt-2">Real-time correlation of systemic disruption vectors and geopolitical friction.</CardDescription>
                </div>
                <Radar className="h-8 w-8 text-primary opacity-30 animate-spin-slow" />
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
                                   <Badge className="text-[10px] font-black uppercase h-6 px-3 border-none bg-slate-900 text-white shadow-lg tracking-widest">{sig.type}</Badge>
                                   <span className="text-[11px] font-mono text-muted-foreground opacity-40">LEDGER_REF: {sig.id}</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{sig.title}</h4>
                                <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-red-500/10 pl-8">"{sig.message}"</p>
                                <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-wide">
                                   <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Affected: {sig.affectedCorridors.join(', ')}</span>
                                   <span className="flex items-center gap-2"><History className="h-4 w-4" /> {format(new Date(sig.createdAt), "HH:mm:ss")} UTC</span>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-6 shrink-0 border-l-2 pl-12 border-muted/50">
                                <div className="text-right space-y-1">
                                   <p className="text-[9px] font-black uppercase opacity-40 leading-none">Impact Index</p>
                                   <p className="text-4xl font-black tracking-tighter text-red-600 tabular-nums">{sig.impactScore}%</p>
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
                 <Radio className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Strategic Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Strategy Signal: Supply chain drift detected in the APAC-US corridor. Transition probability: 92%. Recommend rebalancing liquidity into Mumbai nodes."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white tracking-widest">Exposure</p>
                       <p className="text-3xl font-black text-red-300 tabular-nums tracking-tighter">$12.4M</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white tracking-widest">Confidence</p>
                       <p className="text-3xl font-black text-emerald-300 tabular-nums tracking-tighter">98.4%</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    REBALANCE CORRIDOR WEIGHTS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Systemic Vulnerability</h4>
              <div className="space-y-6">
                 {[
                   { label: 'Settlement Stress', val: '8.4%', change: '+0.2% YoY', icon: Activity, color: 'text-red-500' },
                   { label: 'Geopolitical Tension', val: 'Medium', change: 'Escalating', icon: Globe, color: 'text-orange-500' },
                   { label: 'Supply Resilience', val: '99.8%', change: 'Optimal', icon: ShieldCheck, color: 'text-emerald-500' }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/10 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            <p className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">{stat.change}</p>
                         </div>
                      </div>
                      <span className="text-3xl font-black tracking-tighter tabular-nums group-hover:scale-110 transition-transform duration-500">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
