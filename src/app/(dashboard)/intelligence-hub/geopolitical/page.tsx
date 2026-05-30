/**
 * @file geopolitical/page.tsx
 * @description Geopolitical Monitoring & Sanctions Observatory terminal.
 */
'use client';

import { useEffect, useState } from 'react';
import { geopoliticalService } from '@/modules/intelligence/services/geopolitical.service';
import { GeopoliticalAlert } from '@/modules/intelligence/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  ShieldAlert, 
  Activity, 
  Loader2, 
  ArrowRight, 
  History, 
  MapPin,
  Compass,
  Zap,
  Search,
  ChevronLeft,
  Lock,
  Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function GeopoliticalMonitoringPage() {
  const [alerts, setAlerts] = useState<GeopoliticalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    geopoliticalService.getActiveAlerts().then(setAlerts).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.INTELLIGENCE_HUB)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Command Hub
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Geopolitical Radar</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority monitoring of jurisdictional conflict zones, trade restrictions, and sanctions propagation.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-700 shadow-sm animate-in zoom-in duration-500">
              <ShieldCheck className="h-4 w-4" />
              Sanctions Sync: ACTIVE
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ACTIVE ALERT STREAM */}
        <div className="lg:col-span-8 space-y-8">
           <AnimatePresence>
              {alerts.map((alert, i) => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-2xl border-2 hover:border-red-500/20 transition-all rounded-2xl overflow-hidden bg-background group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                       <div className={cn(
                          "md:w-3 transition-all duration-700",
                          alert.severity === 'critical' ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                       )} />
                       <div className="flex-1 p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                          <div className="space-y-6 flex-1 min-w-0">
                             <div className="flex items-center gap-6">
                                <Badge className={cn(
                                   "text-[9px] uppercase font-black tracking-widest px-3 h-6 border-none shadow-sm",
                                   alert.severity === 'critical' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                                )}>{alert.severity} RISK</Badge>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground opacity-40">
                                   <Globe className="h-3.5 w-3.5" /> Region: {alert.region}
                                </div>
                             </div>
                             <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{alert.title}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">ID: {alert.id} • Propagated: {new Date(alert.createdAt).toLocaleTimeString()} UTC</p>
                             </div>
                             <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-red-500/10 pl-8 max-w-2xl">"{alert.message}"</p>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 border-l-2 pl-12 border-muted/50 space-y-8">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Impact Index</p>
                                <p className="text-4xl font-black text-red-600 tracking-tighter tabular-nums">{alert.impactScore}%</p>
                             </div>
                             <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-primary border-2 border-transparent group-hover:border-primary/20 h-12 px-6 rounded-2xl transition-all">
                                ANALYZE NODES <ArrowRight className="ml-2 h-3 w-3" />
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* GEOPOLITICAL SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldAlert className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Adversarial Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90 leading-snug">
                    "Platform Oracle: Detected coordinated course deviations matching 'Blockade Bypass' behavioral patterns in the APAC-West corridor. System is ARMING for autonomous rebalancing."
                 </p>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-3xl">
                    REBALANCE GLOBAL WEIGHTS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Jurisdictional Pulse</h4>
              <div className="space-y-6">
                 {[
                   { label: 'Sanctions Finality', val: '100%', icon: Lock, color: 'text-indigo-600' },
                   { label: 'Conflict Density', val: 'Low', icon: Globe, color: 'text-blue-500' },
                   { label: 'Regulatory Drift', val: '0.04%', icon: Gavel, color: 'text-orange-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/40 transition-all duration-700">
              <Compass className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-40 transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-tighter text-foreground">Sovereign Graph Mapping</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Baalvion intelligence is currently mapping 14,240 cross-jurisdictional industrial nodes against the 2024 Strategic Restriction Registry."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
