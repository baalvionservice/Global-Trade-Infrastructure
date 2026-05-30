/**
 * @file governance/workflow-builder/page.tsx
 * @description THE PROTOCOL DESIGNER.
 * Authoritative management center for trade transition rules and orchestration protocols.
 */
'use client';

import { GST_TRANSITION_MATRIX } from '@/core/gst';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  ShieldCheck, 
  History, 
  ArrowRight, 
  Plus, 
  Lock,
  Database,
  GitPullRequest,
  Scale,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ProtocolDesignerPage() {
  const domains = Object.keys(GST_TRANSITION_MATRIX).reduce((acc: any, key) => {
    const domain = key.split(':')[0];
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push({ from: key.split(':')[1], transitions: GST_TRANSITION_MATRIX[key] });
    return acc;
  }, {});

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">System Governance</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Protocol Designer</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative management of the Global System Truth (GST) transition matrix and commercial logic rules.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> REVISION HISTORY
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> DEFINE NEW RULE
           </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(domains).map(([domain, states]: any, dIdx) => (
          <div key={domain} className="space-y-8">
             <div className="flex items-center gap-4 px-4">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">{domain} DOMAIN</h3>
                <Badge variant="outline" className="text-[9px] font-black border-2 bg-background">{states.length} STATES</Badge>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {states.map((state: any, sIdx: number) => (
                  <Card key={state.from} className="shadow-lg border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                    <CardHeader className="bg-muted/10 border-b p-8">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Source State</p>
                             <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{state.from}</CardTitle>
                          </div>
                          <div className="p-3 rounded-2xl bg-background border-2 shadow-inner">
                             <Workflow className="h-5 w-5 text-primary opacity-40" />
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Valid State Transitions</p>
                          <div className="space-y-3">
                             {state.transitions.map((t: any, tIdx: number) => (
                                <div key={tIdx} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5 group/link hover:bg-primary/[0.03] transition-all">
                                   <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 rounded-xl bg-background border-2 flex items-center justify-center group-hover/link:scale-110 transition-transform">
                                         <ArrowRight className="h-4 w-4 text-primary opacity-60" />
                                      </div>
                                      <span className="text-sm font-black uppercase tracking-tight">{t.target.split(':')[1]}</span>
                                   </div>
                                   {t.requiredConsensus && (
                                      <div className="flex items-center gap-1">
                                         <Scale className="h-3 w-3 text-indigo-500" />
                                         <span className="text-[8px] font-black text-indigo-600 uppercase">Gated</span>
                                      </div>
                                   )}
                                </div>
                             ))}
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-950 text-white relative overflow-hidden group shadow-md border-2 border-white/5">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Lock className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">GST Integrity Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Deterministic State Logic. <br />Immutable Execution.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion OS enforces jurisdictional trade policies at the kernel layer. Every transition defined in the GST Matrix is cryptographically versioned and requires consensus authorization before being propagated to the active execution runtime, ensuring absolute regulatory finality."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Transition Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">DETERMINISTIC</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">SLA Integrity</p>
                  <p className="text-2xl font-black tracking-tighter">99.98%</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Chain Logic</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">VERIFIED</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
