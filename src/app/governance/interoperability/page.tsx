/**
 * @file src/app/governance/interoperability/page.tsx
 * @description THE INTEROPERABILITY COMMAND HUB.
 * High-authority management of institutional ERP, Banking, and Customs connectors.
 */
'use client';

import { useEffect } from 'react';
import { gatewayService } from '@/modules/integrations/services/gateway.service';
import { connectorService } from '@/modules/integrations/services/connector.service';
import { useIntegrationStore } from '@/modules/integrations/store/use-integration-store';
import { ConnectorCard } from '@/modules/integrations/components/connector-card';
import { Landmark } from 'lucide-react';
import { WebhookMonitor } from '@/modules/integrations/components/webhook-monitor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  Zap,
  Lock,
  Database,
  Link2,
  Activity,
  History,
  Workflow,
  Cpu,
  ChevronLeft
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function InteroperabilityHubPage() {
  const { connectors, logs, metrics, setConnectors, setLogs, setMetrics, setSyncing, isSyncing } = useIntegrationStore();
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setSyncing(true);
    const [cData, lData, mData] = await Promise.all([
      connectorService.getRegistry(),
      gatewayService.getExchangeLedger(),
      gatewayService.getGatewayPulse()
    ]);
    setConnectors(cData);
    setLogs(lData);
    setMetrics(mData);
    setSyncing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async (id: string) => {
    toast({ title: "Sync Sequence Dispatched", description: "Node state is being reconciled with institutional source." });
    await connectorService.triggerSync(id);
    fetchData();
  };

  if (!metrics) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Federation Matrix...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: FED_GATEWAY_ALPHA</p>
           </div>
           <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Interoperability <br />Command.</h2>
           <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">"Authoritative planetary oversight of institutional connectors, ERP federation, and banking interoperability."</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-700 shadow-xl animate-in zoom-in duration-500">
              <Lock className="h-4 w-4" />
              E2E Signature: VERIFIED
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
              <Plus className="mr-3 h-5 w-5 fill-current" /> Provision Connector Node
           </Button>
        </div>
      </div>

      {/* GATEWAY KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Ecosystem Throughput', val: metrics.peakThroughput, sub: 'Planetary Operations', icon: Activity, color: 'text-blue-500' },
          { label: 'Gateway Latency', val: `${metrics.avgLatency}ms`, sub: 'P99 Finality', icon: Zap, color: 'text-orange-500' },
          { label: 'Sync Integrity', val: '100%', sub: 'Zero Packet Drift', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Provisioned Nodes', val: metrics.activeConnectors, sub: 'Institutional Clusters', icon: Cpu, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-2 border-primary/5 bg-background rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-8 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{kpi.val}</div>
                  <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-widest italic opacity-40">{kpi.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="registry" className="space-y-8">
        <TabsList className="bg-background border-2 p-1.5 gap-1.5 h-12 rounded-2xl shadow-sm w-fit">
          <TabsTrigger value="registry" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-6 rounded-xl tracking-widest transition-all">Connector Registry</TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-6 rounded-xl tracking-widest transition-all">Exchange Ledger</TabsTrigger>
          <TabsTrigger value="governance" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-6 rounded-xl tracking-widest transition-all">Policy Runtime</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-6">
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                 {connectors.map((node, i) => (
                    <ConnectorCard key={node.id} node={node} onSync={handleSync} />
                 ))}
              </AnimatePresence>
              
              <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center p-6 text-center space-y-6 group hover:border-primary/40 transition-all cursor-pointer">
                 <div className="p-6 rounded-full bg-background border-4 border-dashed border-primary/5 group-hover:scale-110 transition-transform duration-700">
                    <Share2 className="h-12 w-12 text-primary opacity-20" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm font-black uppercase text-foreground/80 tracking-tighter leading-none">Federate New System</p>
                    <p className="text-xs text-muted-foreground font-medium italic px-6 leading-relaxed">
                       "Authorized nodes can provision secure digital bridges for ERP, TMS, or sovereign banking infrastructure."
                    </p>
                 </div>
                 <Button variant="outline" className="rounded-2xl border-2 font-black text-[10px] uppercase h-11 px-8 bg-background">Launch Connector Wizard</Button>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="ledger">
           <WebhookMonitor logs={logs} />
        </TabsContent>

        <TabsContent value="governance">
           <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
                 <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                    <Workflow className="h-80 w-80 brightness-0 invert" />
                 </div>
                 <CardHeader className="pb-6 border-b border-white/10 relative p-6">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                       <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                       Interoperability Oracle
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 relative space-y-8">
                    <p className="text-3xl font-bold italic leading-[1.1] opacity-95 tracking-tighter">
                       "Gateway Insight: Systemic latency spike detected in the Mumbai banking corridor. Recommending autonomous routing rebalancing to the Singapore Node to ensure settlement finality."
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                          <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-white tracking-widest">Optimized Delta</p>
                          <p className="text-4xl font-black text-emerald-300 tabular-nums tracking-tighter">-140ms</p>
                       </div>
                       <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                          <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-white tracking-widest">Model Conf.</p>
                          <p className="text-4xl font-black text-blue-300 tabular-nums tracking-tighter">99.8%</p>
                       </div>
                    </div>
                    <Button variant="secondary" className="w-full h-24 font-black uppercase text-base tracking-widest shadow-lg bg-white text-primary border-none rounded-2xl hover:scale-[1.02] transition-transform">
                       EXECUTE CORRIDOR REBALANCE
                    </Button>
                 </CardContent>
              </Card>

              <div className="space-y-6">
                 <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol Schema State</h4>
                       <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="space-y-6">
                       {[
                         { label: 'ISO 20022 Sync', val: 'LOCKED', icon: Landmark, color: 'text-emerald-500' },
                         { label: 'WCO HS v2024', val: 'VERIFIED', icon: Database, color: 'text-blue-500' },
                         { label: 'SWIFT Finality', val: 'OPTIMAL', icon: Activity, color: 'text-indigo-500' }
                       ].map(stat => (
                         <div key={stat.label} className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-6">
                               <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                               </div>
                               <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-foreground">{stat.val}</span>
                         </div>
                       ))}
                    </div>
                 </Card>

                 <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all">
                    <History className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-[-45deg]" />
                    <div className="space-y-3">
                       <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Federation Audit Replay</p>
                       <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                          "Institutional administrators can reconstruct historical system states by replaying the exchange ledger across federated nodes. Absolute provenance verified."
                       </p>
                    </div>
                    <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">LAUNCH FORENSIC REPLAY</Button>
                 </Card>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
