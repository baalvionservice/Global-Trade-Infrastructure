'use client';

import { useEffect, useState } from 'react';
import { adminService, PlatformStats, CorridorHealth, HeatmapData } from '@/services/admin-service';
import { loggingService, LogEntry } from '@/services/observability-service';
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
  Server, 
  Terminal, 
  ShieldAlert, 
  TrendingUp,
  MapPin,
  ArrowRight,
  History,
  Activity as PulseIcon
} from 'lucide-react';
import { cn, formatCurrency, getFlag } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlatformControlTowerPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [corridors, setCorridors] = useState<CorridorHealth[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [sData, cData, lData, hData] = await Promise.all([
      adminService.getPlatformOverview(),
      adminService.getCorridorMetrics(),
      loggingService.getLogs({ limit: 15 }),
      adminService.getTradeHeatmapData()
    ]);
    setStats(sData);
    setCorridors(cData);
    setLogs(lData);
    setHeatmap(hData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Master Control</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Global Control Tower</h2>
          <p className="text-muted-foreground font-medium italic">High-fidelity oversight of institutional liquidity, corridor health, and systemic risk.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border-2 shadow-sm text-xs font-black uppercase tracking-widest text-indigo-700 border-indigo-200">
              <ShieldCheck className="h-4 w-4" />
              Node Finality: Secure
           </div>
           <Button variant="outline" className="bg-background border-2 font-black h-12 shadow-sm">Sync Infrastructure</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-none border border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Managed Volume</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{formatCurrency(stats?.volume.total || 0)}</div>
            <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-tighter">{stats?.volume.growth} Growth WoW</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Node Load</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats?.operations.systemLoad}%</div>
            <Progress value={stats?.operations.systemLoad} className="h-1.5 mt-2 bg-muted" />
          </CardContent>
        </Card>
        <Card className="shadow-none border border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Corridors</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{corridors.length} / 14</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">Verified Routing Active</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-red-200 bg-red-50/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-red-800 tracking-widest">High-Risk Entities</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-700">{stats?.entities.highRisk}</div>
            <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">Pending Audit Action</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-8">
           {/* LIVE TRADE HEATMAP */}
           <Card className="shadow-none border bg-background overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/10 border-b pb-6 px-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Regional Trade Velocity</CardTitle>
                  <CardDescription className="text-xs">Jurisdictional heatmap of institutional liquidity and RFQ volume.</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                   <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Live Heatmap</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                   {heatmap.map((item) => (
                      <motion.div 
                        key={item.country}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl border-2 transition-all hover:shadow-lg relative overflow-hidden"
                        style={{ borderColor: `rgba(var(--primary), ${item.intensity / 100})` }}
                      >
                         <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Globe className="h-12 w-12" />
                         </div>
                         <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-2">
                               <span className="text-lg">{getFlag(item.country)}</span>
                               <span className="text-xs font-black uppercase tracking-tighter truncate">{item.country}</span>
                            </div>
                            <div>
                               <p className="text-lg font-black text-primary leading-none">{formatCurrency(item.volume)}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase mt-1 tracking-[0.1em]">Volume Processed</p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-muted">
                               <div className="text-center">
                                  <p className="text-[10px] font-black">{item.activeRfqs}</p>
                                  <p className="text-[7px] text-muted-foreground font-bold uppercase">RFQs</p>
                               </div>
                               <div className="text-center">
                                  <p className="text-[10px] font-black">{item.activeDeals}</p>
                                  <p className="text-[7px] text-muted-foreground font-bold uppercase">Deals</p>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border bg-background overflow-hidden flex flex-col h-full">
              <CardHeader className="bg-muted/10 border-b pb-8 px-8">
                 <div className="flex items-center justify-between">
                    <div>
                       <CardTitle className="text-sm font-black uppercase tracking-wide">Corridor Performance Ledger</CardTitle>
                       <CardDescription className="text-xs mt-1">Real-time health of primary global trade routes.</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-primary animate-pulse" />
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {corridors.map((corridor) => (
                       <div key={corridor.id} className="flex items-center justify-between p-6 group hover:bg-primary/[0.02] transition-colors">
                          <div className="flex items-center gap-6">
                             <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center border shadow-inner">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                             </div>
                             <div>
                                <p className="font-black text-sm uppercase tracking-tight">{corridor.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <Badge variant="outline" className={cn(
                                      "text-[8px] font-black uppercase h-4 px-1.5",
                                      corridor.status === 'stable' ? "bg-green-50 text-green-700 border-green-200" : 
                                      corridor.status === 'congested' ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-red-50 text-red-700 border-red-200"
                                   )}>
                                      {corridor.status}
                                   </Badge>
                                   <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Avg Transit: {corridor.avgTransitTime}</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Active Load</p>
                                <p className="text-xs font-black">{corridor.activeShipments} Trade Units</p>
                             </div>
                             <div className="w-16 text-right">
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Risk</p>
                                <p className={cn("text-xs font-black", corridor.riskIndex > 30 ? "text-orange-600" : "text-green-600")}>{corridor.riskIndex}%</p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
           {/* ACTIVE HANDSHAKE MONITOR */}
           <Card className="shadow-none border bg-background overflow-hidden flex flex-col h-[350px]">
              <CardHeader className="bg-primary/5 border-b py-5 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-[0.1em]">Active Handshake Monitor</CardTitle>
                </div>
                <PulseIcon className="h-4 w-4 text-primary animate-pulse" />
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none z-10" />
                 <div className="p-4 space-y-3">
                    {[
                      { id: '1', title: 'RFQ Initialized', product: 'Monocrystalline PV', value: '$840k', node: 'Shanghai' },
                      { id: '2', title: 'Bid Received', product: 'Industrial Steels', value: '$1.2M', node: 'Busan' },
                      { id: '3', title: 'Terms Accepted', product: 'Semiconductors', value: '$2.4M', node: 'Singapore' },
                      { id: '4', title: 'Escrow Funded', product: 'Heavy Machinery', value: '$15M', node: 'Rotterdam' },
                    ].map((handshake, i) => (
                      <motion.div 
                        key={handshake.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-all shadow-sm group"
                      >
                         <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary group-hover:text-white transition-colors">
                               <Zap className="h-3.5 w-3.5" />
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[10px] font-black uppercase text-primary leading-none">{handshake.title}</p>
                               <p className="text-xs font-bold truncate max-w-[120px]">{handshake.product}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-foreground">{handshake.value}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">{handshake.node}</p>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border bg-slate-950 text-slate-300 overflow-hidden h-[300px] flex flex-col">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-4">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-100 flex items-center gap-2">
                       <Terminal className="h-4 w-4 text-emerald-500" />
                       Real-Time System Log
                    </CardTitle>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 font-mono text-[10px]">LIVE_STREAM</Badge>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-auto custom-scrollbar font-mono text-[10px]">
                 <div className="p-4 space-y-1.5">
                    {logs.map((log) => (
                       <div key={log.id} className="flex gap-4 group hover:bg-slate-900 transition-colors py-0.5">
                          <span className="text-slate-600 shrink-0">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                          <span className={cn(
                             "font-black uppercase w-12 shrink-0",
                             log.level === 'error' ? "text-red-500" : log.level === 'warning' ? "text-orange-400" : "text-blue-400"
                          )}>[{log.level.substring(0, 3)}]</span>
                          <span className="group-hover:text-slate-100 transition-colors truncate">{log.message}</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <ShieldCheck className="h-32 w-32 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10">
                 <CardTitle className="text-xs font-black uppercase tracking-wide opacity-80 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Market Penetration
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 relative space-y-6">
                 <p className="text-sm font-bold leading-relaxed opacity-90 italic">
                    "Platform adoption is scaling +8% Month-over-Month. Sourcing demand in the APAC-US corridor is hitting peak thresholds."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/5">
                       <p className="text-[9px] font-black uppercase opacity-60">Avg. Deal Size</p>
                       <p className="text-lg font-black">$452.4k</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 border border-white/5">
                       <p className="text-[9px] font-black uppercase opacity-60">Success rate</p>
                       <p className="text-lg font-black">94.2%</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full text-[10px] font-black py-7 uppercase tracking-widest shadow-2xl">
                    View Network Health <ArrowRight className="ml-2 h-3 w-3" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
