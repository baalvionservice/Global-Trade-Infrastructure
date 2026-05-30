/**
 * @file trade-finance/page.tsx
 * @description TRADE FINANCE OPERATIONS HUB.
 * Manages bank-grade instruments: Letters of Credit, Invoice Financing, and Underwriting.
 */
'use client';

import { useEffect, useState } from 'react';
import { tradeFinanceService } from '@/modules/financials/services/trade-finance.service';
import { underwritingService } from '@/modules/financials/services/underwriting.service';
import { TradeFinanceInstrument, CreditProfile } from '@/modules/financials/types/financial.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Landmark, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Scale,
  Plus,
  BarChart3,
  History,
  Lock,
  Landmark as BankIcon
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TradeFinanceOperationsPage() {
  const [instruments, setInstruments] = useState<TradeFinanceInstrument[]>([]);
  const [profile, setProfile] = useState<CreditProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tradeFinanceService.getActiveInstruments('COMP-101'),
      underwritingService.calculateCreditProfile('COMP-101')
    ]).then(([inst, prof]) => {
      setInstruments(inst);
      setProfile(prof);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Finance Handshake...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* OPERATIONS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: FINANCE_OPS_HUB</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Trade <br />Finance.</h2>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <History className="mr-3 h-4 w-4" /> Finality Log
          </Button>
          <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
            <Plus className="mr-3 h-5 w-5" /> Request Instrument
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* CREDIT UNDERWRITING MATRIX */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Scale className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 relative p-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <CardTitle className="text-3xl font-black uppercase tracking-tighter">Institutional Credit Profile</CardTitle>
                       <p className="text-white/60 font-medium italic mt-2 uppercase text-xs tracking-widest">Global Underwriting Node: ALPHA_V4</p>
                    </div>
                    <Badge className="bg-emerald-400 text-emerald-950 text-[10px] font-black h-7 px-4 rounded-full border-none shadow-xl">RATING: {profile.rating}</Badge>
                 </div>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-wide opacity-60">Aggregate Limit</p>
                       <p className="text-4xl font-black tracking-tighter">{formatCurrency(profile.totalLimit)}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-wide opacity-60">Available Credit</p>
                       <p className="text-4xl font-black text-emerald-400 tracking-tighter">{formatCurrency(profile.availableCredit)}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-wide opacity-60">Utilized Weight</p>
                       <p className="text-4xl font-black text-blue-300 tracking-tighter">{Math.round((profile.utilizedAmount / profile.totalLimit) * 100)}%</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="opacity-60">Liquidity Absorption</span>
                       <span className="text-emerald-400">OPTIMAL</span>
                    </div>
                    <Progress value={(profile.utilizedAmount / profile.totalLimit) * 100} className="h-2 bg-white/10 shadow-inner" />
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                    <div className="text-center space-y-1">
                       <p className="text-[9px] font-black uppercase opacity-40">Default Prob.</p>
                       <p className="text-xl font-black">{profile.delinquencyProb}%</p>
                    </div>
                    <div className="text-center space-y-1 border-x border-white/10">
                       <p className="text-[9px] font-black uppercase opacity-40">Audit Score</p>
                       <p className="text-xl font-black">{profile.score}/1000</p>
                    </div>
                    <div className="text-center space-y-1">
                       <p className="text-[9px] font-black uppercase opacity-40">Finality Sync</p>
                       <p className="text-xl font-black text-emerald-400">LOCKED</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* INSTRUMENT REGISTRY */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Active Finance Instruments</CardTitle>
                  <CardDescription className="text-xs font-medium">Authoritative record of issued Letters of Credit and Financing Mandates.</CardDescription>
                </div>
                <FileText className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {instruments.length === 0 ? (
                       <div className="py-20 text-center opacity-30 italic text-sm">No active trade instruments provisioned in this cycle.</div>
                    ) : (
                       instruments.map(inst => (
                          <div key={inst.id} className="p-6 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                             <div className="flex items-center gap-8">
                                <div className="h-12 w-16 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                   <BankIcon className="h-8 w-8 text-primary opacity-60" />
                                </div>
                                <div className="space-y-1.5">
                                   <p className="font-black text-xl uppercase tracking-tighter leading-none">{inst.type.replace(/_/g, ' ')}</p>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">ID: {inst.id} • Expiry: {new Date(inst.expiryDate).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-6 shrink-0 border-l-2 pl-12 border-muted/50">
                                <div className="text-right space-y-1">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Instrument Value</p>
                                   <p className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(inst.amount, inst.currency)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-20 group-hover:opacity-100 transition-all">
                                   <ArrowRight className="h-6 w-6" />
                                </Button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* FINANCIAL INTELLIGENCE SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <TrendingUp className="h-5 w-5 text-white animate-pulse" />
                    Capital Strategy Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "AI Analysis: Corporate credit utilization is at 25%. Suggest initializing a programmatic Invoice Financing loop for the German export corridor to optimize Q3 cash conversion cycle."
                 </p>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-3xl">
                    LAUNCH FINANCING SAGA
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Ratios</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Asset Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Settlement Latency', val: '450ms', icon: Activity, color: 'text-blue-500' },
                   { label: 'Underwriting Precision', val: '92.4%', icon: BarChart3, color: 'text-indigo-500' }
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

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Lock className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest">Sovereign Interoperability</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Trade finance issuance requires cryptographical sign-off from both Buyer Treasury and Advising Bank. All instrument metadata is version-locked on the global ledger."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">AUDIT FINANCE LINEAGE</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
