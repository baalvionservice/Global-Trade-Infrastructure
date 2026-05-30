/**
 * @file RiskDashboardPage
 * @description The authoritative Risk & Intelligence dashboard for the Compliance Control Tower.
 */
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { getRiskBadgeConfig, RiskProfile } from '@/services/risk-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Loader2, 
  ShieldAlert, 
  Activity, 
  Search, 
  Globe, 
  Filter, 
  AlertTriangle,
  History,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function RiskIntelligenceCenter() {
  const [signals, setSignals] = useState<any[]>([]);
  const [highRiskNodes, setHighRiskNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [signalsRes, nodesRes] = await Promise.all([
      apiClient.get<any[]>('/risk_signals', { isResolved: false, limit: 10 }),
      apiClient.get<any[]>('/organizations', { riskLevel: 'high' })
    ]);
    setSignals(toList(signalsRes));
    setHighRiskNodes(toList(nodesRes));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && signals.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Intelligence Nodes...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Hub</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground">Risk Intelligence Center</h2>
          <p className="text-muted-foreground font-medium italic">Autonomous behavioral monitoring, sanctions screening, and jurisdictional anomaly detection.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Oracle Integrity: Stable
           </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* LIVE SIGNALS FEED */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-none border-2 bg-background overflow-hidden">
              <CardHeader className="bg-muted/10 border-b py-6 px-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Autonomous Signal Feed</CardTitle>
                  <CardDescription className="text-xs">Live stream of anomalies detected by the platform fraud engine.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] font-black uppercase h-5 tracking-tighter">
                   {signals.length} ACTIVE
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {signals.map((sig) => (
                       <div key={sig.id} className="p-8 group hover:bg-red-50/10 transition-colors">
                          <div className="flex items-start justify-between gap-8">
                             <div className="flex items-start gap-6 min-w-0">
                                <div className={cn(
                                   "p-3 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm",
                                   sig.severity === 'critical' ? "bg-red-50 border-red-100 text-red-600" : "bg-orange-50 border-orange-100 text-orange-600"
                                )}>
                                   <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                   <div className="flex items-center gap-3">
                                      <span className="text-xs font-black uppercase tracking-tighter text-foreground">{sig.type.replace(/_/g, ' ')}</span>
                                      <Badge className={cn(
                                         "uppercase text-[8px] font-black h-4 px-1.5 border-none",
                                         sig.severity === 'critical' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                                      )}>{sig.severity}</Badge>
                                   </div>
                                   <p className="text-sm font-bold text-muted-foreground leading-relaxed italic truncate max-w-md">"{sig.description}"</p>
                                   <div className="flex items-center gap-4 pt-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">
                                      <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Node: {sig.orgId}</span>
                                      <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> {format(new Date(sig.createdAt), "HH:mm:ss")}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex flex-col gap-2">
                                <Button size="sm" className="h-9 px-4 font-black text-[9px] uppercase tracking-widest bg-red-600 hover:bg-red-700 shadow-lg">INVESTIGATE</Button>
                                <Button variant="ghost" size="sm" className="h-8 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground">DISMISS</Button>
                             </div>
                          </div>
                       </div>
                    ))}
                    {signals.length === 0 && (
                       <div className="py-20 text-center opacity-20">
                          <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-wide">All Jurisdictions Healthy</p>
                       </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* HIGH RISK NODE MONITOR */}
        <div className="lg:col-span-3 space-y-8">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldAlert className="h-48 w-48 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-8 py-8">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" />
                    Critical Entity Monitor
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 relative space-y-6">
                 {highRiskNodes.map(node => {
                    const badge = getRiskBadgeConfig(node.riskLevel);
                    return (
                       <div key={node.id} className="p-5 rounded-3xl bg-white/10 border border-white/5 space-y-4 shadow-xl">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-tighter truncate max-w-[180px]">{node.name}</h4>
                                <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{node.id} • {node.country}</p>
                             </div>
                             <Badge className={cn("text-[8px] font-black h-5 border-none", badge.color)}>{badge.label}</Badge>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Risk Score</span>
                             <span className="text-xl font-black text-red-300 tracking-tighter">{node.riskScore}</span>
                          </div>
                       </div>
                    );
                 })}
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02]">
                    VIEW ALL THREAT NODES
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background border-dashed p-8 text-center space-y-4">
              <Info className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <div className="space-y-1">
                 <p className="text-xs font-black uppercase tracking-tight">Manual Sanctions Bypass</p>
                 <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                    "Arbiters may authorize temporary overrides for restricted nodes following formal jurisdictional review and bond provisioning."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[10px] tracking-widest">
                 GOVERNANCE OVERRIDE
              </Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
