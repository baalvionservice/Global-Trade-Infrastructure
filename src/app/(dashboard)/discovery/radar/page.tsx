'use client';

/**
 * @file src/app/(dashboard)/discovery/radar/page.tsx
 * @description Institutional Opportunity Radar. 
 * High-fidelity command for forward-looking industrial demand and corridor expansion.
 */

import { useEffect, useState } from 'react';
import { commerceIntelligenceService, CorridorOpportunity } from '@/services/commerce-intelligence-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Compass, 
  TrendingUp, 
  Globe, 
  Activity, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Layers,
  Boxes,
  MapPin,
  Anchor,
  Search,
  Radar,
  Radio
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpportunityRadarPage() {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<CorridorOpportunity[]>([]);

  useEffect(() => {
    commerceIntelligenceService.getCorridorOpportunities()
      .then(setOpportunities)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Scanning Global Opportunity Grids...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Radar node: FORESIGHT_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Opportunity <br />Radar.</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-primary">
              <Radio className="h-4 w-4 text-emerald-600 animate-ping" />
              Real-time Pulse Active
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
              <Compass className="mr-3 h-4 w-4" /> Calibrate Forecast
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* RADAR SWEEP VIEW */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid gap-8">
              {opportunities.map((opp, i) => (
                <motion.div 
                  key={opp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-2xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                       <div className="md:w-64 bg-primary p-6 text-white flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-10"><Radar className="h-40 w-40" /></div>
                          <div className="space-y-2 relative z-10">
                             <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Relevance</p>
                             <p className="text-4xl font-black tabular-nums tracking-tighter">{opp.opportunityScore}%</p>
                          </div>
                          <div className="space-y-4 pt-6 relative z-10 border-t border-white/10">
                             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                                <span>Stability</span>
                                <span>{opp.stabilityIndex}%</span>
                             </div>
                             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${opp.stabilityIndex}%` }} />
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex-1 p-6 space-y-8">
                          <div className="flex justify-between items-start">
                             <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                   <Badge className="bg-emerald-600 text-white text-[9px] font-black h-6 px-3 border-none shadow-sm uppercase tracking-widest">HIGH AFFINITY</Badge>
                                   <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Discovery ID: {opp.id}</span>
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-[0.8] group-hover:text-primary transition-colors">
                                   {opp.originNode} <br /><span className="text-muted-foreground opacity-30">TO</span> {opp.destinationNode}
                                </h3>
                             </div>
                          </div>
                          
                          <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-primary/20 pl-8">
                             "Projected growth of {opp.growthForecast} in high-purity silicon batching. Current node density suggests a 14.2% margin arbitrage compared to existing routes."
                          </p>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-muted/50">
                             <div className="flex items-center gap-6">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estimated Value</p>
                                   <p className="text-2xl font-black text-primary tracking-tighter">$12.4M</p>
                                </div>
                                <div className="space-y-1 border-l pl-8 border-muted">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Growth Delta</p>
                                   <p className="text-2xl font-black text-emerald-600 tracking-tighter">{opp.growthForecast}</p>
                                </div>
                             </div>
                             <Button className="h-14 px-6 font-black uppercase text-[10px] tracking-widest shadow-2xl rounded-2xl bg-primary">
                                INITIATE SOURCING
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </div>
        </div>

        {/* RADAR ANALYTICS SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Radar className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Foresight Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: Systemic shift in the India-UAE corridor creates a critical 72h window for high-volume steel procurement. Recommended action: LOCK FLOOR PRICE."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Confidence</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">99.8%</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">ROI Index</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">A++</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE STRATEGIC OPTIMIZATION
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Corridor Risk Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Settlement Stress', val: 'Minimal', change: '-4%', icon: Zap, color: 'text-emerald-500' },
                   { label: 'Carrier Density', val: 'Optimal', change: '+12%', icon: ShipIcon, color: 'text-blue-500' },
                   { label: 'Regulatory Variance', val: 'Stable', change: '0.02%', icon: ShieldCheck, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{stat.change} Drift</p>
                         </div>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}

function ShipIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.26 1.05 4.48 2.62 6"/><path d="M19 13V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6"/></svg>
}
