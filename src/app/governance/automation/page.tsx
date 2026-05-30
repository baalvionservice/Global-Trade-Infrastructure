/**
 * @file governance/automation/page.tsx
 * @description THE PROCESS INTELLIGENCE COMMAND CENTER.
 * Monitors autonomous orchestration health and active workflow triggers.
 */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Activity, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  Workflow, 
  Terminal,
  PlayCircle,
  Server,
  Cpu,
  Lock,
  GitBranch,
  History
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { eventBus, PlatformEvent } from '@/orchestration/event-bus';

export default function ProcessIntelligencePage() {
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents(eventBus.getHistory());
    setLoading(false);
    
    // In a real app, this would be a websocket listener
    const interval = setInterval(() => {
      setEvents([...eventBus.getHistory()]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Execution Kernel v4.2</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Process Intelligence</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">Autonomous workflow oversight, domain execution tracing, and inter-service orchestration health.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> REPLAY HISTORY
           </Button>
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              Engine: AUTONOMOUS_ENFORCING
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* EXECUTION STREAM */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="shadow-none border-2 bg-slate-950 text-slate-300 rounded-2xl overflow-hidden flex flex-col h-[700px] relative">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Planetary Execution Trace</CardTitle>
                  <CardDescription className="text-slate-500">Real-time telemetry of cross-domain state handshakes and kernel events.</CardDescription>
                </div>
                <Terminal className="h-6 w-6 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar font-mono text-[11px] leading-relaxed z-10">
                 <div className="p-6 space-y-3">
                    <AnimatePresence initial={false}>
                       {events.map((event) => (
                          <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-8 group hover:bg-white/5 py-1 px-2 rounded transition-colors"
                          >
                             <span className="text-slate-600 shrink-0 select-none">{format(new Date(event.timestamp), "HH:mm:ss.SSS")}</span>
                             <span className={cn(
                                "font-black uppercase w-32 shrink-0",
                                event.severity === 'CRITICAL' ? 'text-red-400' : 'text-blue-400'
                             )}>[{event.type}]</span>
                             <span className="text-emerald-500 shrink-0">{event.source}:</span>
                             <span className="group-hover:text-white transition-colors truncate italic">SIGNAL::{JSON.stringify(event.payload).substring(0, 100)}...</span>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: ORCHESTRATION STATS */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Cpu className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Kernel Heartbeat
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 {[
                   { label: 'System Throughput', val: '42.4 ops/s', status: 'Optimal' },
                   { label: 'Decision Finality', val: '450ms', status: 'Verified' },
                   { label: 'Process Coherence', val: '99.98%', status: 'Stable' }
                 ].map(stat => (
                   <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">{stat.label}</span>
                         <span className="text-2xl font-black text-white tracking-tighter">{stat.val}</span>
                      </div>
                      <Badge className="bg-white/10 text-white text-[8px] font-black border-none uppercase px-2 h-5">{stat.status}</Badge>
                   </div>
                 ))}
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    CALIBRATE ENGINE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Domain Saturation</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Treasury Sync', val: 84, color: 'bg-emerald-500' },
                   { label: 'Logistics Telemetry', val: 42, color: 'bg-blue-500' },
                   { label: 'Compliance Audit', val: 12, color: 'bg-indigo-500' }
                 ].map(domain => (
                    <div key={domain.label} className="space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span>{domain.label}</span>
                          <span>{domain.val}% Load</span>
                       </div>
                       <Progress value={domain.val} className="h-1 bg-muted" />
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <GitBranch className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Multi-Stage Consensus</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Critical state handovers require n-party cryptographic signatures. Autonomous arbitration is triggered upon consensus timeout or identity drift detection."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">CONFIGURE PROTOCOLS</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
