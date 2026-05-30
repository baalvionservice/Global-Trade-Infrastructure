/**
 * @file logistics-shipment/page.tsx
 * @description THE GLOBAL LOGISTICS CONTROL TOWER.
 * High-authority strategic command for trade velocity and corridor finality.
 */
'use client';

import { useEffect, useState } from 'react';
import { logisticsService } from '@/services/logistics-service';
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
  ArrowRight, 
  Truck, 
  Anchor, 
  Ship, 
  MapPin,
  AlertTriangle,
  Siren,
  Search,
  Plus
} from 'lucide-react';
import { cn, formatCurrency, getFlag } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function LogisticsControlTowerPage() {
  const [pulse, setPulse] = useState<any>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const [pData, eData] = await Promise.all([
        logisticsService.getGlobalFulfillmentPulse(),
        logisticsService.getOperationalExceptions()
      ]);
      setPulse(pData);
      setExceptions(eData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Operational Telemetry...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* CONTROL TOWER HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: LOGISTICS_CONTROL_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Execution <br />Control Tower.</h2>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <Globe className="mr-3 h-4 w-4" /> Global Corridor Scan
          </Button>
          <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all" onClick={() => router.push(`${PATHS.LOGISTICS_SHIPMENT}/booking`)}>
            <Plus className="mr-3 h-5 w-5" /> Book Cargo Node
          </Button>
        </div>
      </div>

      {/* STRATEGIC METRICS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'In Transit', val: pulse.inTransit, sub: 'High-Velocity Nodes', icon: Truck, color: 'text-blue-600' },
          { label: 'Customs Gated', val: pulse.customsPending, sub: 'Sovereign Audit', icon: ShieldCheck, color: 'text-orange-600' },
          { label: 'Arrivals (24h)', val: pulse.deliveredToday, sub: 'Execution Finality', icon: Anchor, color: 'text-emerald-600' },
          { label: 'Asset Value', val: formatCurrency(pulse.totalAssetValue), sub: 'Total Managed Risk', icon: Zap, color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-lg border-2 border-primary/5 bg-background h-full group hover:border-primary/20 transition-all rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="text-4xl font-black tracking-tighter tabular-nums">{stat.val}</div>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60 italic">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* GLOBAL EXECUTION MAP (Tactical) */}
           <Card className="shadow-none border-2 bg-slate-950 rounded-2xl overflow-hidden flex flex-col h-[600px] relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Planetary Logistics Topology</CardTitle>
                  <CardDescription className="text-slate-400 font-medium italic">High-fidelity visualization of active corridors and container telemetry.</CardDescription>
                </div>
                <Globe className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0 flex-1 flex items-center justify-center relative">
                 {/* This would be a high-perf map component in production */}
                 <div className="relative text-center space-y-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                       <Globe className="h-64 w-64 text-primary opacity-20" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Ship className="h-10 w-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">14 Active Corridors Synced</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Node Finality: LOCKED</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* ACTIVE SHIPMENTS GRID */}
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b p-6">
                 <CardTitle className="text-lg font-black uppercase tracking-tighter">Operational Execution Registry</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {[
                      { id: 'SHP-4421', status: 'IN_TRANSIT', origin: 'Shanghai', dest: 'Long Beach', eta: '4d', health: 98 },
                      { id: 'SHP-9912', status: 'PORT_PROCESSING', origin: 'Mumbai', dest: 'Rotterdam', eta: '12d', health: 84 },
                      { id: 'SHP-8812', status: 'CUSTOMS_CLEARANCE', origin: 'Ho Chi Minh', dest: 'Newark', eta: '2d', health: 62 },
                    ].map((shp) => (
                       <div key={shp.id} className="p-6 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors" onClick={() => router.push(`${PATHS.LOGISTICS_SHIPMENT}/${shp.id}`)}>
                          <div className="flex items-center gap-8">
                             <div className="h-12 w-16 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <Ship className="h-8 w-8 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1.5">
                                <div className="flex items-center gap-4">
                                   <p className="font-black text-xl uppercase tracking-tighter leading-none">{shp.id}</p>
                                   <Badge className="bg-primary text-white text-[8px] font-black h-5 px-2 border-none shadow-lg tracking-widest">{shp.status}</Badge>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{shp.origin} ↔ {shp.dest} • ETA: {shp.eta}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right hidden sm:block space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Finality Index</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tighter">{shp.health}%</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-20 group-hover:opacity-100 transition-all">
                                <ArrowRight className="h-6 w-6" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* EXCEPTION & AI SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
           {/* EXCEPTION QUEUE */}
           <Card className="shadow-2xl border-none bg-red-600 text-white relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <AlertTriangle className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Siren className="h-5 w-5 text-white animate-pulse" />
                    Critical Exceptions
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <AnimatePresence mode="wait">
                    {exceptions.length > 0 ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">{exceptions[0].type}</h3>
                          <p className="text-base font-bold italic leading-relaxed opacity-90">"{exceptions[0].message}"</p>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                                <p className="text-[9px] font-black uppercase opacity-60">Status</p>
                                <p className="text-sm font-black uppercase">{exceptions[0].status}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                                <p className="text-[9px] font-black uppercase opacity-60">SLA Breach</p>
                                <p className="text-sm font-black uppercase">DETECTED</p>
                             </div>
                          </div>
                          <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-md bg-white text-red-600 border-none rounded-2xl">
                             OPEN ADJUDICATION DESK
                          </Button>
                       </motion.div>
                    ) : (
                       <div className="py-20 text-center space-y-4">
                          <ShieldCheck className="h-12 w-16 mx-auto opacity-30" />
                          <p className="text-[10px] font-black uppercase tracking-wide opacity-60">Zero Systemic Disruptions</p>
                       </div>
                    )}
                 </AnimatePresence>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Corridor Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Network Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Carrier Density', val: 'High', icon: Ship, color: 'text-blue-500' },
                   { label: 'Milestone Sync', val: '140ms', icon: Activity, color: 'text-indigo-500' }
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

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all cursor-pointer">
              <Activity className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">SLA Governance</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Platform monitors 14,240 operational commitments. Autonomous alerts are triggered upon 90% threshold expiration."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}

