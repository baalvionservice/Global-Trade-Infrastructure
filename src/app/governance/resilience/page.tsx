/**
 * @file resilience/page.tsx
 * @description Disaster Recovery & Operational Continuity Command Center.
 * Authoritative strategic observatory for platform survivability.
 */
'use client';

import { useEffect, useState } from 'react';
import { resilienceService, ServiceInstance } from '@/services/resilience-service';
import { healthService, SystemHealth } from '@/services/observability-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  Landmark,
  ArrowRight,
  Database,
  Lock,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function ResilienceCommandPage() {
  const [instances, setInstances] = useState<ServiceInstance[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    const inst = resilienceService.getInstances();
    const h = await healthService.getSystemHealth();
    setInstances(inst);
    setHealth(h);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFailover = (region: string) => {
    resilienceService.triggerRegionalFailover(region);
    toast({ 
      title: "Failover Sequence Authorized", 
      description: `Traffic evacuated from ${region}. Routing to secondary clusters.`,
      variant: 'destructive'
    });
    fetchData();
  };

  if (loading && !health) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Resilience Link...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign Survivability</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Resilience Command</h2>
          <p className="text-muted-foreground font-medium italic">High-fidelity oversight of disaster recovery orchestration, regional failover, and systemic continuity.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-emerald-700 border-emerald-200 font-black text-[10px] uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Infrastructure State: DETERMINISTIC
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* REGIONAL CLUSTER TOPOLOGY */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Distributed Node Topology</CardTitle>
                  <CardDescription className="text-xs font-medium">Real-time health and load monitoring across sovereign regional clusters.</CardDescription>
                </div>
                <Globe className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   {['us-east-1', 'eu-west-1', 'ap-southeast-1'].map(region => {
                      const regionNodes = instances.filter(i => i.region === region);
                      const isDown = regionNodes.every(n => n.status === 'down');
                      
                      return (
                         <div key={region} className={cn(
                            "p-8 rounded-2xl border-2 space-y-6 transition-all",
                            isDown ? "bg-red-50 border-red-200 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : "bg-muted/5 border-primary/5 hover:border-primary/20"
                         )}>
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{region} Cluster</span>
                               <Badge className={cn(
                                  "text-[8px] font-black uppercase h-5 border-none",
                                  isDown ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                               )}>{isDown ? 'OFFLINE' : 'HEALTHY'}</Badge>
                            </div>
                            <div className="space-y-4">
                               {regionNodes.map(node => (
                                  <div key={node.id} className="flex items-center justify-between p-3 bg-background rounded-2xl border shadow-sm">
                                     <div className="flex items-center gap-3">
                                        <Server className={cn("h-4 w-4", node.status === 'active' ? 'text-emerald-500' : 'text-red-500')} />
                                        <span className="text-[10px] font-mono font-bold uppercase">{node.id.split('-').pop()}</span>
                                     </div>
                                     <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${node.load}%` }} />
                                     </div>
                                  </div>
                                ))}
                            </div>
                            <Button 
                              variant="outline" 
                              className={cn(
                                "w-full h-12 border-2 font-black uppercase text-[10px] tracking-widest",
                                isDown ? "hidden" : ""
                              )}
                              onClick={() => handleFailover(region)}
                            >
                               AUTHORIZE FAILOVER
                            </Button>
                         </div>
                      );
                   })}
                </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* RESILIENCE ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Resilience Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "Continuity Engine: All institutional primary nodes are synchronized. Secondary standby clusters in Zurich are at 100% operational readiness. Zero recovery delta detected."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sync Finality</span>
                       <span className="text-sm font-black uppercase text-emerald-300">450ms</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Failover Latency</span>
                       <span className="text-sm font-black uppercase">~12.4s (EST)</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    EXECUTE RECOVERY SIMULATION
                 </Button>
              </CardContent>
           </Card>

           {/* CONTINUITY KPIS */}
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Strategic Survivability</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Uptime (Global)', val: '99.999%', icon: Activity },
                   { label: 'Node Redundancy', val: '3X (Sovereign)', icon: Database },
                   { label: 'Ledger Integrity', val: 'VERIFIED', icon: Lock }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-muted/50 border shadow-inner"><stat.icon className="h-4 w-4 text-primary" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
              <Network className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Multi-Cloud Interop</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Baalvion nodes are distributed across multi-sovereign cloud providers. Infrastructure state is determinantsitically replicated every 1s."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
