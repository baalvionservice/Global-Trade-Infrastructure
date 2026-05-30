/**
 * @file infrastructure/page.tsx
 * @description THE GLOBAL INFRASTRUCTURE COMMAND CENTER.
 * High-authority strategic command for planetary cloud orchestration and node finality.
 */
'use client';

import { useEffect, useState } from 'react';
import { infraOrchestrator, InfrastructureNode, ClusterStatus } from '@/services/infrastructure-orchestrator';
import { hardeningService, HardeningPulse } from '@/services/hardening-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  Cpu,
  Database,
  Lock,
  RefreshCw,
  Search,
  Settings2,
  Terminal,
  Radio,
  Workflow,
  ArrowUpRight,
  MonitorSmartphone
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalInfraCommandPage() {
  const [nodes, setNodes] = useState<InfrastructureNode[]>([]);
  const [pulse, setPulse] = useState<HardeningPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'topology' | 'workloads' | 'resilience'>('topology');

  const fetchData = async () => {
    const [topology, sPulse] = await Promise.all([
      infraOrchestrator.getTopology(),
      hardeningService.getSystemPulse()
    ]);
    setNodes(topology);
    setPulse(sPulse);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Infrastructure Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6 selection:bg-primary selection:text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Service Node: INFRA_CORE_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Infra Command.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of sovereign cloud clusters, multi-tenant workload isolation, and systemic compute finality."
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-400 shadow-md">
              <ShieldCheck className="h-5 w-5" />
              Fabric Sync: OPTIMAL
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <RefreshCw className="mr-3 h-5 w-5" /> Re-Sync Mesh
           </Button>
        </div>
      </div>

      {/* STRATEGIC INFRA KPIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Global Availability', val: '99.999%', icon: Activity, color: 'text-emerald-400' },
          { label: 'Compute Load', val: `${(pulse?.loadFactor! * 100).toFixed(1)}%`, icon: Cpu, color: 'text-blue-400' },
          { label: 'Ingress Latency', val: '142ms', icon: Zap, color: 'text-orange-400' },
          { label: 'Tenant Isolation', val: '100%', icon: Lock, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-none bg-slate-900/60 rounded-2xl group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10 p-8">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wide">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter text-slate-100 tabular-nums">{kpi.val}</div>
                  <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-widest italic opacity-40">Finality Confirmed</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* TOPOLOGY GRAPH / CLUSTER LIST */}
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/40 rounded-2xl overflow-hidden flex flex-col h-[700px] relative">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Planetary Infrastructure Mesh</CardTitle>
                 <CardDescription className="text-slate-400 font-medium italic">High-fidelity visualization of sovereign Kubernetes clusters and federated workloads.</CardDescription>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="border-white/10 text-white font-black text-[10px] uppercase h-10 px-6 rounded-xl hover:bg-white/5">
                    <Workflow className="mr-2 h-3.5 w-3.5" /> REPLAY TOPOLOGY
                 </Button>
              </div>
           </CardHeader>
           <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar z-10">
              <div className="divide-y divide-white/5">
                 {nodes.map((node, i) => (
                    <motion.div 
                      key={node.id} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
                    >
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className={cn(
                             "h-12 w-16 rounded-2xl border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500",
                             node.status === 'HEALTHY' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                          )}>
                             <Server className={cn("h-7 w-7", node.status === 'HEALTHY' ? 'text-emerald-400' : 'text-red-400')} />
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                             <div className="flex items-center gap-4">
                                <h4 className="text-2xl font-black uppercase tracking-tighter text-white truncate">{node.name}</h4>
                                <Badge className={cn(
                                   "text-[9px] uppercase font-black tracking-widest px-3 h-6 border-none shadow-sm",
                                   node.provider === 'SOVEREIGN_PRIVATE' ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400"
                                )}>{node.provider}</Badge>
                             </div>
                             <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-500 tracking-wide">
                                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Region: {node.region}</span>
                                <span className="flex items-center gap-2"><MonitorSmartphone className="h-4 w-4" /> Tenants: {node.tenantCount} Nodes</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-3 shrink-0 border-l-2 pl-12 border-white/5">
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase text-slate-600 leading-none">Sync Latency</p>
                             <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{node.latencyMs}ms</p>
                          </div>
                          <Badge variant="outline" className={cn(
                             "text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full",
                             node.status === 'HEALTHY' ? "text-emerald-400 border-emerald-400/30" : "text-red-400 border-red-400/30 animate-pulse"
                          )}>{node.status}</Badge>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* SIDEBAR: INFRA ORACLE */}
        <div className="lg:col-span-4 space-y-6">
           {/* SELF-HEALING ORACLE */}
           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl h-[380px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Radio className="h-6 w-6 text-white animate-pulse" />
                    Infrastructure Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Mesh Alert: Systemic latency drift detected in the ap-southeast-1 cluster. Predicted node exhaustion in 4.2h. Recommend autonomous failover to the Singapore standby node."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE TRAFFIC EVACUATION
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
                   { label: 'Uptime Index', val: '99.999%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Consensus Speed', val: '450ms', icon: Database, color: 'text-blue-500' },
                   { label: 'Failover Buffer', val: '12.4s', icon: Zap, color: 'text-orange-500' }
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

           <Card className="shadow-none border-none bg-slate-900/30 p-6 text-center space-y-8 rounded-2xl border-dashed border-white/5 group hover:border-primary/20 transition-all">
              <Dna className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:rotate-45" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">GitOps Lifecycle</p>
                 <p className="text-xs font-medium italic leading-relaxed px-8 opacity-40 text-slate-500">
                    "All infrastructure state mutations are version-locked in the sovereign GitOps repository. Zero structural drift detected in the current cycle."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">RECONSTRUCT FROM GIT</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
