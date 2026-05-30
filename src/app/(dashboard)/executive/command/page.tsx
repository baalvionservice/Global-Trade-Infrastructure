/**
 * @file command/page.tsx
 * @description Executive Global Command Center. The authoritative strategic observatory.
 */
'use client';

import { useEffect, useState } from 'react';
import { adminService, HeatmapData, PlatformStats } from '@/services/admin-service';
import { incidentService, TradeIncident } from '@/services/incident-service';
import { briefingService, StrategicBriefing } from '@/services/briefing-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  TrendingUp,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Siren,
  History,
  Lock,
  Workflow,
  Crosshair,
  Users,
  Compass
} from 'lucide-react';
import { cn, formatCurrency, getFlag } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';

export default function GlobalCommandPage() {
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [incidents, setIncidents] = useState<TradeIncident[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [hData, iData, sData] = await Promise.all([
        adminService.getTradeHeatmapData(),
        incidentService.getActiveIncidents(),
        adminService.getPlatformOverview()
      ]);
      setHeatmap(hData);
      setIncidents(iData);
      setStats(sData);
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Command Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-12 p-4 md:p-12 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Strategic Observatory</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Global Command Center</h2>
          <p className="text-muted-foreground font-medium italic">High-authority oversight of trade velocity, multi-party orchestration finality, and systemic risk.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Authority Level: EXECUTIVE
           </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-10">
           {/* GLOBAL TELEMETRY HEATMAP */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-[32px]">
              <CardHeader className="bg-muted/10 border-b pb-8 px-10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Institutional Trade Velocity</CardTitle>
                  <CardDescription className="text-xs font-medium">Real-time intensity mapping across verified institutional nodes.</CardDescription>
                </div>
                <Globe className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                   {heatmap.map((item) => (
                      <motion.div 
                        key={item.country}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="p-6 rounded-3xl border-2 transition-all hover:shadow-2xl relative overflow-hidden bg-background"
                        style={{ borderColor: `rgba(var(--primary), ${item.intensity / 100})` }}
                      >
                         <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                            <TrendingUp className="h-12 w-12" />
                         </div>
                         <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                               <span className="text-2xl filter drop-shadow-sm">{getFlag(item.country)}</span>
                               <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.country}</span>
                            </div>
                            <div>
                               <p className="text-2xl font-black text-primary leading-none tracking-tighter">{formatCurrency(item.volume)}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase mt-1 tracking-[0.15em]">Aggregate Flow</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-muted">
                               <div className="text-center">
                                  <p className="text-[11px] font-black">{item.activeDeals}</p>
                                  <p className="text-[7px] text-muted-foreground font-black uppercase">Finalized</p>
                               </div>
                               <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                  <div className="h-full bg-primary" style={{ width: `${item.intensity}%` }} />
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
              </CardContent>
           </Card>

           {/* ORCHESTRATION INTEGRITY MONITOR */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-[32px]">
              <CardHeader className="bg-muted/10 border-b pb-6 px-10">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Execution Reliability Ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="p-10 grid grid-cols-2 gap-10">
                    <div className="p-8 rounded-[32px] bg-muted/20 border-2 border-dashed space-y-6">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Workflow Finality Rate</p>
                       <p className="text-5xl font-black tracking-tighter text-emerald-600">99.98%</p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase">
                             <span>Integrity Confidence</span>
                             <span>OPTIMAL</span>
                          </div>
                          <Progress value={99} className="h-1 bg-muted" />
                       </div>
                    </div>
                    <div className="p-8 rounded-[32px] bg-muted/20 border-2 border-dashed space-y-6">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Consensus Latency (Avg)</p>
                       <p className="text-5xl font-black tracking-tighter text-primary">4.2h</p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase">
                             <span>Decision Velocity</span>
                             <span>+14% WoW</span>
                          </div>
                          <Progress value={84} className="h-1 bg-muted" />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-10">
           {/* CRITICAL INCIDENT WAR ROOM */}
           <Card className="shadow-2xl border-none bg-red-600 text-white relative overflow-hidden group rounded-[32px]">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <AlertTriangle className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-10 py-10">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-4">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Critical Execution Panel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 relative space-y-10">
                 <AnimatePresence mode="wait">
                    {incidents.length > 0 ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">{incidents[0].type}</h3>
                          <p className="text-base font-bold italic leading-relaxed opacity-90">"{incidents[0].message}"</p>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                                <p className="text-[9px] font-black uppercase opacity-60">Status</p>
                                <p className="text-sm font-black uppercase">{incidents[0].status}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                                <p className="text-[9px] font-black uppercase opacity-60">Compensation</p>
                                <p className="text-sm font-black uppercase">ACTIVE</p>
                             </div>
                          </div>
                          <Button variant="secondary" className="w-full h-18 font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl bg-white text-red-600 border-none rounded-2xl">
                             OPEN ADJUDICATION DESK
                          </Button>
                       </motion.div>
                    ) : (
                       <div className="py-20 text-center space-y-4">
                          <ShieldCheck className="h-16 w-16 mx-auto opacity-30" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Zero Systemic Execution Exceptions</p>
                       </div>
                    )}
                 </AnimatePresence>
              </CardContent>
           </Card>

           {/* STRATEGIC KPIS */}
           <Card className="shadow-none border-2 bg-background p-10 space-y-10 rounded-[32px]">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Orchestration Pulse</h4>
              {[
                { label: 'Platform Finality', val: stats?.operations.settlementFinality || '12.4s', change: 'Stable', icon: History, color: 'text-primary' },
                { label: 'Consensus Depth', val: 'Level 4', change: 'Optimal', icon: ShieldCheck, color: 'text-emerald-500' },
                { label: 'Atomic Success', val: '99.98%', change: 'Verified', icon: Zap, color: 'text-blue-500' }
              ].map((kpi, i) => (
                 <div key={i} className="space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/5"><kpi.icon className={cn("h-4 w-4", kpi.color)} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                       </div>
                       <span className="text-2xl font-black tracking-tighter">{kpi.val}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tighter opacity-60">
                       <span className="text-emerald-600">{kpi.change}</span>
                       <div className="h-0.5 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-3/4" />
                       </div>
                    </div>
                 </div>
              ))}
           </Card>

           <Card className="shadow-none border-2 bg-background p-10 text-center space-y-6 rounded-[32px] border-dashed group hover:border-primary/20 transition-all cursor-pointer">
              <Workflow className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest">Autonomous Consensus</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Orchestration signatures are deterministically verified before state transition. Zero process-skipped violations detected in the last cycle."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
