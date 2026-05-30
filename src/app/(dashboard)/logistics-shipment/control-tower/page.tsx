'use client';

/**
 * @file control-tower/page.tsx
 * @description THE GLOBAL SUPPLY-CHAIN CONTROL TOWER.
 * High-authority strategic command for trade velocity and corridor finality.
 */

import { useEffect, useState } from 'react';
import { freightOrchestrator } from '@/modules/logistics/services/freight-orchestrator';
import { useLogisticsStore } from '@/modules/logistics/store/logistics-command.store';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
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

  const [corridors, setCorridors] = useState(0);
  const [telemetry, setTelemetry] = useState<{ density: number; latency: number | null; finality: number | null; readiness: number | null; nodeStatus: string }>(
    { density: 0, latency: null, finality: null, readiness: null, nodeStatus: '—' }
  );

  const fetchData = async () => {
    // Live logistics event store: real freight mandates from trade-service shipments,
    // plus genuinely-measured platform telemetry from /system/{pulse,readiness}.
    try {
      const [res, pulseRes, readyRes] = await Promise.all([
        apiClient.get<any[]>('/shipments', { sortBy: 'updatedAt', order: 'desc' }),
        apiClient.get<any>('/system/pulse').catch(() => null),
        apiClient.get<any>('/system/readiness').catch(() => null),
      ]);
      const shipments = toList<any>(res);
      const mandates = shipments.map((s) => ({
        id: `M-${s.tracking_number || s.id}`,
        orderId: s.order_id ? `ORD-${s.order_id}` : '—',
        carrierId: s.carrier_name || s.carrier_id || 'CARRIER',
        status: String(s.status || 'booked').toUpperCase(),
        transportMode: (s.vessel_name || /sea|ocean|port/i.test(`${s.origin} ${s.destination}`) ? 'OCEAN' : 'AIR') as 'OCEAN' | 'AIR',
        weightKg: Number(s.weight_kg) || 0,
        value: Number(s.value) || 0,
        currency: s.currency || 'USD',
        updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
      }));
      setMandates(mandates as any);
      const dest = new Set(shipments.map((s) => String(s.destination || '').split(',').pop()!.trim()).filter(Boolean));
      setCorridors(dest.size);

      // Real corridor utilization: in-flight shipments / total fleet.
      const inFlight = shipments.filter((s) => !['delivered', 'cancelled'].includes(String(s.status || '').toLowerCase())).length;
      const density = shipments.length ? Math.round((inFlight / shipments.length) * 100) : 0;
      const pulse = pulseRes?.data ?? pulseRes ?? null;
      const ready = readyRes?.data ?? readyRes ?? null;
      setTelemetry({
        density,
        latency: pulse ? Number(pulse.finalityDelay) : null,
        finality: pulse ? Number(pulse.stabilityScore) : null,
        readiness: ready ? Number(ready.score) : null,
        nodeStatus: ready ? String(ready.status || '—') : '—',
      });
    } catch {
      /* leave prior mandates on transient error */
    } finally {
      setLoading(false);
    }
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
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Logistical Nervous System...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Service Node: LOGISTICS_CORE_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Control Tower.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of freight finality, intermodal handshakes, and jurisdictional corridor health."
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-400 shadow-md">
              <ShieldCheck className="h-5 w-5" />
              Lane Equilibrium: LOCKED
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Globe className="mr-3 h-5 w-5" /> Global Asset Map
           </Button>
        </div>
      </div>

      {/* STRATEGIC LOGISTICS KPIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Mandates', val: activeMandates.length, sub: 'In Execution', icon: Workflow, color: 'text-blue-500' },
          { label: 'Corridor Density', val: `${telemetry.density}%`, sub: 'Fleet in transit', icon: Anchor, color: 'text-emerald-500' },
          { label: 'Signal Latency', val: telemetry.latency != null ? `${telemetry.latency}ms` : '—', sub: 'Finality edge sync', icon: Activity, color: 'text-orange-500' },
          { label: 'Finality Health', val: telemetry.finality != null ? `${telemetry.finality}%` : '—', sub: 'Stability score', icon: Target, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10 p-8">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wide">{kpi.label}</CardTitle>
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* CORRIDOR TOPOLOGY (SIMULATED) */}
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[600px] relative group">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
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
              <div className="relative text-center space-y-6">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                    <Globe className="h-64 w-64 text-primary opacity-20" />
                 </motion.div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Ship className="h-12 w-12 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">{corridors} Active Corridor{corridors === 1 ? '' : 's'} Synced</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Node Finality: DETERMINISTIC</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* SIDEBAR: LOGISTICS INTEL */}
        <div className="lg:col-span-4 space-y-6">
           {/* DISRUPTION ORACLE */}
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl h-[350px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Radio className="h-6 w-6 text-white animate-pulse" />
                    Strategic Logistics Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Lane Insight: 14% congestion spike detected in the Mumbai hub. Predicted delay index: +42h. Recommending autonomous corridor rebalancing via Singapore node."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE CORRIDOR BYPASS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Ecosystem finality</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Milestone Finality', val: telemetry.finality != null ? `${telemetry.finality}%` : '—', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Platform Readiness', val: telemetry.readiness != null ? `${telemetry.readiness}%` : '—', icon: Workflow, color: 'text-blue-500' },
                   { label: 'Node Availability', val: telemetry.nodeStatus === 'READY' ? 'Active' : telemetry.nodeStatus, icon: Server, color: 'text-indigo-500' }
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
