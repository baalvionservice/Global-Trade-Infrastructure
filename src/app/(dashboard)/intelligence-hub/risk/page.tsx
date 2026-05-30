'use client';

import { useEffect, useState } from 'react';
import { riskIntelligenceService, RiskSignal } from '@/services/risk-intelligence-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
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
  Siren
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function RiskIntelligencePage() {
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskIntelligenceService.getGlobalSignals().then(setSignals).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Threat Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic layer v4.2</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Risk Observatory</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">Autonomous correlation of geopolitical signals, commodity volatility, and jurisdictional exposure.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-red-700 border-red-200 font-black text-[10px] uppercase tracking-widest">
              <Siren className="h-4 w-4 animate-pulse" />
              Sentinel Mode: ARMED
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* GLOBAL THREAT FEED */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Autonomous Signal Stream</CardTitle>
                  <CardDescription className="text-xs font-medium">Real-time mapping of systemic disruption vectors.</CardDescription>
                </div>
                <Radar className="h-6 w-6 text-primary opacity-30 animate-spin-slow" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {signals.map((sig, i) => (
                       <motion.div 
                        key={sig.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 flex items-start gap-8 group hover:bg-red-500/[0.01] transition-colors"
                       >
                          <div className={cn(
                             "h-14 w-14 rounded-3xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform",
                             sig.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                          )}>
                             <ShieldAlert className={cn("h-7 w-7", sig.severity === 'critical' ? 'text-red-600' : 'text-orange-600')} />
                          </div>
                          <div className="space-y-3 flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-[9px] font-black uppercase h-5 px-2 border-none bg-slate-900 text-white shadow-sm">{sig.type}</Badge>
                                <span className="text-[10px] font-mono text-muted-foreground opacity-40">HASH: {sig.id}</span>
                             </div>
                             <h4 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">{sig.title}</h4>
                             <p className="text-sm font-medium leading-relaxed italic opacity-80 border-l-4 border-primary/10 pl-6">"{sig.message}"</p>
                             <div className="flex items-center gap-6 pt-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">
                                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Corridors: {sig.affectedCorridors.join(', ')}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-3 shrink-0">
                             <div className="text-right">
                                <p className="text-[9px] font-black uppercase opacity-40 leading-none">Impact Index</p>
                                <p className="text-3xl font-black tracking-tighter text-red-600">{sig.impactScore}%</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-5 w-5" />
                             </Button>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* RISK ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Radio className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Strategy Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "AI Strategy Signal: Supply chain drift detected in the APAC-US corridor. Transition probability: 92%. Recommend rebalancing liquidity into Mumbai nodes."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-1 text-white">Risk Exposure</p>
                       <p className="text-2xl font-black text-red-300">$12.4M</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-1 text-white">Drift Anomaly</p>
                       <p className="text-2xl font-black text-emerald-300">0.02%</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-3xl">
                    REBALANCE CORRIDOR WEIGHTS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Exposure Metrics</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Settlement Stress', val: '8.4%', change: '+0.2% YoY', icon: Activity },
                   { label: 'Geopolitical Tension', val: 'Medium', change: 'Escalating', icon: Globe },
                   { label: 'Supply Resilience', val: '99.8%', change: 'Optimal', icon: ShieldCheck }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className="h-5 w-5 text-primary" /></div>
                         <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            <p className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">{stat.change}</p>
                         </div>
                      </div>
                      <span className="text-2xl font-black tracking-tighter tabular-nums group-hover:scale-110 transition-transform duration-500">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/40 transition-all duration-700">
              <Compass className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Planetary Risk Graph</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Baalvion intelligence is currently mapping 14,240 cross-jurisdictional industrial nodes. Zero systemic failure patterns detected in the current cycle."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
