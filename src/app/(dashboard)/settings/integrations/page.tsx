/**
 * @file src/app/(dashboard)/settings/integrations/page.tsx
 * @description The Interoperability Hub. Management center for institutional ERP, Banking, and Customs connectors.
 */
'use client';

import { useEffect, useState } from 'react';
import { 
  getIntegrations, 
  getWebhooks, 
  getIntegrationLogs, 
  Integration, 
  Webhook, 
  IntegrationLog 
} from '@/services/integration-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Share2, 
  Webhook as WebhookIcon, 
  Activity, 
  Settings2, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Zap,
  Lock,
  Database,
  Link2
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteroperabilityHubPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const companyId = 'COMP-101'; 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [iData, wData, lData] = await Promise.all([
        getIntegrations(companyId),
        getWebhooks(companyId),
        getIntegrationLogs()
      ]);
      setIntegrations(iData);
      setWebhooks(wData);
      setLogs(lData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Federation Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">System Integration</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Interoperability Hub</h2>
          <p className="text-muted-foreground font-medium italic">Manage secure digital connectors between Baalvion and your institutional infrastructure (ERP, TMS, Banking).</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Lock className="h-4 w-4" />
              E2E Signature: VERIFIED
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> PROVISION CONNECTOR
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Ecosystem Links', val: integrations.length, icon: Share2, color: 'text-blue-600' },
          { label: 'Sync Finality', val: '100%', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Active Endpoints', val: webhooks.length, icon: WebhookIcon, color: 'text-purple-600' },
          { label: 'Network Reach', val: '14 Nodes', icon: Globe, color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tighter">{stat.val}</div>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="federation" className="space-y-8">
        <TabsList className="bg-background border-2 p-1 gap-1 h-14 rounded-2xl shadow-sm">
          <TabsTrigger value="federation" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-8 rounded-xl tracking-widest transition-all">System Federation</TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-8 rounded-xl tracking-widest transition-all">Outbound Callbacks</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-8 rounded-xl tracking-widest transition-all">Exchange Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="federation">
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map(int => (
                <Card key={int.id} className="shadow-xl border-2 border-primary/5 bg-background rounded-2xl overflow-hidden group hover:border-primary/40 transition-all">
                   <CardHeader className="bg-muted/10 border-b p-8 flex flex-row items-start justify-between">
                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-white text-[9px] font-black uppercase h-5 px-2 border-none shadow-sm">{int.type}</Badge>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         </div>
                         <CardTitle className="text-xl font-black uppercase tracking-tighter text-foreground">{int.name}</CardTitle>
                      </div>
                      <div className="p-4 rounded-2xl bg-background border-2 shadow-inner group-hover:scale-110 transition-transform">
                         {int.type === 'erp' ? <Database className="h-6 w-6 text-primary opacity-60" /> : <Link2 className="h-6 w-6 text-primary opacity-60" />}
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 leading-none">Gateway Endpoint</p>
                            <p className="text-xs font-mono font-bold truncate bg-muted/30 p-2 rounded-lg border">{int.config?.endpoint || 'API_GATEWAY_NODE'}</p>
                         </div>
                         <div className="flex justify-between items-center pt-2">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Sync State</p>
                               <p className="text-xs font-black text-emerald-600 uppercase">Synchronized</p>
                            </div>
                            <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 h-10 px-4 rounded-xl border-2 border-transparent hover:border-primary/10 transition-all">
                               Configure Node
                            </Button>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="webhooks">
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Outbound Webhook Registry</CardTitle>
                 <CardDescription className="text-xs font-medium">Baalvion will propagate JSON event packets to these verified endpoints.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/30">
                       <TableRow className="border-b-2">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest pl-10 py-6">Event Identity</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Sovereign URL</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">State</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-10">Federation</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {webhooks.map(wh => (
                         <TableRow key={wh.id} className="hover:bg-primary/[0.01] transition-colors border-b last:border-0 group">
                            <TableCell className="pl-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-xl bg-muted border-2"><Zap className="h-4 w-4 text-primary opacity-60" /></div>
                                  <span className="font-mono text-[10px] font-black uppercase text-foreground">{wh.eventType}</span>
                               </div>
                            </TableCell>
                            <TableCell>
                               <span className="text-xs font-mono text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full border">{wh.targetUrl}</span>
                            </TableCell>
                            <TableCell>
                               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[9px] font-black h-6 px-3 rounded-full uppercase tracking-tighter">Active Node</Badge>
                            </TableCell>
                            <TableCell className="text-right pr-10">
                               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted opacity-40 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="h-5 w-5" />
                               </Button>
                            </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="audit">
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-sm font-black uppercase tracking-wide">Interoperability Audit Ledger</CardTitle>
                    <CardDescription className="text-xs">Immutable record of cross-platform signal exchange and synchronization finality.</CardDescription>
                 </div>
                 <Badge variant="secondary" className="flex gap-2 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border-2">
                    <Activity className="h-4 w-4 text-primary" /> LIVE TELEMETRY
                 </Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/30">
                       <TableRow className="border-b-2">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest pl-10 py-6">Direction</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Event Protocol</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Exchange State</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-10">Finality Time</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {logs.map(log => (
                         <TableRow key={log.id} className="hover:bg-primary/[0.01] transition-colors border-b last:border-0">
                            <TableCell className="pl-10 py-8">
                               <Badge className={cn(
                                  "uppercase text-[9px] font-black h-6 px-3 border-none rounded-full shadow-sm",
                                  log.direction === 'outbound' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                               )}>
                                  {log.direction}
                               </Badge>
                            </TableCell>
                            <TableCell>
                               <div className="space-y-1">
                                  <p className="text-xs font-black uppercase tracking-tight text-foreground">{log.eventType.replace(/_/g, ' ')}</p>
                                  <p className="text-[9px] text-muted-foreground italic font-bold opacity-60">Handshake ID: {log.id}</p>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-3">
                                  {log.status === 'success' ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border-2 border-emerald-100 shadow-inner">
                                       <CheckCircle2 className="h-3.5 w-3.5" />
                                       <span className="text-[9px] font-black uppercase tracking-widest">COMPLETED</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full border-2 border-red-100 shadow-inner">
                                       <AlertCircle className="h-3.5 w-3.5" />
                                       <span className="text-[9px] font-black uppercase tracking-widest">RETRYING</span>
                                    </div>
                                  )}
                               </div>
                            </TableCell>
                            <TableCell className="text-right text-[10px] font-mono font-bold text-muted-foreground pr-10">
                               {format(new Date(log.createdAt), "HH:mm:ss.SSS")}
                            </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <div className="p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Share2 className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Sovereign Interoperability Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Globally Federated. Institutionally Hardened.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion operates as a neutral federation engine. Our Interoperability Hub provides the authoritative digital layer for cross-border trade, enabling banks, ERPs, and customs gateways to synchronize state with millisecond finality on the institutional ledger."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Sync Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">OPTIMAL</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">API Latency</p>
                  <p className="text-2xl font-black tracking-tighter">~120ms</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Integrity Level</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">SOVEREIGN</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
