'use client';

/**
 * @file insurance/page.tsx
 * @description Institutional Cargo Protection Dashboard. The central observatory for insurance underwriting and risk transfer.
 */

import { useEffect, useState } from 'react';
import { insuranceService, InsurancePolicy, InsuranceClaim } from '@/services/insurance-service';
import { adminService, PlatformStats } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Activity, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  History,
  Zap,
  ArrowRight,
  Globe,
  Plus,
  Landmark,
  Scale
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';

export default function InsuranceDashboardPage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [pData, cData] = await Promise.all([
        insuranceService.getPolicies(),
        insuranceService.getClaims()
      ]);
      setPolicies(pData);
      setClaims(cData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Risk Transfer Nodes...</p>
      </div>
    );
  }

  const stats = [
    { title: "Total Insured Value", value: "$482M", sub: "+8% YoY", icon: Landmark, color: "text-primary" },
    { title: "Active Policies", value: policies.filter(p => p.status === 'active').length, sub: "Verified Protection", icon: ShieldCheck, color: "text-emerald-600" },
    { title: "Open Claims", value: claims.filter(c => c.status !== 'settled').length, sub: "In Adjudication", icon: AlertTriangle, color: "text-orange-600" },
    { title: "Risk Transfer Speed", value: "4.2h", sub: "Avg Underwriting", icon: Activity, color: "text-blue-600" },
  ];

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Operational Protection</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Cargo Protection Center</h2>
          <p className="text-muted-foreground font-medium italic">Authoritative oversight of institutional risk transfer, marine insurance policies, and claims finality.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md" asChild>
              <Link href={PATHS.INSURANCE_CLAIMS}>Manage Claims Queue</Link>
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary" asChild>
              <Link href={PATHS.INSURANCE_POLICIES}><Plus className="mr-2 h-4 w-4" /> New Policy</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background hover:border-primary/20 transition-all rounded-3xl group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{s.title}</CardTitle>
                  <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
                     <s.icon className={cn("h-4 w-4", s.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                  <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60 italic">{s.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* RECENT POLICIES LEDGER */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Policy Ledger</CardTitle>
                  <CardDescription className="text-xs font-medium">Authoritative record of issued cargo and trade credit policies.</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {policies.slice(0, 5).map((policy) => (
                       <div key={policy.id} className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className="h-12 w-12 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                <ShieldCheck className="h-6 w-6 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1.5">
                                <p className="font-black text-lg uppercase tracking-tighter leading-none">{policy.coverage.replace('_', ' ')}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">ID: {policy.id} • Target: {policy.shipmentId || policy.orderId}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Insured Value</p>
                                <p className="text-base font-black">{formatCurrency(policy.insuredAmount, policy.currency)}</p>
                             </div>
                             <Badge variant="outline" className={cn(
                                "text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full shadow-sm",
                                policy.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-muted"
                             )}>{policy.status}</Badge>
                             <Button variant="ghost" size="icon" className="opacity-20 group-hover:opacity-100 transition-opacity" asChild>
                                <Link href={`${PATHS.INSURANCE_POLICIES}/${policy.id}`}><ArrowRight className="h-5 w-5" /></Link>
                             </Button>
                          </div>
                       </div>
                    ))}
                    {policies.length === 0 && (
                       <div className="py-20 text-center text-muted-foreground italic text-sm">No active policies found in ledger.</div>
                    )}
                 </div>
              </CardContent>
           </Card>

           {/* RISK INTELLIGENCE HEATMAP OVERLAY */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Regional Risk Exposure</CardTitle>
                 <Globe className="h-5 w-5 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-6">
                 <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { region: 'APAC Outbound', risk: 12, status: 'Optimal', color: 'bg-green-500' },
                      { region: 'EU Inbound', risk: 45, status: 'Elevated', color: 'bg-orange-500' },
                      { region: 'US East Corridor', risk: 28, status: 'Stable', color: 'bg-blue-500' },
                      { region: 'South Asia Trade', risk: 72, status: 'Critical', color: 'bg-red-500' }
                    ].map(r => (
                       <div key={r.region} className="space-y-4 p-6 rounded-3xl border-2 bg-muted/5 group hover:border-primary/20 transition-all">
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-black uppercase tracking-tight">{r.region}</span>
                             <Badge className={cn("text-[8px] font-black uppercase border-none", r.status === 'Critical' ? 'bg-red-600' : 'bg-slate-900')}>{r.status}</Badge>
                          </div>
                          <div className="flex items-end justify-between">
                             <span className="text-3xl font-black tracking-tighter">{r.risk}%</span>
                             <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Loss Probability</span>
                          </div>
                          <Progress value={r.risk} className="h-1 bg-muted" />
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* UNDERWRITING AUTHORITY NODE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Scale className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Underwriting Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "AI Intelligence: Marine risk in the South Asia corridor has trended +14% due to monsoon-linked port congestion. Suggest 0.02% premium adjustment for new bookings."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Risk Score</span>
                       <span className="text-xl font-black text-emerald-300">24/100</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Claims Recovery</span>
                       <span className="text-xl font-black text-blue-300">99.8%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    ADJUST RISK THRESHOLDS
                 </Button>
              </CardContent>
           </Card>

           {/* ACTIVE CLAIMS WORKBENCH */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Critical Claims Queue</CardTitle>
                 <Badge variant="outline" className="text-[9px] font-black border-2 h-6 uppercase px-3 rounded-full">{claims.length} ACTIVE</Badge>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {claims.slice(0, 3).map((claim, i) => (
                    <div key={i} className="flex items-start gap-5 p-5 rounded-3xl border-2 bg-muted/10 group hover:border-red-200 transition-all cursor-pointer shadow-sm">
                       <div className="p-3 rounded-xl bg-background border-2 shadow-inner group-hover:scale-105 transition-transform">
                          <ShieldAlert className="h-5 w-5 text-red-600" />
                       </div>
                       <div className="space-y-1.5 min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-tight text-foreground">{claim.reason}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Shipment: {claim.shipmentId} • {formatCurrency(claim.claimedAmount, claim.currency)}</p>
                       </div>
                       <Badge className="bg-orange-500 text-white text-[8px] font-black uppercase h-5 border-none px-2 rounded-full">{claim.status}</Badge>
                    </div>
                 ))}
                 <Button variant="ghost" className="w-full h-14 text-[10px] font-black uppercase text-primary hover:bg-primary/5 mt-4 tracking-widest border-2 border-dashed border-primary/20 rounded-2xl" asChild>
                    <Link href={PATHS.INSURANCE_CLAIMS}>EXPLORE ADJUDICATION HUB <ArrowRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed opacity-60 hover:opacity-100 transition-opacity">
              <History className="h-14 w-14 mx-auto text-muted-foreground opacity-20" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-widest">Reinsurance Participation</p>
                 <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic px-4">
                    "Platform liabilities are syndicated across 4 verified institutional reinsurers. Current pooling capacity: $1.2B."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
