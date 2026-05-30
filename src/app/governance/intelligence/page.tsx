'use client';

/**
 * @file src/app/governance/intelligence/page.tsx
 * @description THE STRATEGIC INTELLIGENCE HUB. 
 * High-authority command for geopolitical trade oversight and predictive risk management.
 * HARDENED: Integration with Singularity Oracle and Stochastic Forecaster.
 */

import { useEffect, useState } from 'react';
import { singularityOracle, StrategicSignal } from '@/services/intelligence/singularity-oracle';
import { stochasticForecaster, ForecastingResult } from '@/services/intelligence/stochastic-forecaster';
import { RiskHeatmap } from './_components/risk-heatmap';
import { AnomalyDetector } from './_components/anomaly-detector';
import { ExposureTracker } from './_components/exposure-tracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Loader2, 
  Zap, 
  Globe, 
  Radio, 
  Compass, 
  ArrowRight,
  History,
  Activity,
  Dna,
  Lock,
  Search,
  Scaling,
  Landmark,
  Siren,
  Terminal,
  MoreVertical
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function StrategicIntelligenceObservatory() {
  const [signals, setSignals] = useState<StrategicSignal[]>([]);
  const [forecast, setForecast] = useState<ForecastingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const [sData, fData] = await Promise.all([
        singularityOracle.getPulse(),
        stochasticForecaster.forecastLiquidity('CORR_GLOBAL')
      ]);
      setSignals(sData);
      setForecast(fData);
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !forecast) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Strategic Oracle...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: INTEL_COMMAND_A1</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Strategic <br />Observatory.</h2>
          <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">
            "Authoritative planetary oversight of geopolitical risk vectors, corridor throughput equilibrium, and institutional exposure finality."
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-indigo-700">
              <ShieldCheck className="h-4 w-4" />
              Pulse Finality: CONFIRMED
           </div>
        </div>
      </div>

      {/* STRATEGIC KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Network Risk Index', val: 'Minimal', sub: 'Stable', icon: Activity, color: 'text-emerald-500' },
          { label: 'Forecast Accuracy', val: '98.4%', sub: 'Zero Drift', icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Signal Velocity', val: '450ms', sub: 'E2E Sync', icon: Zap, color: 'text-orange-500' },
          { label: 'Oracle Sync', val: 'LOCKED', sub: 'Tier 1 Standard', icon: Lock, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-2xl group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-8 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-0">
                  <div className="text-3xl font-black tracking-tighter tabular-nums">{kpi.val}</div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60 italic">{kpi.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* GLOBAL RISK TOPOLOGY */}
        <div className="lg:col-span-8 space-y-6">
           <RiskHeatmap />
           
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl flex flex-col h-[500px]">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Planetary Intelligence Stream</CardTitle>
                  <CardDescription className="text-sm font-medium italic mt-1">Autonomous correlation of geopolitical friction and corridor load velocity.</CardDescription>
                </div>
                <Radio className="h-8 w-8 text-primary opacity-20 animate-pulse" />
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar">
                 <div className="divide-y-2">
                    <AnimatePresence initial={false}>
                       {signals.map((sig, i) => (
                          <motion.div 
                            key={sig.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6 flex items-start gap-6 group hover:bg-primary/[0.01] transition-colors"
                          >
                             <div className={cn(
                                "h-12 w-16 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500",
                                sig.impactScore > 75 ? 'bg-red-50 border-red-100' : 'bg-muted border-primary/10'
                             )}>
                                <Activity className={cn("h-6 w-6", sig.impactScore > 75 ? 'text-red-600' : 'text-primary opacity-60')} />
                             </div>
                             <div className="space-y-4 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                   <Badge className="bg-primary text-white text-[9px] font-black h-6 px-3 border-none shadow-lg tracking-widest">{sig.source}</Badge>
                                   <span className="text-[11px] font-mono text-muted-foreground opacity-40">LEDGER_REF: {sig.id}</span>
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{sig.message}</h4>
                                <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed space-y-2">
                                   <p className="text-[9px] font-black uppercase tracking-widest text-primary">Strategic Recommendation</p>
                                   <p className="text-sm font-bold italic text-foreground/80">"{sig.recommendation}"</p>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-6 shrink-0 border-l-2 pl-12 border-muted/50">
                                <div className="text-right space-y-1">
                                   <p className="text-[9px] font-black uppercase opacity-40 leading-none">Impact Index</p>
                                   <p className="text-4xl font-black tracking-tighter text-primary tabular-nums">{sig.impactScore}%</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all">
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

        {/* STRATEGIC FORESIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
           {/* FORESIGHT ORACLE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <BrainCircuit className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Strategy Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <div className="space-y-6">
                    <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                       "Foresight Alert: Global liquidity depth in the APAC cluster is trending +14% relative to baseline. Predicted arbitrage yield for Q4: {formatCurrency(forecast?.projectedValue || 0)}."
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Model Conf.</span>
                          <span className="text-4xl font-black text-emerald-300 block mt-2">99.8%</span>
                       </div>
                       <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Volatility</span>
                          <span className="text-4xl font-black text-blue-300 block mt-2">{forecast?.volatilityIndex}%</span>
                       </div>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-2xl hover:scale-[1.02] transition-transform">
                    EXECUTE BATCH REBALANCING
                 </Button>
              </CardContent>
           </Card>

           <ExposureTracker />

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Compass className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-40 transition-all duration-1000 group-hover:rotate-45" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Spatial Strategy Lab</p>
                 <p className="text-xs font-medium italic leading-relaxed px-6 opacity-60">
                    "Launch high-fidelity strategic simulations for global trade-war propagation or corridor re-routing impact. All models are synchronized with the 2024 Geopolitical Master Ledger."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">LAUNCH SIMULATION DESK</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
