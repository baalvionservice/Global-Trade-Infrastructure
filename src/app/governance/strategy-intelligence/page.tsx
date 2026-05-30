
/**
 * @file strategy-intelligence/page.tsx
 * @description THE STRATEGIC FORESIGHT HUB.
 * Board-level operating system for strategic forecasting, ROI modeling, and autonomous growth.
 */
'use client';

import { useEffect, useState } from 'react';
import { missionOrchestrator } from '@/modules/executive/services/mission-orchestrator.service';
import { StrategicForecast, ExecutiveKPI } from '@/modules/executive/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BrainCircuit, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Landmark, 
  Loader2, 
  ArrowRight,
  Compass,
  Radar,
  Radio,
  Dna,
  Workflow,
  Sparkles,
  BarChart3,
  Scaling,
  ChevronLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function StrategyIntelligenceHub() {
  const [forecasts, setForecasts] = useState<StrategicForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    missionOrchestrator.getStrategicForesight().then(setForecasts).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Synchronizing Strategic Oracle...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6 selection:bg-primary">
      {/* STRATEGY HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Board Decision Node: STRAT_ORACLE_V4</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Foresight.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary foresight for institutional capital rebalancing, corridor ROI modeling, and autonomous growth orchestration."
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10">
              <BarChart3 className="mr-3 h-4 w-4" /> Export Board Memo
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Sparkles className="mr-3 h-5 w-5 fill-current" /> Calibrate Growth Model
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* STRATEGIC FORECASTS */}
        <div className="lg:col-span-8 space-y-8">
           <AnimatePresence>
              {forecasts.map((forecast, i) => (
                <motion.div 
                  key={forecast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <Card className="shadow-lg border-none bg-slate-900/60 rounded-2xl overflow-hidden group hover:bg-white/[0.02] transition-all">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                       <div className="md:w-3 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                       <div className="flex-1 p-6 space-y-6">
                          <div className="flex justify-between items-start">
                             <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                   <Badge className="bg-emerald-600 text-white text-[10px] font-black h-7 px-4 border-none shadow-xl tracking-wide">HIGH_CONFIDENCE</Badge>
                                   <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest">Target: {forecast.targetMetric}</span>
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                                   {forecast.horizon} Impact: {forecast.predictedDelta}% <br /><span className="text-emerald-400">Optimization Yield</span>
                                </h3>
                             </div>
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Model Conf.</p>
                                <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{Math.round(forecast.confidenceScore * 100)}%</p>
                             </div>
                          </div>

                          <p className="text-2xl font-bold italic leading-tight text-slate-300 max-w-3xl">
                             "{forecast.justification}"
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Projected Lift</p>
                                <p className="text-3xl font-black text-emerald-400 tabular-nums">{formatCurrency(forecast.impactValue, forecast.currency)}</p>
                             </div>
                             <div className="space-y-2 border-l border-white/5 pl-10">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Risk Index</p>
                                <p className="text-3xl font-black text-white tabular-nums">{forecast.riskIndex}/100</p>
                             </div>
                             <div className="space-y-2 border-l border-white/5 pl-10">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Model ID</p>
                                <p className="text-xs font-mono text-slate-500 uppercase">PROB_STOCHASTIC_V4</p>
                             </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-white/5">
                             <Button className="h-14 px-16 bg-white text-primary font-black uppercase tracking-wide text-sm shadow-lg hover:scale-105 transition-all rounded-2xl">
                                EXECUTE {forecast.recommendation}
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* STRATEGY SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
           {/* COGNITIVE EQUILIBRIUM */}
           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Ecosystem Coherence</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Decision Velocity', val: '4.2h', sub: '-14% Delay', icon: Activity, color: 'text-emerald-400' },
                   { label: 'Forecast Accuracy', val: '98.4%', sub: 'Zero Drift', icon: ShieldCheck, color: 'text-blue-400' },
                   { label: 'Capital Finality', val: 'Optimal', sub: 'Locked', icon: Landmark, color: 'text-indigo-400' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">{stat.sub}</p>
                         </div>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-white tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-8 rounded-2xl border-dashed border-white/5">
              <Scaling className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:scale-110" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">Strategic Simulation</p>
                 <p className="text-xs font-medium italic leading-relaxed px-8 opacity-40 text-slate-500">
                    "Launch high-fidelity 'What-If' scenarios for global trade war propagation or treasury shock interventions. All models are synchronized with the Digital Twin."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white" onClick={() => router.push(PATHS.GOVERNANCE_SIMULATION)}>DEPLOY SCENARIO TWIN</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
