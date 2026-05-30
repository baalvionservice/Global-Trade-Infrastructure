/**
 * @file src/app/(dashboard)/governance/events/page.tsx
 * @description The Global Event Command Center. 
 * High-authority observatory for planetary event orchestration and institutional signals.
 */
'use client';

import { useEffect, useState } from 'react';
import { eventBus, PlatformEvent } from '@/orchestration/event-bus';
import { useEventStore } from '@/modules/events/store/event.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Activity, 
  Loader2, 
  History, 
  ArrowRight, 
  Terminal, 
  Globe, 
  Radio, 
  Siren,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Lock,
  Workflow,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function EventCommandCenterPage() {
  const { liveStream, addEvent, clearStream, isStreaming, toggleStream } = useEventStore();
  const [filter, setFilter] = useState<'all' | 'CRITICAL' | 'WARNING'>('all');

  useEffect(() => {
    // Connect to the global event mesh
    const handler = (payload: any) => {
       // In production, payload would be the full PlatformEvent object from a WebSocket
       // Here we simulate the expansion
    };

    eventBus.subscribe('*', (payload) => {
       const mockEvent: PlatformEvent = {
         id: `EVT-${Math.random().toString(36).substring(7).toUpperCase()}`,
         type: 'CROSS_LAYER_CONTEXT_PROPAGATED',
         severity: Math.random() > 0.9 ? 'CRITICAL' : 'INFO',
         payload,
         source: 'CORE_KERNEL',
         timestamp: new Date().toISOString(),
         correlationId: 'IDEM-992'
       };
       if (isStreaming) addEvent(mockEvent);
    });
  }, [addEvent, isStreaming]);

  const filteredEvents = liveStream.filter(e => {
    if (filter === 'all') return true;
    return e.severity === filter;
  });

  return (
    <main className="flex-1 space-y-12 p-4 md:p-12 bg-slate-950 text-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Service Node: EVENT_MESH_ALPHA</p>
          </div>
          <h2 className="text-6xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Signal <br />Observatory.</h2>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button variant="outline" className="h-16 px-8 border-white/10 bg-white/5 font-black uppercase text-xs tracking-widest group" onClick={() => toggleStream(!isStreaming)}>
              {isStreaming ? <Radio className="mr-3 h-4 w-4 text-emerald-400 animate-pulse" /> : <RefreshCw className="mr-3 h-4 w-4" />}
              {isStreaming ? 'Stream Active' : 'Stream Paused'}
           </Button>
           <Button variant="outline" className="h-16 px-8 border-white/10 bg-white/5 font-black uppercase text-xs tracking-widest group" onClick={clearStream}>
              <Trash2 className="mr-3 h-4 w-4 opacity-40 group-hover:text-red-400 transition-colors" /> Flush Ledger
           </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* LIVE TERMINAL */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="shadow-none border-none bg-slate-900/40 rounded-[48px] overflow-hidden flex flex-col h-[700px] relative">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-10 flex flex-row items-center justify-between z-10">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Planetary Event Stream</CardTitle>
                  <CardDescription className="text-slate-400">High-fidelity trace of global institutional signals and kernel transitions.</CardDescription>
                </div>
                <div className="flex gap-2">
                   {['all', 'CRITICAL', 'WARNING'].map(f => (
                      <Button 
                        key={f} 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFilter(f as any)}
                        className={cn(
                           "text-[9px] font-black uppercase tracking-widest px-4 h-8 rounded-full transition-all border border-transparent",
                           filter === f ? "bg-white/10 border-white/20 text-white" : "text-slate-500"
                        )}
                      >
                         {f}
                      </Button>
                   ))}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar bg-slate-950/20 z-10 font-mono text-[11px] leading-relaxed">
                 <div className="p-10 space-y-3">
                    <AnimatePresence initial={false}>
                       {filteredEvents.map((event) => (
                          <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-10 group hover:bg-white/5 py-1.5 px-3 rounded transition-colors"
                          >
                             <span className="text-slate-600 shrink-0 select-none">{format(new Date(event.timestamp), "HH:mm:ss.SSS")}</span>
                             <span className={cn(
                                "font-black uppercase w-20 shrink-0 text-center rounded px-1",
                                event.severity === 'CRITICAL' ? "text-red-400 bg-red-400/10" : 
                                event.severity === 'WARNING' ? "text-orange-400 bg-orange-400/10" : "text-blue-400 bg-blue-400/10"
                             )}>[{event.severity}]</span>
                             <span className="text-emerald-500 font-bold shrink-0">{event.source}:</span>
                             <span className="text-slate-300 truncate italic">SIGNAL::{event.type}</span>
                             <span className="ml-auto text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity select-all">{event.correlationId}</span>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                    {filteredEvents.length === 0 && (
                       <div className="h-full flex flex-col items-center justify-center py-40 gap-6 opacity-20">
                          <Activity className="h-16 w-16" />
                          <p className="text-sm font-black uppercase tracking-[0.5em]">Awaiting Signals...</p>
                       </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: MESH HEALTH */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="shadow-4xl border-none bg-primary text-white relative overflow-hidden group rounded-[48px]">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-10">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-4">
                    <Cpu className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Mesh Orchestrator
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 relative space-y-12">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "System Pulse: Event propagation finality is at 99.98%. 14 regional brokers are synchronized. Recommending autonomous shard scaling for the APAC corridor."
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-[24px] bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Throughput</span>
                       <span className="text-xl font-black text-emerald-300 block mt-2">12.4k ops/s</span>
                    </div>
                    <div className="p-6 rounded-[24px] bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Latency</span>
                       <span className="text-xl font-black text-blue-300 block mt-2">140ms</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-18 font-black uppercase text-[12px] tracking-[0.4em] shadow-3xl bg-white text-primary border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    RE-SHARD EVENT FABRIC
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-10 space-y-12 rounded-[48px]">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1">Orchestration Health</h4>
              <div className="space-y-10">
                 {[
                   { label: 'Broker Finality', val: '100%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Active Consumers', val: '420', icon: Users, color: 'text-blue-500' },
                   { label: 'Backpressure', val: 'Optimal', icon: Activity, color: 'text-indigo-500' }
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

           <Card className="shadow-none border-none bg-slate-900/30 p-12 text-center space-y-6 rounded-[48px] border-dashed border-white/5 group hover:border-primary/20 transition-all duration-700">
              <History className="h-14 w-14 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-tighter text-slate-300">Replay Architecture</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-4">
                    "The Baalvion Mesh supports infinite event-stream replay for forensic disaster recovery. All regional shards are version-synced every 1s."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-[0.2em] bg-slate-900/50 hover:bg-slate-800 text-white">RECONSTRUCT STATE FROM LOG</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
