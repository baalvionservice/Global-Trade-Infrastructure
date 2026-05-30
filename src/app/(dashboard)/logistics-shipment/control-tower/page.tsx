'use client';

/**
 * @file control-tower/page.tsx
 * @description THE GLOBAL SUPPLY-CHAIN CONTROL TOWER.
 * High-authority strategic command for trade velocity and corridor finality.
 */

import { useEffect, useState } from 'react';
import { freightOrchestrator } from '@/modules/logistics/services/freight-orchestrator';
import { useLogisticsStore } from '@/modules/logistics/store/logistics-command.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Loader2, 
  Anchor, 
  Ship, 
  Truck,
  AlertTriangle,
  Radio,
  Compass,
  History,
  Lock,
  Search,
  Server,
  Workflow,
  Target
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupplyChainControlTower() {
  const { activeMandates, portNodes, anomalies, setMandates, setPortNodes, addAnomaly } = useLogisticsStore();
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // In production, this targets the high-scale logistics event store
    const mockMandates = [
      { id: 'M-4421', orderId: 'ORD-9921', carrierId: 'MAERSK', status: 'IN_TRANSIT', transportMode: 'OCEAN' as const, weightKg: 24000, value: 350000, currency: 'USD', updatedAt: new Date().toISOString() },
      { id: 'M-8812', orderId: 'ORD-3301', carrierId: 'DHL', status: 'PICKED_UP', transportMode: 'AIR' as const, weightKg: 1200, value: 85000, currency: 'USD', updatedAt: new Date().toISOString() }
    ];
    setMandates(mockMandates as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && activeMandates.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Syncing Logistical Nervous System...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-12 p-4 md:p-12 bg-slate-950 text-slate-100 min-h-screen">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Service Node: LOGISTICS_CORE_ALPHA</p>
          </div>
          <h2 className="text-6xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Control Tower.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of freight finality, intermodal handshakes, and jurisdictional corridor health."
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-400 shadow-3xl">
              <ShieldCheck className="h-5 w-5" />
              Lane Equilibrium: LOCKED
           </div>
           <Button className="h-16 px-12 bg-primary text-white font-black shadow-4xl hover:scale-105 transition-all rounded-2xl uppercase tracking-[0.2em] text-xs">
              <Globe className="mr-3 h-5 w-5" /> Global Asset Map
           </Button>
        </div>
      </div>

      {/* STRATEGIC LOGISTICS KPIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Mandates', val: activeMandates.length, sub: 'In Execution', icon: Workflow, color: 'text-blue-500' },
          { label: 'Port Density', val: '62%', sub: 'Global Terminals', icon: Anchor, color: 'text-emerald-500' },
          { label: 'Signal Latency', val: '142ms', sub: 'IoT Edge Sync', icon: Activity, color: 'text-orange-500' },
          { label: 'Finality Success', val: '99.98%', sub: 'Milestone Pass', icon: Target, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-none bg-slate-900/60 rounded-[32px] group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10 p-8">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter text-white tabular-nums">{kpi.val}</div>
                  <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-widest italic">{kpi.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* CORRIDOR TOPOLOGY (SIMULATED) */}
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/40 rounded-[48px] overflow-hidden flex flex-col h-[600px] relative group">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-10 flex flex-row items-center justify-between z-10">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Planetary Logistics Topology</CardTitle>
                 <CardDescription className="text-slate-400 font-medium italic">High-fidelity visualization of active freight corridors and intermodal handoff nodes.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> SATELLITE_LINK: OPTIMAL
                 </div>
              </div>
           </CardHeader>
           <CardContent className="p-0 flex-1 flex items-center justify-center relative">
              <div className="relative text-center space-y-10">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                    <Globe className="h-64 w-64 text-primary opacity-20" />
                 </motion.div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Ship className="h-12 w-12 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-400">14 Active Corridors Synced</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Node Finality: DETERMINISTIC</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* SIDEBAR: LOGISTICS INTEL */}
        <div className="lg:col-span-4 space-y-10">
           {/* DISRUPTION ORACLE */}
           <Card className="shadow-4xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-[48px] h-[350px]">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-12">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-6 text-white">
                    <Radio className="h-6 w-6 text-white animate-pulse" />
                    Strategic Logistics Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 relative space-y-10">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Lane Insight: 14% congestion spike detected in the Mumbai hub. Predicted delay index: +42h. Recommending autonomous corridor rebalancing via Singapore node."
                 </p>
                 <Button variant="secondary" className="w-full h-20 font-black uppercase text-[12px] tracking-[0.4em] shadow-3xl bg-white text-primary border-none rounded-[20px] hover:scale-[1.02] transition-transform">
                    EXECUTE CORRIDOR BYPASS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-12 space-y-12 rounded-[48px]">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 ml-1">Ecosystem finality</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-10">
                 {[
                   { label: 'Milestone Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Intermodal Sync', val: '100%', icon: Workflow, color: 'text-blue-500' },
                   { label: 'Node Availability', val: 'Active', icon: Server, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-white tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
