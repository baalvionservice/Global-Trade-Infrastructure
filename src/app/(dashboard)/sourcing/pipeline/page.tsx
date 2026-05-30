/**
 * @file sourcing/pipeline/page.tsx
 * @description High-authority procurement pipeline visualization. 
 * Maps sourcing mandates across the execution stages from defined requirements to hand-off.
 */
'use client';

import { useEffect, useState } from 'react';
import { getRfqs, RFQ, RFQStatus } from '@/services/rfq-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ChevronRight, 
  ArrowRight, 
  LayoutGrid, 
  GanttChartSquare,
  Box,
  TrendingUp,
  History,
  ShieldCheck,
  Zap,
  MoreVertical,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

const STAGES: { id: RFQStatus; label: string; color: string }[] = [
  { id: 'INTERNAL_REVIEW', label: 'Requirement Definition', color: 'bg-blue-500' },
  { id: 'OPEN', label: 'Supplier Discovery', color: 'bg-indigo-500' },
  { id: 'EVALUATION', label: 'Evaluation & Scoring', color: 'bg-orange-500' },
  { id: 'NEGOTIATION', label: 'Negotiation Node', color: 'bg-emerald-500' },
];

export default function SourcingPipelinePage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getRfqs().then(setRfqs).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Syncing Pipeline Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: PROCUREMENT_OPS_ALPHA</p>
           </div>
           <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Sourcing <br />Pipeline.</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
              <History className="mr-3 h-4 w-4" /> Pipeline Audit
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
              <Plus className="mr-3 h-4 w-4" /> Initiate Sourcing
           </Button>
        </div>
      </div>

      {/* KANBAN PIPELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {STAGES.map((stage) => {
           const items = rfqs.filter(r => r.status === stage.id);
           
           return (
             <div key={stage.id} className="flex flex-col gap-8">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-3">
                      <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]", stage.color.replace('bg-', 'text-'))} />
                      <h3 className="text-[11px] font-black uppercase tracking-wide text-foreground/80">{stage.label}</h3>
                   </div>
                   <Badge variant="outline" className="text-[9px] font-black h-5 border-2 bg-background">{items.length}</Badge>
                </div>

                <div className="flex flex-col gap-6 min-h-[500px]">
                   <AnimatePresence>
                      {items.map((rfq) => (
                        <motion.div 
                          key={rfq.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                           <Card 
                             className="shadow-xl border-2 border-primary/5 hover:border-primary/40 hover:shadow-2xl transition-all group cursor-pointer bg-background rounded-2xl overflow-hidden"
                             onClick={() => router.push(`${PATHS.BUYER_RFQS}/${rfq.id}`)}
                           >
                              <CardContent className="p-8 space-y-6">
                                 <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="text-[8px] font-black px-2 h-5 bg-muted border-none uppercase tracking-widest opacity-60">{rfq.category}</Badge>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity">
                                       <MoreVertical className="h-4 w-4" />
                                    </Button>
                                 </div>
                                 
                                 <div className="space-y-1">
                                    <h4 className="text-lg font-black uppercase tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors truncate">{rfq.productName || rfq.title}</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Ref: {rfq.id}</p>
                                 </div>

                                 <div className="p-4 rounded-2xl bg-muted/20 border-2 border-dashed space-y-3">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-60">
                                       <span>Contract Cap</span>
                                       <span className="text-primary">{formatCurrency(rfq.pricing?.target_price || rfq.targetPrice || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-60">
                                       <span>Node Target</span>
                                       <span className="text-foreground">{rfq.deliveryCountry || 'Global'}</span>
                                    </div>
                                 </div>

                                 <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                       <div className="flex -space-x-2">
                                          {[1, 2].map(i => (
                                             <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-black">P{i}</div>
                                          ))}
                                       </div>
                                       <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                                          {rfq.engagement?.quotes_received || 0} Bids
                                       </span>
                                    </div>
                                    <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                       <ArrowRight className="h-4 w-4" />
                                    </div>
                                 </div>
                              </CardContent>
                           </Card>
                        </motion.div>
                      ))}
                      {items.length === 0 && (
                        <div className="h-40 rounded-2xl border-2 border-dashed border-primary/5 flex items-center justify-center">
                           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-20">Queue Empty</p>
                        </div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
           );
        })}
      </div>

      {/* PIPELINE FOOTER INTELLIGENCE */}
      <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <GanttChartSquare className="h-64 w-64 brightness-0 invert" />
         </div>
         <CardContent className="p-16 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Sourcing Efficiency Matrix</h4>
               <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Autonomous <br />Throughput.</h3>
               <p className="text-xl font-medium leading-relaxed italic opacity-80 max-w-xl">
                 "Baalvion Pipeline Orchestration reduces procurement friction by 14.2% through deterministic stage-gating and real-time counterparty synchronization."
               </p>
            </div>
            <div className="grid grid-cols-2 gap-8 shrink-0">
               {[
                 { label: 'Avg Cycle Time', val: '4.2 Days', icon: Zap, color: 'text-yellow-400' },
                 { label: 'Mandate Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-400' },
                 { label: 'Network Depth', val: '14k Nodes', icon: LayoutGrid, color: 'text-blue-400' },
                 { label: 'Risk Factor', val: 'Minimal', icon: TrendingUp, color: 'text-indigo-400' }
               ].map(stat => (
                  <div key={stat.label} className="p-8 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-4">
                     <stat.icon className={cn("h-6 w-6", stat.color)} />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
                        <p className="text-2xl font-black tracking-tighter">{stat.val}</p>
                     </div>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>
    </main>
  );
}
