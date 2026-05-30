'use client';

/**
 * @file governance/ecosystem/page.tsx
 * @description Planetary Economic Brain Visualization.
 * High-authority command console for the Global Trade Ecosystem Map.
 */

import { EcosystemGraph } from '@/app/(dashboard)/_components/ecosystem-graph';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Network, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Globe, 
  ArrowRight, 
  ChevronLeft,
  Search,
  Database,
  Lock,
  Workflow,
  Compass,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion } from 'framer-motion';

export default function EcosystemVisualizationPage() {
  const router = useRouter();

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen selection:bg-primary selection:text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-6">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-transparent hover:text-primary transition-all"
            onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-white leading-none">Ecosystem Matrix</h2>
             <p className="text-slate-400 font-medium italic max-w-2xl text-lg">Real-time planetary mapping of institutional nodes, commercial relationships, and sovereign trade flows.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end gap-1 px-8 border-r border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Network Consensus</span>
              <span className="text-2xl font-black text-emerald-400 tabular-nums">99.98% Aligned</span>
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary hover:scale-105 transition-all">
              <Zap className="mr-2 h-4 w-4" /> RE-SCAN TOPOLOGY
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* MAIN VISUALIZATION workspace */}
        <div className="lg:col-span-5 space-y-6">
           <EcosystemGraph />

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Relational Density', val: '4,240', sub: 'Active Edges', icon: Network, color: 'text-blue-500' },
                { label: 'Node Availability', val: '100%', sub: 'All Clusters Live', icon: Server, color: 'text-emerald-500' },
                { label: 'Signal Velocity', val: '450ms', sub: 'Cross-Domain Sync', icon: Zap, color: 'text-primary' }
              ].map(stat => (
                <Card key={stat.label} className="shadow-none border-none bg-slate-900/40 rounded-2xl p-6 hover:bg-white/5 transition-all group">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 group-hover:bg-primary/20 transition-all">
                         <stat.icon className={cn("h-5 w-5", stat.color)} />
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-slate-500">Real-time</Badge>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                      <p className="text-3xl font-black tracking-tighter text-white">{stat.val}</p>
                   </div>
                   <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-tighter italic">{stat.sub}</p>
                </Card>
              ))}
           </div>
        </div>

        {/* SIDEBAR: SYSTEMIC INSIGHTS */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-white relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-150">
                 <Workflow className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 animate-pulse" />
                    Singularity Observer
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-95">
                    "Ecosystem Mapping: Institutional clustering in the Mumbai-Newark corridor is approaching peak density. Recommending autonomous provisioning of secondary settlement nodes."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Graph Equilibrium</span>
                       <span className="text-base font-black text-emerald-300">STABLE</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Edge Consistency</span>
                       <span className="text-base font-black text-blue-300">99.98%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-widest shadow-2xl bg-white text-primary border-none rounded-3xl">
                    ADJUST TOPOLOGY WEIGHTS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border border-white/5 bg-slate-900/30 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Live Infrastructure Feed</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Registry Synchronization', status: 'Optimal', icon: Database },
                   { label: 'Inter-Node Handshakes', status: 'Continuous', icon: Globe },
                   { label: 'Liability Propagation', status: 'Locked', icon: Lock }
                 ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/5 border border-white/5"><item.icon className="h-4 w-4 text-primary" /></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                       </div>
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2 h-5 rounded-full">{item.status}</Badge>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border border-white/5 bg-slate-900/30 p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-500">
              <Compass className="h-14 w-14 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-slate-300">Predictive Routing</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-4">
                    "Baalvion intelligence is currently modeling 1,240 alternate trade routes. Zero systemic friction predicted for the next 48h cycle."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
