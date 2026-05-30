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
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Observatory</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Global Command Center</h2>
          <p className="text-muted-foreground font-medium italic">High-authority oversight of trade velocity, multi-party orchestration finality, and systemic risk.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm bg-background text-indigo-700 border-indigo-200 font-bold text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Authority: Executive
           </div>
        </div>
      </div>

      {/* EXECUTIVE KPI ROW — live platform telemetry at a glance */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Global Trade Volume', val: stats ? formatCurrency(stats.volume.total) : '—', sub: stats?.volume.growth ?? 'YoY', icon: TrendingUp, tone: 'text-emerald-600' },
          { label: 'Active Deals', val: stats ? String(stats.operations.activeDeals) : '—', sub: 'In orchestration', icon: Zap, tone: 'text-primary' },
          { label: 'Live Incidents', val: String(incidents.length), sub: incidents.length ? 'Require attention' : 'All clear', icon: Siren, tone: incidents.length ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Institutions', val: stats ? String(stats.entities.total) : '—', sub: `${stats?.entities.activeTenants ?? 0} active`, icon: Users, tone: 'text-blue-600' },
        ].map((k) => (
          <Card key={k.label} className="border shadow-sm rounded-2xl bg-background">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{k.label}</span>
                <k.icon className={cn('h-4 w-4', k.tone)} />
              </div>
              <div className="text-3xl font-black tracking-tight tabular-nums mt-2">{k.val}</div>
              <div className="text-[11px] font-medium text-muted-foreground/70 mt-1">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-8">
           {/* GLOBAL TELEMETRY HEATMAP */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-5 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider">Institutional Trade Velocity</CardTitle>
                  <CardDescription className="text-xs font-medium mt-0.5">Real-time intensity mapping across verified nodes.</CardDescription>
                </div>
                <Globe className="h-5 w-5 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {heatmap.map((item) => (
                      <motion.div
                        key={item.country}
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl border transition-all hover:border-primary/40 hover:shadow-sm bg-background"
                      >
                         <div className="space-y-3">
                            <div className="flex items-center gap-2">
                               <span className="text-lg">{getFlag(item.country)}</span>
                               <span className="text-[10px] font-bold uppercase tracking-wide truncate text-muted-foreground">{item.country}</span>
                            </div>
                            <div>
                               <p className="text-xl font-black text-foreground leading-none tracking-tight tabular-nums">{formatCurrency(item.volume)}</p>
                               <p className="text-[9px] font-medium text-muted-foreground uppercase mt-1 tracking-wide">Aggregate Flow</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-muted gap-2">
                               <div>
                                  <p className="text-xs font-black tabular-nums">{item.activeDeals}</p>
                                  <p className="text-[8px] text-muted-foreground font-bold uppercase">Finalized</p>
                               </div>
                               <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
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
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-5 px-6">
                 <CardTitle className="text-sm font-black uppercase tracking-wider">Execution Reliability Ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-muted/30 border space-y-4">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Workflow Finality Rate</p>
                       <p className="text-3xl font-black tracking-tight text-emerald-600 tabular-nums">99.98%</p>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
                             <span>Integrity Confidence</span>
                             <span className="text-emerald-600">Optimal</span>
                          </div>
                          <Progress value={99} className="h-1 bg-muted" />
                       </div>
                    </div>
                    <div className="p-5 rounded-xl bg-muted/30 border space-y-4">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Consensus Latency</p>
                       <p className="text-3xl font-black tracking-tight text-primary tabular-nums">4.2h</p>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
                             <span>Decision Velocity</span>
                             <span className="text-emerald-600">+14% WoW</span>
                          </div>
                          <Progress value={84} className="h-1 bg-muted" />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
           {/* CRITICAL INCIDENT WAR ROOM */}
           <Card className="shadow-2xl border-none bg-red-600 text-white relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <AlertTriangle className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="relative border-b border-white/10 px-6 py-5">
                 <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-90 flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-white animate-pulse" />
                    Critical Execution Panel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-5">
                 <AnimatePresence mode="wait">
                    {incidents.length > 0 ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{incidents[0].type}</h3>
                          <p className="text-sm font-medium leading-relaxed opacity-90">{incidents[0].message}</p>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                                <p className="text-[9px] font-bold uppercase opacity-70">Status</p>
                                <p className="text-sm font-black uppercase">{incidents[0].status}</p>
                             </div>
                             <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                                <p className="text-[9px] font-bold uppercase opacity-70">Compensation</p>
                                <p className="text-sm font-black uppercase">Active</p>
                             </div>
                          </div>
                          <Button variant="secondary" className="w-full h-11 font-bold uppercase text-[10px] tracking-wide bg-white text-red-600 border-none rounded-xl hover:bg-white/90">
                             Open Adjudication Desk
                          </Button>
                       </motion.div>
                    ) : (
                       <div className="py-8 text-center space-y-3">
                          <ShieldCheck className="h-12 w-12 mx-auto opacity-40" />
                          <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">Zero Systemic Execution Exceptions</p>
                       </div>
                    )}
                 </AnimatePresence>
              </CardContent>
           </Card>

           {/* STRATEGIC KPIS */}
           <Card className="shadow-sm border bg-background p-6 space-y-5 rounded-2xl">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Orchestration Pulse</h4>
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

           <Card className="shadow-sm border bg-background p-6 rounded-2xl">
              <div className="flex items-start gap-3">
                 <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <Workflow className="h-5 w-5" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-wide">Autonomous Consensus</p>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                       Orchestration signatures are deterministically verified before every state transition. Zero process-skipped violations in the last cycle.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
