
/**
 * @file credit-lines/page.tsx
 * @description Institutional Credit Management and syndicated trade finance oversight.
 */
'use client';

import { useState, useEffect } from 'react';
import { tradeFinanceService } from '@/services/trade-finance-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  Zap, 
  ArrowRight,
  Plus,
  Lock,
  Calculator,
  History,
  FileKey
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function CreditLinesPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tradeFinanceService.getCreditLineStats()
      .then(setStats)
      .catch(() => setStats({ totalLimit: 0, utilized: 0, available: 0, activeLcs: 0, avgRate: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="animate-spin" /></div>;

  return (
    <main className="space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Capital Provisioning</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Trade Finance Node</h2>
          <p className="text-muted-foreground font-medium italic">Manage syndicated credit lines, LC/BG issuance, and institutional liquidity thresholds.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <Calculator className="mr-2 h-4 w-4" /> RE-EVALUATE LIMITS
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> ISSUE LETTER OF CREDIT
           </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* CREDIT UTILIZATION MATRIX */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground rounded-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Landmark className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardHeader className="bg-white/5 border-b border-white/10 p-6 relative">
                 <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <CardTitle className="text-4xl font-black uppercase tracking-tighter">Sovereign Line A</CardTitle>
                       <p className="text-[10px] font-black uppercase tracking-wide opacity-60">Financier: JPMorgan Chase Node</p>
                    </div>
                    <Badge className="bg-emerald-500 text-emerald-950 text-[10px] font-black h-7 px-4 rounded-full border-none shadow-xl">ACTIVE_SECURED</Badge>
                 </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8 relative">
                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-wide opacity-60">Aggregate Limit</p>
                       <p className="text-4xl font-black tracking-tighter">{formatCurrency(stats.totalLimit)}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-wide opacity-60">Utilization Weight</p>
                       <p className="text-4xl font-black text-indigo-300 tracking-tighter">{Math.round((stats.utilized/stats.totalLimit)*100)}%</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="opacity-60">Liquidity Depth</span>
                       <span className="text-emerald-400">{formatCurrency(stats.available)} Available</span>
                    </div>
                    <Progress value={25} className="h-2 bg-white/10 shadow-inner" />
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                    <div className="text-center space-y-1">
                       <p className="text-[9px] font-black uppercase opacity-40">Active LCs</p>
                       <p className="text-xl font-black">{stats.activeLcs}</p>
                    </div>
                    <div className="text-center space-y-1 border-x border-white/10">
                       <p className="text-[9px] font-black uppercase opacity-40">Cost of Capital</p>
                       <p className="text-xl font-black">{stats.avgRate}%</p>
                    </div>
                    <div className="text-center space-y-1">
                       <p className="text-[9px] font-black uppercase opacity-40">Finality Sync</p>
                       <p className="text-xl font-black text-emerald-400">100%</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* INSTRUMENT HISTORY */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Active Finance Instruments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {[
                      { id: 'LC-9921', type: 'Letter of Credit', value: 850000, status: 'issued', counterparty: 'Shanghai PV Ltd' },
                      { id: 'FIN-4421', type: 'Invoice Financing', value: 120000, status: 'funded', counterparty: 'Global Steels' },
                    ].map(inst => (
                       <div key={inst.id} className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-6">
                             <div className="h-12 w-12 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"><FileKey className="h-6 w-6 text-primary opacity-60" /></div>
                             <div className="space-y-1">
                                <p className="font-black text-lg uppercase tracking-tight leading-none">{inst.type}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">ID: {inst.id} • {inst.counterparty}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <span className="font-black text-base">{formatCurrency(inst.value)}</span>
                             <Badge variant="outline" className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border-2 border-emerald-200 px-3 h-6 rounded-full">{inst.status}</Badge>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* RISK ORACLE */}
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Finance Intelligence</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 <p className="text-sm font-bold italic leading-relaxed opacity-80 text-center">
                    "Treasury Pulse: Global interest rate volatility is trending +14% for USD corridors. Suggest accelerating high-value LC issuance to lock current preferential rates."
                 </p>
                 <div className="space-y-6">
                    {[
                      { label: 'Default Probability', val: '0.02%', status: 'Minimal' },
                      { label: 'Settlement Stress', val: 'Low', status: 'Stable' }
                    ].map(stat => (
                       <div key={stat.label} className="flex justify-between items-center group cursor-default">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                          <span className="text-xl font-black tracking-tighter group-hover:scale-110 transition-transform">{stat.val}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all">
              <ShieldCheck className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest">Two-Key Finality</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Trade finance issuance requires cryptographical sign-off from both Buyer Treasury and Advising Bank. Mandatory forensic audit applied to all $1M+ instruments."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
