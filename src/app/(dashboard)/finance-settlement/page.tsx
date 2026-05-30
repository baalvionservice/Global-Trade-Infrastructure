/**
 * @file finance-settlement/page.tsx
 * @description Executive Treasury & Settlement Command. High-fidelity oversight of institutional liquidity.
 */
'use client';

import { useEffect, useState } from 'react';
import { treasuryService } from '@/modules/financials/services/treasury.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Landmark, 
  ShieldCheck, 
  Loader2, 
  TrendingUp, 
  Activity,
  History,
  Lock,
  Globe,
  Zap,
  BarChart3
} from "lucide-react";
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { cn, formatCurrency } from '@/lib/utils';
import { WalletNode, FinancialLog, TreasuryKPI } from '@/modules/financials/types/financial.types';

export default function TreasuryCommandPage() {
  const [wallets, setWallets] = useState<WalletNode[]>([]);
  const [kpis, setKpis] = useState<TreasuryKPI[]>([]);
  const [logs, setLogs] = useState<FinancialLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      treasuryService.getCashPosition(),
      treasuryService.getTreasuryKPIs(),
      treasuryService.getLedger()
    ]).then(([w, k, l]) => {
      setWallets(w);
      setKpis(k);
      setLogs(l);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Treasury Connection...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Finance</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Treasury Command</h2>
          <p className="text-muted-foreground font-medium italic">High-fidelity oversight of platform liquidity, settlement finality, and cross-border FX exposure.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 h-14 px-8 uppercase tracking-widest bg-background shadow-md" asChild>
              <Link href={PATHS.ESCROW}>Manage Escrow Registry</Link>
           </Button>
           <div className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-700 shadow-sm animate-in zoom-in duration-500">
              <ShieldCheck className="h-4 w-4" />
              Ledger Finality: Confirmed
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {kpis.map((stat, i) => (
          <Card key={stat.label} className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                <Activity className={cn("h-4 w-4", stat.status === 'optimal' ? 'text-emerald-600' : 'text-orange-600')} />
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter opacity-60 italic">{stat.delta} Drift</p>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* LIQUIDITY HEATMAP */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Cash positioning</CardTitle>
                  <CardDescription className="text-xs font-medium">Aggregated real-time balances across jurisdictional currency nodes.</CardDescription>
                </div>
                <Globe className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-8">
                   {wallets.map((pos) => (
                      <div key={pos.currency} className="p-8 rounded-2xl border-2 bg-muted/5 space-y-6 group hover:border-primary/20 transition-all cursor-default">
                         <div className="flex items-center justify-between">
                            <Badge className="bg-primary text-white text-[10px] font-black uppercase h-6 px-3 border-none">{pos.currency} Node</Badge>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Liquid Liquidity</p>
                            <p className="text-4xl font-black tracking-tighter text-foreground">{formatCurrency(pos.availableLiquidity, pos.currency)}</p>
                         </div>
                         <div className="space-y-4 pt-4 border-t border-muted/50">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                               <span className="text-muted-foreground opacity-60">Escrow Locked</span>
                               <span className="text-orange-600">{formatCurrency(pos.escrowLocked, pos.currency)}</span>
                            </div>
                            <Progress value={(pos.escrowLocked / (pos.balance || 1)) * 100} className="h-1.5 bg-muted rounded-full" />
                         </div>
                      </div>
                   ))}
                </div>
              </CardContent>
           </Card>

           {/* RECENT SETTLEMENT FEED */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Live Settlement Ledger</CardTitle>
                 <History className="h-5 w-5 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/30 border-b-2">
                       <tr>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ledger ID</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                          <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-2">
                       {logs.map((log) => (
                          <tr key={log.id} className="group hover:bg-primary/[0.01] transition-colors">
                             <td className="p-6">
                                <span className="font-mono text-[10px] font-black text-primary uppercase">{log.id}</span>
                             </td>
                             <td className="p-6">
                                <Badge variant="outline" className="text-[8px] font-black uppercase h-5 px-2">{log.type}</Badge>
                             </td>
                             <td className="p-6 font-black text-sm tabular-nums">
                                {formatCurrency(log.amount || 0, log.currency)}
                             </td>
                             <td className="p-6 text-right text-[10px] font-mono text-muted-foreground">
                                {new Date(log.timestamp ?? Date.now()).toLocaleTimeString()}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* TREASURY RISK ADVISORY */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <TrendingUp className="h-5 w-5 text-white" />
                    Treasury Intelligence
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90 leading-snug">
                    "Platform Oracle: FX volatility in the APAC-US corridor is trending +14%. Treasury suggest rebalancing the USD/SGD swap line to optimize settlement finality."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Hedging Status</span>
                       <span className="text-sm font-black uppercase">Active (Locked)</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Liquidity Threshold</span>
                       <span className="text-sm font-black uppercase text-emerald-300">Optimal</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    AUTHORIZE CORRIDOR SWAP
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all cursor-pointer">
              <ShieldCheck className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest">Oracle Sync Protocol</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Treasury nodes are cryptographically verified via the Baalvion Institutional Ledger. All cash positioning is final and settlement-ready."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
