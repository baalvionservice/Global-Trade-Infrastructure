/**
 * @file logistics-shipment/[id]/page.tsx
 * @description THE SHIPMENT MISSION CONTROL.
 * High-fidelity command center for a single trade asset lifecycle.
 */
'use client';

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { logisticsService } from '@/services/logistics-service';
import { logisticsIntelligence, ExecutionRiskProfile } from '@/services/intelligence/logistics-intelligence';
import { ShipmentNode, Milestone } from '@/types/institutional';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  Loader2, 
  Ship, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  History, 
  Activity,
  Radio,
  BrainCircuit,
  Thermometer,
  Droplets,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShipmentMissionControl() {
  const { id } = useParams();
  const router = useRouter();
  const [shipment, setShipment] = useState<ShipmentNode | null>(null);
  const [risk, setRisk] = useState<ExecutionRiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') return;
    const fetchData = async () => {
      const [sData, rData] = await Promise.all([
        logisticsService.getShipment(id),
        logisticsIntelligence.getExecutionRisk(id)
      ]);
      setShipment(sData);
      setRisk(rData);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handlePredict = async () => {
    setPredicting(true);
    await new Promise(r => setTimeout(r, 2000));
    setPredicting(false);
  };

  if (loading || !shipment) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Mission Link...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* MISSION HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/logistics-shipment')} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Control Tower
          </Button>
          <div className="space-y-3">
             <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Node</p>
                <Badge variant="outline" className="uppercase font-black text-[10px] px-4 py-1.5 border-2 shadow-sm rounded-full bg-background">
                  {shipment.id}
                </Badge>
             </div>
             <h2 className="text-4xl font-black tracking-tight text-foreground uppercase tracking-tighter leading-[0.9]">
               {shipment.origin.split(',')[0]} ↔ {shipment.destination.split(',')[0]}
             </h2>
          </div>
        </div>
        
        <div className="flex gap-4 pt-6 md:pt-0">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md group" onClick={handlePredict} disabled={predicting}>
            {predicting ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-3 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />}
            AI Delay Forecast
          </Button>
          <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
            <Radio className="mr-3 h-5 w-5" /> Live Tracking
          </Button>
        </div>
      </div>

      {/* TACTICAL DASHBOARD */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
           {/* LIVE TELEMETRY CLUSTER */}
           <Card className="shadow-2xl border-none bg-slate-950 text-slate-100 relative overflow-hidden rounded-2xl h-[550px]">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
              <CardContent className="h-full relative flex flex-col p-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-black uppercase tracking-wide text-emerald-400">Telemetry Stream: SECURE</span>
                       </div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Corridor Monitoring</h3>
                    </div>
                    <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-black h-6 px-3 uppercase tracking-widest backdrop-blur-md">NODE: {shipment.trackingNumber}</Badge>
                 </div>

                 <div className="flex-1 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                       <Globe className="h-64 w-64 text-primary opacity-20" />
                    </motion.div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {[
                      { icon: Thermometer, label: 'Ambient Temp', val: '22.4°C', color: 'text-orange-400' },
                      { icon: Droplets, label: 'Humidity', val: '45%', color: 'text-blue-400' },
                      { icon: Activity, label: 'G-Force/Shock', val: '0.1g', color: 'text-indigo-400' },
                      { icon: PackageCheck, label: 'Seal State', val: 'INTACT', color: 'text-emerald-400' }
                    ].map((stat, i) => (
                       <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group">
                          <div className="flex items-center justify-between mb-2">
                             <stat.icon className={cn("h-5 w-5", stat.color)} />
                             <span className="text-[9px] font-black uppercase text-white/40">{stat.label}</span>
                          </div>
                          <p className="text-xl font-black tabular-nums">{stat.val}</p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* MILESTONE TIMELINE */}
           <Card className="shadow-none border-2 bg-background rounded-2xl p-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-12 text-center">Execution Finality Sequence</h4>
              <div className="relative pl-10 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                 {shipment.milestones.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                       <div className={cn(
                          "absolute -left-[31px] top-1.5 h-6 w-6 rounded-full border-4 border-background bg-muted z-10",
                          m.isVerified && "bg-primary"
                       )} />
                       <div className="space-y-1">
                          <div className="flex items-center gap-4">
                             <p className="font-black text-sm uppercase tracking-tight">{m.status}</p>
                             <span className="text-[10px] font-mono opacity-40">{m.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium italic">"{m.notes || 'Automated state propagation from logistics node.'}"</p>
                          {m.evidenceHash && (
                            <div className="flex items-center gap-2 pt-2">
                               <Fingerprint className="h-3 w-3 text-emerald-600 opacity-40" />
                               <span className="text-[9px] font-mono opacity-20 select-all">{m.evidenceHash}</span>
                            </div>
                          )}
                       </div>
                    </motion.div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* RISK ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <BrainCircuit className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Operational Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-[1.1] opacity-95 tracking-tighter">
                    "AI Analysis: Systemic congestion in the Mumbai-Newark corridor is trending +14%. Predicted delay index: +42h. Recommend prioritizing customs-dossier audit now."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Delay Prob.</span>
                       <span className="text-4xl font-black text-emerald-300 block mt-2">22%</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Risk Score</span>
                       <span className="text-4xl font-black text-blue-300 block mt-2">LOW</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    INITIATE CORRIDOR BYPASS
                 </Button>
              </CardContent>
           </Card>

           {/* SHIPMENT ENTITY CONTEXT */}
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Metadata</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Carrier Node', val: shipment.carrierName, icon: Ship, color: 'text-primary' },
                   { label: 'Managed Value', val: formatCurrency(shipment.value, shipment.currency), icon: Landmark, color: 'text-emerald-500' },
                   { label: 'Jurisdictional HTS', val: shipment.metadata?.htsCode || '8541.43.00', icon: ShieldCheck, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter text-foreground truncate max-w-[120px]">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all">
              <History className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-[-45deg]" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Digital Twin Replay</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Access the high-fidelity operational digital twin to simulate contingency routing and predict systemic impact of current delays."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">LAUNCH SIMULATION</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}

function Landmark(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/></svg>
}
