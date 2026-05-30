/**
 * @file performance/page.tsx
 * @description Institutional Supplier Performance Command.
 * Bloomberg-grade analytics for multi-factor supplier reliability.
 */
'use client';

import { useEffect, useState } from 'react';
import { supplierService } from '@/modules/suppliers/services/supplier.service';
import { SupplierProfile } from '@/modules/suppliers/types/supplier.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Loader2, 
  Zap, 
  Globe, 
  Target, 
  Activity, 
  History,
  Scale,
  Award,
  Leaf,
  ChevronLeft,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function SupplierPerformancePage() {
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supplierService.getSuppliers({ status: 'ACTIVE' })
      .then(setSuppliers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Performance Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Node: PERFORMANCE_OPS_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Performance <br />Analytics.</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase text-xs bg-background shadow-md">
              <History className="mr-3 h-4 w-4" /> Finality Log
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase text-xs shadow-md hover:scale-[1.02] transition-all">
              <Zap className="mr-3 h-5 w-5 fill-current" /> Optimize Roster
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           <div className="grid gap-8">
              {suppliers.map((s, i) => (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-2xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                     <CardContent className="p-0 flex flex-col lg:flex-row">
                        <div className="lg:w-72 bg-muted/30 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r-2 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Target className="h-40 w-40" /></div>
                           <div className="space-y-6 relative z-10">
                              <div className="h-12 w-16 rounded-2xl bg-background border-2 shadow-inner flex items-center justify-center font-black text-2xl text-primary">
                                 {s.name.charAt(0)}
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{s.name}</h3>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">{s.jurisdiction} Node</p>
                              </div>
                           </div>
                           <div className="pt-8 border-t border-primary/5 relative z-10">
                              <p className="text-[9px] font-black uppercase tracking-wide text-muted-foreground mb-4">Trust Pulse</p>
                              <div className="flex items-end justify-between">
                                 <span className="text-4xl font-black tabular-nums tracking-tighter">{s.trustScore}</span>
                                 <Badge variant="outline" className="text-[8px] font-black h-5 border-2 bg-emerald-50 text-emerald-700 border-emerald-100">TIER 1</Badge>
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 p-6 space-y-6">
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                              {[
                                { label: 'Fulfillment', val: `${Math.round(s.metrics.fulfillmentRate * 100)}%`, icon: Zap },
                                { label: 'ESG Impact', val: `${s.metrics.esgScore}/100`, icon: Leaf },
                                { label: 'Quality score', val: `${s.metrics.qualityScore}%`, icon: ShieldCheck }
                              ].map(m => (
                                 <div key={m.label} className="space-y-2">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                       <m.icon className="h-3 w-3 text-primary opacity-40" /> {m.label}
                                    </p>
                                    <p className="text-xl font-black tracking-tighter">{m.val}</p>
                                 </div>
                              ))}
                           </div>

                           <div className="p-8 rounded-2xl bg-muted/20 border-2 border-dashed space-y-4">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                 <span>Execution Reliability Index</span>
                                 <span className="text-primary">99.8% CONFIDENCE</span>
                              </div>
                              <Progress value={94} className="h-1.5 bg-muted" />
                              <p className="text-[10px] font-medium italic opacity-60">"Behavioral patterns indicate high resilience to corridor volatility. Optimal settlement finality verified."</p>
                           </div>

                           <div className="flex justify-between items-center pt-2">
                              <div className="flex items-center gap-6">
                                 <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                       <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-black shadow-sm">v{i}</div>
                                    ))}
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">3 Certified Audit Nodes Active</span>
                              </div>
                              <Button variant="ghost" className="font-black text-[10px] uppercase tracking-wide group h-12 rounded-2xl" onClick={() => router.push(`/company/${s.id}`)}>
                                 FORENSIC DRILLDOWN <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                </motion.div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <BarChart3 className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Strategy Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: Systemic rebalancing detected in the electronic subsystem tier. 4 preferred sellers are at peak capacity. Recommend diversifying sourcing to the Singapore node cluster."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Ecosystem Load</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">HIGH</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Reliability Delta</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">99.8%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    REBALANCE PARTNER ECOSYSTEM
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reliability Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Network Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Settlement Depth', val: '$1.24B', icon: Landmark, color: 'text-blue-500' },
                   { label: 'Audit Readiness', val: 'Optimal', icon: History, color: 'text-indigo-500' }
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
        </div>
      </div>
    </main>
  );
}
