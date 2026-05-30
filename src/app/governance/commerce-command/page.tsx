/**
 * @file commerce-command/page.tsx
 * @description Institutional Commerce Command. Strategic oversight of global procurement and market expansion.
 */
'use client';

import { useEffect, useState } from 'react';
import { commerceIntelligenceService, IndustrialDemandSignal, CorridorOpportunity } from '@/services/commerce-intelligence-service';
import { adminService, HeatmapData } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Globe, 
  Zap, 
  Activity, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  Plus,
  Landmark,
  Boxes,
  MapPin,
  Anchor,
  Compass,
  Zap as FlashIcon
} from 'lucide-react';
import { cn, formatCurrency, getFlag } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function CommerceCommandPage() {
  const [signals, setSignals] = useState<IndustrialDemandSignal[]>([]);
  const [opportunities, setOpportunities] = useState<CorridorOpportunity[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const [sData, oData, hData] = await Promise.all([
      commerceIntelligenceService.getDemandSignals(),
      commerceIntelligenceService.getCorridorOpportunities(),
      adminService.getTradeHeatmapData()
    ]);
    setSignals(sData);
    setOpportunities(oData);
    setHeatmap(hData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && signals.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Commerce Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Growth</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Commerce Command</h2>
          <p className="text-muted-foreground font-medium italic">High-authority oversight of global sourcing trends, industrial demand, and trade corridor expansion.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Sovereign Node: GLOBAL_COMM_01
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> Start Sourcing Campaign
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* GLOBAL DEMAND VELOCITY */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b pb-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Demand Velocity</CardTitle>
                  <CardDescription className="text-xs font-medium">Real-time mapping of industrial procurement trends across the network.</CardDescription>
                </div>
                <Globe className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-8">
                   {signals.map((sig) => (
                      <motion.div 
                        key={sig.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-8 rounded-2xl border-2 bg-muted/5 space-y-6 group hover:border-primary/40 transition-all cursor-default"
                      >
                         <div className="flex items-center justify-between">
                            <Badge className="bg-primary text-white text-[10px] font-black uppercase h-6 px-3 border-none shadow-sm">{sig.category}</Badge>
                            <div className={cn(
                               "h-2 w-2 rounded-full animate-pulse",
                               sig.trend === 'rising' ? 'bg-emerald-500' : 'bg-blue-500'
                            )} />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Sourcing Index</p>
                            <p className="text-4xl font-black tracking-tighter text-foreground tabular-nums">{sig.surgeIntensity}%</p>
                         </div>
                         <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">"{sig.message}"</p>
                         <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{sig.region}</span>
                            <div className="flex items-center gap-1.5">
                               <TrendingUp className="h-3 w-3 text-emerald-600" />
                               <span className="text-[9px] font-black text-emerald-600 uppercase">Demand Growth</span>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
              </CardContent>
           </Card>

           {/* CORRIDOR OPPORTUNITY FORECAST */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b pb-8 px-6 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-sm font-black uppercase tracking-wide">Trade Corridor Expansion Intelligence</CardTitle>
                    <CardDescription className="text-xs">Predictive analytics identifying emerging high-value trade corridors based on systemic signals.</CardDescription>
                 </div>
                 <Compass className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {opportunities.map(opp => (
                       <div key={opp.id} className="p-6 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className="h-14 w-14 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <Anchor className="h-7 w-7 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                   <p className="font-black text-xl uppercase tracking-tighter leading-none">{opp.originNode} ↔ {opp.destinationNode}</p>
                                   <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase h-5">Top Corridor</Badge>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Forecast: {opp.growthForecast} Growth • Stability: {opp.stabilityIndex}%</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Opportunity Score</p>
                                <p className="text-3xl font-black text-primary tracking-tighter">{opp.opportunityScore}</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 hover:bg-muted opacity-20 group-hover:opacity-100 transition-all">
                                <ArrowRight className="h-6 w-6" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* COMMERCE INTELLIGENCE ORACLE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <FlashIcon className="h-5 w-5 text-white animate-pulse" />
                    Growth Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "AI Strategy Signal: Emerging industrial clusters in Vietnam are demonstrating a 92% affinity match with your current sectoral requirements. Recommend initializing an institutional sourcing campaign for electronic subsystems."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Affinity Match</p>
                       <p className="text-xl font-black text-emerald-300">92%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">ROI Forecast</p>
                       <p className="text-xl font-black text-blue-300">+14.2%</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-widest shadow-2xl bg-white text-primary border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    INITIATE EXPANSION CAMPAIGN
                 </Button>
              </CardContent>
           </Card>

           {/* STRATEGIC COMMERCE KPIS */}
           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expansion Pulse</h4>
              {[
                { label: 'Market Depth', val: '$1.42B', change: '+8.2% WoW', icon: Landmark, color: 'text-primary' },
                { label: 'Supplier Finality', val: '99.8%', change: 'Optimal', icon: ShieldCheck, color: 'text-emerald-500' },
                { label: 'Sourcing Velocity', val: '4.2 Days', change: 'Stable', icon: Activity, color: 'text-blue-500' },
                { label: 'Systemic Demand', val: 'High', change: 'Surging', icon: Boxes, color: 'text-orange-500' }
              ].map((kpi, i) => (
                 <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-2xl bg-muted border-2 group-hover:bg-primary/10 transition-colors">
                          <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                       </div>
                       <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{kpi.change}</p>
                       </div>
                    </div>
                    <span className="text-3xl font-black tracking-tighter tabular-nums group-hover:scale-110 transition-transform duration-500">{kpi.val}</span>
                 </div>
              ))}
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/40 transition-all duration-700">
              <Boxes className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-40 transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-wide text-foreground">Industrial Knowledge Graph</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Platform intelligence is currently mapping 14,240 cross-jurisdictional industrial nodes. Zero supply chain drift detected in the last execution cycle."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
