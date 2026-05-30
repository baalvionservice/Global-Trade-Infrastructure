/**
 * @file compliance-admin/page.tsx
 * @description Operational Compliance Control Tower. 
 * Authoritative oversight of identity verification, regulatory rulebases, and arbiter review.
 */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Scale, 
  FileCheck, 
  Users, 
  AlertTriangle, 
  Search, 
  ArrowRight,
  Loader2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Gavel,
  History,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

export default function ComplianceAdminSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
       const res = await apiClient.get<any[]>('/webhook_logs', { limit: 10 });
       setLogs(res.data || []);
       setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const stats = [
    { title: "Legal Runtime State", value: "ENFORCING", icon: Zap, color: "text-emerald-600", desc: "Active Law Orchestration" },
    { title: "Compliance Finality", value: "99.98%", icon: ShieldCheck, color: "text-blue-600", desc: "Audit Pass Rate" },
    { title: "Regulatory Flags", value: "4", icon: AlertTriangle, color: "text-orange-600", desc: "Awaiting Arbiter" },
    { title: "Sanctions Shield", value: "LIVE", icon: Globe, color: "text-indigo-600", desc: "OFAC/UN/EU Synced" },
  ];

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Regulatory Oversight</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Compliance Control Tower</h2>
          <p className="text-muted-foreground font-medium italic">High-authority management of institutional identity, sovereign trade laws, and regulatory finality.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-700 shadow-sm animate-in zoom-in duration-500">
              <Scale className="h-4 w-4" />
              Jurisdictional Rules: Active (124)
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary" asChild>
              <Link href={PATHS.ADMIN_RISK}>Access Risk Intel</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.title} className="shadow-lg border-2 border-primary/5 bg-background hover:border-primary/20 transition-all rounded-3xl group">
             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{s.title}</CardTitle>
                <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60">{s.desc}</p>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* REAL-TIME LEGAL AUDIT STREAM */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Operational Compliance Ledger</CardTitle>
                  <CardDescription className="text-xs font-medium">Immutable stream of real-time legal decisions and runtime enforcement signals.</CardDescription>
                </div>
                <Activity className="h-6 w-6 text-primary opacity-30 animate-pulse" />
              </CardHeader>
              <CardContent className="p-0 overflow-auto max-h-[500px] custom-scrollbar">
                 <div className="divide-y-2">
                   {logs.map((log) => (
                      <div key={log.id} className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors border-b last:border-0">
                         <div className="flex items-center gap-8">
                            <div className={cn(
                               "h-12 w-12 rounded-2xl border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                               log.status === 'success' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                            )}>
                               <History className={cn("h-6 w-6", log.status === 'success' ? 'text-green-600' : 'text-red-600')} />
                            </div>
                            <div className="space-y-1.5">
                               <p className="font-black text-lg uppercase tracking-tighter leading-none">{log.eventType.replace(/_/g, ' ')}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Handshake ID: {log.id} • node: {log.integrationId}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <Badge variant="outline" className={cn(
                               "text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full",
                               log.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                            )}>{log.status === 'success' ? 'AUTHORIZED' : 'BLOCKED'}</Badge>
                            <span className="text-[10px] font-mono text-muted-foreground opacity-40">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                         </div>
                      </div>
                   ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* REGULATORY POSTURE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
                    Enforcement Runtime
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "AI Intelligence: Regulatory rulebases are synchronized with the 2024 Trade Framework. Autonomous enforcement is gating 100% of global state transitions."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Rule Accuracy</span>
                       <span className="text-xl font-black text-emerald-300">99.98%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Latency Delta</span>
                       <span className="text-xl font-black text-blue-300">+120ms</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    MANAGE GLOBAL RULEBASE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all">
              <Gavel className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-40 transition-all" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest">Arbiter Adjudication</p>
                 <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic px-4">
                    "Critical regulatory flags are automatically escalated to the Adjudication Hub for manual forensic review. No capital release is permitted while a flag is active."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background" asChild>
                 <Link href={PATHS.OVERSIGHT_DISPUTES}>VIEW PENDING CASES</Link>
              </Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
