/**
 * @file deployment/page.tsx
 * @description THE GLOBAL DEPLOYMENT HUB. 
 * Authoritative strategic command for multi-region production rollouts and state activation.
 */
'use client';

import { useEffect, useState } from 'react';
import { deploymentService, RegionalDeployment } from '@/services/deployment-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  History, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Server,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function GlobalGoLivePage() {
  const [deployments, setDeployments] = useState<RegionalDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    const dList = await deploymentService.getRegionalStatus();
    setDeployments(dList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = async (region: string) => {
    setActivating(region);
    toast({ title: "Activation Initiated", description: `Authorizing production cutover for ${region}...` });
    try {
      await deploymentService.initiateGoLive(region, 'SOVEREIGN_ADMIN_ALPHA');
      toast({ title: "Region Activated", description: `${region} is now receiving production traffic.` });
      await fetchData();
    } catch (e) {
      toast({ variant: 'destructive', title: "Activation Refused" });
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Deployment Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Go-Live Command</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority management of production state activation, regional cutovers, and system stabilization finality.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Sovereign State: ACTIVATING
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* REGIONAL ROLLOUT MATRIX */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Rollout Matrix</CardTitle>
                  <CardDescription className="text-xs font-medium">Regional activation progress and cluster synchronization health.</CardDescription>
                </div>
                <Globe className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {deployments.map(dep => (
                       <div key={dep.id} className="p-6 flex flex-col gap-8 group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className={cn(
                                   "h-14 w-14 rounded-3xl border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                   dep.status === 'LIVE' || dep.status === 'STABLE' ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                                )}>
                                   <Server className={cn("h-7 w-7", dep.status === 'LIVE' || dep.status === 'STABLE' ? 'text-green-600' : 'text-blue-600')} />
                                </div>
                                <div className="space-y-1">
                                   <p className="font-black text-xl uppercase tracking-tighter leading-none">{dep.region}</p>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Phase: {dep.phase.replace('_', ' ')} • Traffic: {dep.trafficWeight}%</p>
                                </div>
                             </div>
                             <Badge variant="outline" className={cn(
                                "text-[10px] font-black uppercase h-8 px-4 rounded-full shadow-sm border-2",
                                dep.status === 'STABLE' ? "bg-green-50 text-green-700 border-green-200" : 
                                dep.status === 'ACTIVATING' ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" : "bg-muted"
                             )}>{dep.status}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                   <span>Cluster Health Index</span>
                                   <span>{dep.healthScore}%</span>
                                </div>
                                <Progress value={dep.healthScore} className="h-1.5 bg-muted" />
                             </div>
                             <div className="flex justify-end items-center gap-4">
                                {dep.status === 'PENDING' && (
                                   <Button className="h-12 px-8 font-black uppercase text-[10px] tracking-widest bg-primary rounded-2xl" onClick={() => handleActivate(dep.region)} disabled={activating === dep.region}>
                                      {activating === dep.region ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                                      ACTIVATE REGION
                                   </Button>
                                )}
                                {dep.status === 'ACTIVATING' && (
                                   <Button variant="destructive" className="h-12 px-8 font-black uppercase text-[10px] tracking-widest rounded-2xl" onClick={() => deploymentService.emergencyRollback(dep.region, 'MANUAL_ABORT')}>
                                      <ShieldAlert className="mr-2 h-4 w-4" /> ABORT ROLLOUT
                                   </Button>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* HYPERCARE OBSERVATORY */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Mission Assurance
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-xl font-bold italic leading-relaxed opacity-95">
                    "24/7 Hypercare Protocol Active. All jurisdictional nodes are monitored for millisecond-latency drift. Zero operational exceptions permitted during the stabilization window."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Stability</span>
                       <span className="text-sm font-black uppercase text-emerald-300">99.98%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Response SLA</span>
                       <span className="text-sm font-black uppercase">4.2s (GLOBAL)</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-3xl">
                    LAUNCH HYPERCARE RADAR
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <History className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-[-45deg]" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Cutover Runbook Replay</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Every production activation step is recorded in the immutable execution log. Final cutover artifacts are archived in the Sovereign Vault for audit."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">DOWNLOAD RUNBOOK LOG</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
