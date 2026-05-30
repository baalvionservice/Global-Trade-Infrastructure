/**
 * @file risk-governance/page.tsx
 * @description FINANCIAL RISK + GOVERNANCE CENTER.
 * Authoritative observatory for AML/KYC finality and counterparty exposure.
 */
'use client';

import { useEffect, useState } from 'react';
import { underwritingService } from '@/modules/financials/services/underwriting.service';
import { CreditProfile } from '@/modules/financials/types/financial.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  Lock, 
  Globe, 
  History, 
  Siren,
  Search,
  Scale,
  Zap,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinancialRiskGovernancePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Risk Matrix...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* GOVERNANCE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Security Node: FINANCIAL_INTEGRITY_01</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Risk <br />Governance.</h2>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-8 py-3 bg-red-600 rounded-2xl border-2 border-red-500 font-black text-xs uppercase tracking-widest text-white shadow-lg animate-pulse transition-all duration-700">
              <Siren className="h-5 w-5" />
              Monitoring: ARMED
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <ShieldAlert className="mr-3 h-5 w-5" /> Execute Sanctions Scan
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* COUNTERPARTY EXPOSURE GRAPH (SVG PLACEHOLDER) */}
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col h-[600px] relative group">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between z-10">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Global Exposure Topology</CardTitle>
                  <CardDescription className="text-slate-500 font-medium italic">High-fidelity visualization of multi-tenant credit concentration and systemic risk edges.</CardDescription>
                </div>
                <Globe className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0 flex-1 flex items-center justify-center relative z-10">
                 <div className="relative text-center space-y-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
                       <Globe className="h-64 w-64 text-primary opacity-20" />
                    </motion.div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">124 Node Clusters Scanned</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Equilibrium State: OPTIMAL</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* COMPLIANCE QUEUE */}
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b p-6">
                 <CardTitle className="text-lg font-black uppercase tracking-tighter">Compliance Adjudication Ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {[
                      { id: 'AML-992', title: 'Suspicious Velocity: Singapore Node', type: 'AML_ALERT', impact: 'high', severity: 'CRITICAL', status: 'HOLD' },
                      { id: 'KYC-442', title: 'Identity Drift: Tier 2 Seller', type: 'IDENTITY_SYNC', impact: 'medium', severity: 'WARNING', status: 'AUDITING' },
                    ].map((dispute, i) => (
                       <div key={dispute.id} className="p-6 flex items-center justify-between group hover:bg-red-500/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className="h-12 w-16 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <Fingerprint className="h-8 w-8 text-red-600 opacity-60" />
                             </div>
                             <div className="space-y-1.5">
                                <div className="flex items-center gap-4">
                                   <p className="font-black text-xl uppercase tracking-tighter leading-none">{dispute.title}</p>
                                   <Badge className="bg-primary text-white text-[8px] font-black h-5 px-2 border-none shadow-lg tracking-widest">{dispute.severity}</Badge>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">ID: {dispute.id} • Protocol: {dispute.type}</p>
                             </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full animate-pulse text-red-700 border-red-200 bg-red-50">{dispute.status}</Badge>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* RISK ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Siren className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <ShieldCheck className="h-5 w-5 text-white animate-pulse" />
                    Strategic Integrity Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Oracle Alert: Systemic identity drift detected across 14 high-volume corridors. Transition probability to cascade failure: 4%. Recommending immediate identity re-sync."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Threat Index</span>
                       <span className="text-4xl font-black text-red-300 tracking-tighter block mt-2">HIGH</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Sync Lock</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">STABLE</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-SYNCHRONIZE TRUST GRAPH
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'KYC/KYB Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Anomaly Latency', val: '140ms', icon: Activity, color: 'text-blue-500' },
                   { label: 'Arbiter Availability', val: 'Optimal', icon: Scale, color: 'text-indigo-500' }
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

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <History className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-[-45deg]" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Forensic Audit Replay</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Launch high-fidelity session replays for every state mutation in the financial fabric. Every capital release is cryptographically justified."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">OPEN AUDIT VAULT</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
