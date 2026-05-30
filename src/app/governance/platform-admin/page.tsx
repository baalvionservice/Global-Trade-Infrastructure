/**
 * @file platform-admin/page.tsx
 * @description Global Master Control Tower. Authoritative oversight for multi-tenant institutional clusters.
 */
'use client';

import { useEffect, useState } from 'react';
import { 
  loggingService, 
  healthService, 
  LogEntry, 
  SystemHealth 
} from '@/services/observability-service';
import { resilienceService, ServiceInstance } from '@/services/resilience-service';
import { adminService, HeatmapData, CorridorHealth, PlatformStats } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Loader2, 
  RefreshCw,
  Terminal,
  Server,
  Cpu,
  Zap,
  Activity,
  Globe,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Users,
  Database,
  Lock,
  Activity as PulseIcon
} from 'lucide-react';
import { cn, formatCurrency, getFlag } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function PlatformMasterControlPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [nodes, setNodes] = useState<ServiceInstance[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [corridors, setCorridors] = useState<CorridorHealth[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [sysLogs, sysHealth, hData, cData, pStats] = await Promise.all([
      loggingService.getLogs({ limit: 50 }),
      healthService.getSystemHealth(),
      adminService.getTradeHeatmapData(),
      adminService.getCorridorMetrics(),
      adminService.getPlatformOverview()
    ]);
    
    setLogs(sysLogs);
    setHealth(sysHealth);
    setHeatmap(hData);
    setCorridors(cData);
    setStats(pStats);
    setNodes(resilienceService.getInstances());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFailover = (region: string) => {
    resilienceService.triggerRegionalFailover(region);
    fetchData();
  };

  if (loading && !health) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Global Control Plane...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Master Control</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Global Master Control</h2>
          <p className="text-muted-foreground font-medium italic">Authoritative oversight of multi-tenant institutional clusters, jurisdictional health, and systemic finality.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Sovereignty Mode: ACTIVE
           </div>
           <Button variant="outline" onClick={fetchData} className="bg-background shadow-md border-2 font-black h-14 px-6 uppercase tracking-widest hover:bg-muted transition-all">
              <RefreshCw className="h-4 w-4 mr-2" /> RE-SYNC INFRA
           </Button>
        </div>
      </div>

      {/* INFRASTRUCTURE KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { title: 'Provisioned Tenants', val: stats?.entities.total || 0, icon: Users, color: 'text-blue-600', sub: 'Institutional Nodes' },
          { title: 'Global Liquidity', val: formatCurrency(stats?.volume.total || 0), icon: Lock, color: 'text-emerald-600', sub: 'Escrow Depth' },
          { title: 'Compute Finality', val: '99.99%', icon: Zap, color: 'text-orange-600', sub: 'Cluster Availability' },
          { title: 'Network Pulse', val: health?.status?.toUpperCase(), icon: Activity, color: 'text-purple-600', sub: 'Oracle Sync: Active' },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-lg border-2 border-primary/5 bg-background h-full group hover:border-primary/20 transition-all rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.title}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-black tracking-tighter">{stat.val}</div>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* MULTI-TENANT INTENSITY MAP */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Tenant Matrix</CardTitle>
                  <CardDescription className="text-xs font-medium">Global mapping of tenant-specific trade velocity and regulatory compliance pass-rates.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase h-5 tracking-widest px-3 rounded-full">
                   {heatmap.length} NODES
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                   {heatmap.map((item) => (
                      <motion.div 
                        key={item.country}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-5 rounded-2xl border-2 transition-all hover:shadow-lg relative overflow-hidden"
                        style={{ borderColor: `rgba(var(--primary), ${item.intensity / 100})` }}
                      >
                         <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Database className="h-12 w-12" />
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

           <Card className="shadow-2xl border-none bg-slate-950 text-slate-300 overflow-hidden h-[450px] flex flex-col ring-1 ring-white/10 rounded-2xl">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-6 px-6">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-wide text-slate-100 flex items-center gap-3">
                       <Terminal className="h-4 w-4 text-emerald-500" />
                       Inter-Tenant System Log
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE STREAM
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 p-8 overflow-auto custom-scrollbar font-mono text-[11px] leading-relaxed">
                 <div className="space-y-2">
                    {logs.map((log) => (
                       <div key={log.id} className="flex gap-8 group hover:bg-slate-900/50 transition-colors py-1 rounded-md px-2">
                          <span className="text-slate-600 shrink-0 select-none">{format(new Date(log.createdAt), "HH:mm:ss.SSS")}</span>
                          <span className={cn(
                             "font-black uppercase w-16 shrink-0 text-center px-1 py-0.5 rounded text-[9px]",
                             log.level === 'error' ? "text-red-400 bg-red-400/10" : log.level === 'warning' ? "text-orange-400 bg-orange-400/10" : "text-blue-400 bg-blue-400/10"
                          )}>{log.level}</span>
                          <span className="text-emerald-500/90 font-black shrink-0 w-28 truncate">{log.service}:</span>
                          <span className="group-hover:text-slate-100 transition-colors truncate italic">"{log.message}"</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <History className="h-5 w-5 text-white" />
                    Strategic Governance
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90 italic">
                    "Platform telemetry indicates a systemic transition toward Tier 1 identity verification for 92% of active tenants. Suggest enabling mandatory ABAC for high-value corridors."
                 </p>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none">
                    CONFIGURE GLOBAL POLICIES
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b pb-8 px-6">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-wide">Operational Node Health</CardTitle>
                    <PulseIcon className="h-5 w-5 text-primary animate-pulse" />
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {nodes.map((node) => (
                       <div key={node.id} className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-5">
                             <div className={cn(
                                "h-12 w-12 rounded-2xl border-2 flex items-center justify-center shadow-inner",
                                node.status === 'active' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                             )}>
                                <Server className={cn("h-6 w-6", node.status === 'active' ? "text-green-600" : "text-red-600")} />
                             </div>
                             <div>
                                <p className="font-black text-xs uppercase tracking-tight font-mono">{node.id}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-60">{node.serviceName}</p>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                             <Badge variant="outline" className={cn(
                                "text-[8px] font-black uppercase h-5 px-1.5 border-none shadow-sm",
                                node.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                             )}>{node.status}</Badge>
                             <div className="w-16 h-0.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${node.load}%` }} />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all cursor-pointer">
              <ShieldAlert className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Disaster Recovery (DR)</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Regional clusters are geographically redundant. Triggering a failover will evacuate institutional workloads to the secondary cluster node in Zurich."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background" onClick={() => handleFailover('us-east-1')}>TRIGGER US-EAST FAILOVER</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
