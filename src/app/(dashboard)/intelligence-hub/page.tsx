/**
 * @file intelligence-hub/page.tsx
 * @description THE STRATEGIC INTELLIGENCE COMMAND. 
 * High-authority observatory for global trade risks and maritime SIGINT.
 */
'use client';

import { useEffect, useState } from 'react';
import { maritimeService } from '@/modules/intelligence/services/maritime.service';
import { geopoliticalService } from '@/modules/intelligence/services/geopolitical.service';
import { riskIntelligenceService, RiskSignal } from '@/services/risk-intelligence-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Zap, 
  Activity, 
  ShieldCheck, 
  BrainCircuit, 
  Loader2, 
  ArrowRight,
  Compass,
  Radar,
  Radio,
  Siren,
  Anchor,
  History,
  TrendingUp,
  MapPin,
  Waves,
  Ship,
  Gavel
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function IntelligenceCommandHub() {
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [congestion, setCongestion] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      riskIntelligenceService.getGlobalSignals(),
      maritimeService.getCongestionMatrix()
    ]).then(([sData, cData]) => {
      setSignals(sData);
      setCongestion(cData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Strategic Oracle...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: INTELLIGENCE_COMMAND_01</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Strategic <br />Intelligence.</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md hover:bg-muted transition-all" onClick={() => router.push(PATHS.MARITIME_INTEL)}>
              <Anchor className="mr-3 h-4 w-4" /> Maritime Assets
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all" onClick={() => router.push(PATHS.GEOPOLITICAL_MONITORING)}>
              <Globe className="mr-3 h-5 w-5" /> Geopolitical Radar
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* GLOBAL RISK HEATMAP (SVG PLACEHOLDER) */}
        <Card className="lg:col-span-8 shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col h-[600px]">
           <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
              <div className="space-y-1">
                 <CardTitle className="text-xl font-black uppercase tracking-tighter">Planetary Risk Topology</CardTitle>
                 <CardDescription className="font-medium italic">Autonomous intensity mapping of geopolitical and operational friction.</CardDescription>
              </div>
              <Radar className="h-8 w-8 text-primary opacity-30 animate-spin-slow" />
           </CardHeader>
           <CardContent className="p-6 flex-1 grid md:grid-cols-2 gap-6">
              <div className="space-y-8">
                 <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Corridor Exposure Indices</p>
                 {[
                   { name: 'APAC-US West', risk: 12, health: 'Optimal', color: 'text-emerald-500' },
                   { name: 'EU-India South', risk: 45, health: 'Elevated', color: 'text-orange-500' },
                   { name: 'LATAM-China', risk: 28, health: 'Stable', color: 'text-blue-500' },
                   { name: 'Middle East Hub', risk: 84, health: 'Critical', color: 'text-red-500' }
                 ].map(corridor => (
                    <div key={corridor.name} className="space-y-3 group cursor-default">
                       <div className="flex justify-between items-end">
                          <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{corridor.name}</span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", corridor.color)}>{corridor.health}</span>
                       </div>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner relative">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${corridor.risk}%` }}
                             transition={{ duration: 1.5, ease: "circOut" }}
                             className={cn("h-full bg-primary", corridor.risk > 70 ? 'bg-red-500' : corridor.risk > 40 ? 'bg-orange-500' : 'bg-primary')}
                          />
                       </div>
                       <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase opacity-60">
                          <span>Risk Index: {corridor.risk}%</span>
                          <span>Signal Confidence: 98.4%</span>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="bg-muted/30 rounded-2xl border-2 border-dashed flex items-center justify-center p-6 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                 <div className="text-center space-y-6 relative z-10">
                    <Compass className="h-12 w-16 text-primary mx-auto opacity-20 group-hover:rotate-45 transition-transform duration-700" />
                    <div className="space-y-1">
                       <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Spatial Discovery</p>
                       <p className="text-sm font-medium italic opacity-60 max-w-xs mx-auto">"Planetary-scale intelligence is synchronized with the Global SSOT Ledger."</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-2 font-black text-[10px] uppercase h-11 px-8 bg-background" onClick={() => router.push(PATHS.GOVERNANCE_ECOSYSTEM)}>Launch Topology Graph</Button>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* PREDICTIVE INSIGHTS SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
           {/* FORESIGHT ORACLE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <BrainCircuit className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Strategic Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: Systemic shift in the South Asia electronics corridor detected. Predicted throughput decay: 14% for Q3. Suggest rebalancing to Vietnam node."
                 </p>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Risk Impact</span>
                       <span className="text-lg font-black text-red-300">-$450k Est.</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Confidence</span>
                       <span className="text-lg font-black text-emerald-400">99.8%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE OPTIMIZATION
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Maritime Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {congestion.map(item => (
                   <div key={item.port} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><Ship className="h-5 w-5 text-primary opacity-60" /></div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.port} Load</p>
                            <p className="text-[8px] font-black text-orange-600 uppercase">Trend: {item.trend}</p>
                         </div>
                      </div>
                      <span className="text-2xl font-black tracking-tighter tabular-nums">{item.load}%</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* SIGNAL LEDGER */}
      <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 p-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Signal Stream</CardTitle>
            <CardDescription className="text-xs font-medium">Real-time traces of geopolitical, commodity, and operational disruptions.</CardDescription>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-primary/5 rounded-full border-2 border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
             <Radio className="h-4 w-4 animate-pulse" /> Live SIGINT Feed
          </div>
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
                      className="p-6 flex items-start gap-6 group hover:bg-primary/[0.01] transition-colors"
                    >
                       <div className={cn(
                          "h-14 w-20 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500",
                          sig.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                       )}>
                          <Siren className={cn("h-8 w-8", sig.severity === 'critical' ? 'text-red-600' : 'text-blue-600')} />
                       </div>
                       <div className="space-y-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                             <Badge className="text-[10px] font-black uppercase h-6 px-3 border-none bg-slate-900 text-white shadow-lg tracking-widest">{sig.type}</Badge>
                             <span className="text-[11px] font-mono text-muted-foreground opacity-40">LEDGER_HASH: {sig.id}</span>
                          </div>
                          <h4 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{String(sig.message ?? sig.type ?? 'Signal').split(':')[0]}</h4>
                          <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-primary/10 pl-8">"{sig.message ?? ''}"</p>
                          <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-wide">
                             <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Affected: {(Array.isArray(sig.tags) ? sig.tags : []).join(', ') || '—'}</span>
                             <span className="flex items-center gap-2"><History className="h-4 w-4" /> {sig.timestamp ? new Date(sig.timestamp).toLocaleTimeString() : '—'} UTC</span>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-6 shrink-0 border-l-2 pl-12 border-muted/50">
                          <div className="text-right space-y-1">
                             <p className="text-[9px] font-black uppercase opacity-40 leading-none">Impact Score</p>
                             <p className="text-4xl font-black tracking-tighter text-primary tabular-nums">{sig.impactScore}%</p>
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
    </main>
  );
}
