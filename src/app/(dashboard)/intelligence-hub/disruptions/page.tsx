/**
 * @file disruptions/page.tsx
 * @description The Disruption Center command terminal.
 */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Siren, 
  History, 
  ArrowRight, 
  Loader2, 
  Zap, 
  Globe, 
  Activity,
  History as ReplayIcon,
  Search,
  Lock,
  Landmark,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function DisruptionCenterPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.INTELLIGENCE_HUB)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Command Hub
          </Button>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Disruption Center</h2>
            <p className="text-muted-foreground font-medium italic max-w-2xl">Autonomous monitoring and mitigation of trade bottlenecks and systemic failures.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-red-50 rounded-2xl border-2 border-red-100 text-xs font-black uppercase tracking-widest text-red-600 shadow-xl animate-in zoom-in duration-500">
              <Siren className="h-4 w-4 animate-pulse" />
              Intelligence Mode: ARMED
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* DISRUPTION CASE LEDGER */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-wide">Active Disruption Ledger</CardTitle>
                  <CardDescription className="text-xs font-medium mt-2">Real-time correlation of port congestion, customs holds, and logistics failures.</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-black border-2 h-6 uppercase px-4 rounded-full">4 CASES ACTIVE</Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {[
                      { id: 'DS-992', title: 'Port Congestion surge: Mumbai Hub', type: 'CONGESTION', delay: '+72h', severity: 'high', time: '14m ago' },
                      { id: 'DS-993', title: 'Identity Drift Block: Vietnam Node', type: 'SECURITY', delay: 'INF', severity: 'critical', time: '45m ago' },
                      { id: 'DS-994', title: 'Customs Hold Escalation: Shenzhen', type: 'REGULATORY', delay: '+48h', severity: 'medium', time: '2h ago' }
                    ].map((dispute, i) => (
                       <div key={dispute.id} className="p-6 flex items-start gap-8 group hover:bg-red-500/[0.01] transition-colors">
                          <div className={cn(
                             "h-12 w-16 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500",
                             dispute.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                          )}>
                             <ShieldAlert className={cn("h-6 w-6", dispute.severity === 'critical' ? 'text-red-600' : 'text-orange-600')} />
                          </div>
                          <div className="space-y-3 flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <Badge className="bg-slate-900 text-white text-[9px] font-black h-6 px-3 border-none shadow-lg tracking-widest">{dispute.type}</Badge>
                                <span className="text-[11px] font-mono text-muted-foreground opacity-40">CASE_REF: {dispute.id}</span>
                             </div>
                             <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{dispute.title}</h4>
                             <p className="text-sm font-medium leading-relaxed italic opacity-80 border-l-4 border-red-500/10 pl-6">"Autonomous Sentinel predicted this decay with 92% confidence."</p>
                          </div>
                          <div className="flex flex-col items-end gap-4 shrink-0 border-l-2 pl-12 border-muted/50">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black uppercase opacity-40 leading-none">Expected Delay</p>
                                <p className="text-3xl font-black tracking-tighter text-red-600 tabular-nums">{dispute.delay}</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border-2 opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all">
                                <ArrowRight className="h-5 w-5" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* MITIGATION ORACLE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Strategic Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90 leading-snug">
                    "AI Strategy Signal: Supply chain drift detected in the APAC-US corridor. Transition probability: 92%. Recommend rebalancing liquidity into Mumbai nodes."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[11px] tracking-widest shadow-md bg-white text-primary border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    EXECUTE BATCH REBALANCING
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Systemic Exposure</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Settlement Stress', val: '8.4%', icon: Activity, color: 'text-red-500' },
                   { label: 'Supply Resilience', val: '99.8%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Audit Readiness', val: 'Optimal', icon: History, color: 'text-indigo-500' }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className={cn("h-5 w-5", stat.color)} /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/40 transition-all duration-700">
              <ReplayIcon className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-tighter text-foreground">Operational Replay</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Launch high-fidelity operational digital twins to simulate rerouting strategies and identify jurisdictional bottlenecks."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background" onClick={() => router.push(PATHS.GOVERNANCE_SIMULATION)}>DEPLOY DIGITAL TWIN</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
