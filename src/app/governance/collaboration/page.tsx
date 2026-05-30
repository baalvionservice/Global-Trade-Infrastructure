/**
 * @file src/app/governance/collaboration/page.tsx
 * @description THE COLLABORATION COMMAND CENTER. 
 * Authoritative strategic command for institutional coordination and multi-user finality.
 */
'use client';

import { useEffect, useState } from 'react';
import { collaborationService } from '@/modules/collaboration/services/collaboration.service';
import { presenceService } from '@/modules/collaboration/services/presence.service';
import { CollaborationWorkspace, OperationalPresence } from '@/modules/collaboration/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Globe, 
  Share2, 
  Loader2, 
  ArrowRight,
  MessageSquare,
  Network,
  Radio,
  History,
  Lock,
  Cpu,
  RefreshCw,
  Landmark
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function CollaborationCommandCenter() {
  const [workspaces, setWorkspaces] = useState<CollaborationWorkspace[]>([]);
  const [presence, setPresence] = useState<OperationalPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const [wData, pData] = await Promise.all([
      collaborationService.getWorkspaces('COMP-101'),
      presenceService.getClusterPresence('GLOBAL_CLUSTER')
    ]);
    setWorkspaces(wData);
    setPresence(pData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && workspaces.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Coordination Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: COLLAB_COORD_01</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Strategic <br />Coordination.</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
              <History className="mr-3 h-4 w-4" /> Global Handshake Log
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
              <Share2 className="mr-3 h-5 w-5 fill-current" /> Provision Multi-Node Workspace
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* ACTIVE WORKSPACES MATRIX */}
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Planetary Collaborative Mesh</CardTitle>
                  <CardDescription className="text-sm font-medium italic mt-1">High-fidelity oversight of synchronized institutional workspaces.</CardDescription>
                </div>
                <Network className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    <AnimatePresence>
                       {workspaces.map((ws, i) => (
                          <motion.div 
                            key={ws.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors"
                          >
                             <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className={cn(
                                   "h-14 w-20 rounded-2xl border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500",
                                   ws.status === 'SYNCING' ? "bg-blue-50 border-blue-200" : "bg-muted border-primary/5"
                                )}>
                                   {ws.type === 'SOURCING' ? <Landmark className="h-8 w-8 text-primary opacity-60" /> : <Globe className="h-8 w-8 text-primary opacity-60" />}
                                </div>
                                <div className="space-y-4 flex-1 min-w-0">
                                   <div className="flex items-center gap-4">
                                      <Badge className="bg-slate-900 text-white text-[9px] font-black h-6 px-3 border-none shadow-sm uppercase tracking-widest">{ws.type}</Badge>
                                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">MANDATE: {ws.entityId}</span>
                                   </div>
                                   <h4 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{ws.title}</h4>
                                   <div className="flex items-center gap-8 pt-2">
                                      <div className="flex -space-x-3">
                                         {ws.activeUsers.map(u => (
                                            <div key={u} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black">P</div>
                                         ))}
                                         {ws.activeUsers.length === 0 && <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Zero Active Nodes</span>}
                                      </div>
                                      <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wide">{ws.activeUsers.length} COLLABORATORS</span>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-col items-end shrink-0 border-l-2 pl-12 border-muted/50 space-y-6">
                                <div className="text-right space-y-1">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Sync Coherence</p>
                                   <p className="text-4xl font-black text-primary tabular-nums tracking-tighter">{ws.coherenceScore}%</p>
                                </div>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full",
                                   ws.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                                )}>{ws.status}</Badge>
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* PRESENCE & ANALYTICS SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
           {/* REAL-TIME PRESENCE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Radio className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Operational Awareness
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <div className="space-y-6">
                    {presence.map(p => (
                       <div key={p.userId} className="flex items-center justify-between p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md transition-all hover:bg-white/20 cursor-default">
                          <div className="flex items-center gap-6">
                             <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xs">{p.name.charAt(0)}</div>
                             <div className="space-y-0.5">
                                <span className="text-sm font-black uppercase tracking-tight text-white">{p.name}</span>
                                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{p.role}</p>
                             </div>
                          </div>
                          <Badge className={cn(
                             "text-[8px] font-black uppercase border-none h-5 px-2",
                             p.operationalStatus === 'AVAILABLE' ? 'bg-emerald-400 text-emerald-950' : 'bg-orange-400 text-orange-950'
                          )}>{p.operationalStatus}</Badge>
                       </div>
                    ))}
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-SYNC CLUSTER PRESENCE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Coordination Efficiency</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Network Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Sync Latency', val: '140ms', icon: RefreshCw, color: 'text-blue-500' },
                   { label: 'Handshake Depth', val: 'Lvl 4', icon: Lock, color: 'text-indigo-500' }
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
