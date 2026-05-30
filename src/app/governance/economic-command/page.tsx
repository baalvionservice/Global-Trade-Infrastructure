/**
 * @file economic-command/page.tsx
 * @description Sovereign Economic Command & Infrastructure Efficiency Observatory.
 * High-authority strategic command for financial sustainability and cost engineering.
 */
'use client';

import { useEffect, useState } from 'react';
import { costIntelligenceService, EconomicPulse } from '@/services/cost-intelligence-service';
import { treasuryService } from '@/modules/financials/services/treasury.service';
import { LiquidityHeatmap } from '@/components/financials/liquidity-heatmap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingDown, 
  Zap, 
  Activity, 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  ChevronLeft,
  Scale,
  PieChart,
  BarChart3,
  Landmark,
  Database,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function EconomicCommandPage() {
  const [pulse, setPulse] = useState<EconomicPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      costIntelligenceService.getEconomicPulse()
    ]).then(([p]) => {
      setPulse(p);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !pulse) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Economic Oracle...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Finance</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Economic Command</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority oversight of infrastructure profitability, regional cost arbitrage, and transactional efficiency.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Scale className="h-4 w-4" />
              State: ECONOMICALLY_OPTIMIZED
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary" onClick={() => costIntelligenceService.optimizeWorkloadAllocation()}>
              <Zap className="mr-2 h-4 w-4" /> Rebalance Infrastructure
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* LIQUIDITY REBALANCING MATRIX */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Global Liquidity Positioning</CardTitle>
                  <CardDescription className="text-xs font-medium">Authoritative distribution of institutional trade capital across jurisdictional nodes.</CardDescription>
                </div>
                <Globe className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-6">
                 <LiquidityHeatmap />
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* ECONOMIC ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-slate-950 text-white relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Landmark className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-emerald-400">
                    <Zap className="h-5 w-5 animate-pulse" />
                    Treasury Intelligence
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "Platform Oracle: FX volatility in the APAC-US corridor is trending +14%. Treasury suggest rebalancing the USD/SGD swap line to optimize settlement finality."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 text-white">Savings Potential</p>
                       <p className="text-xl font-black text-emerald-400">$12,420/Mo</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 text-white">Margin Lift</p>
                       <p className="text-xl font-black text-indigo-300">+2.4%</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-widest shadow-2xl bg-white text-slate-950 border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    AUTHORIZE CORRIDOR SWAP
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Economic Health</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Settlement Speed', val: '12.4s', icon: Activity, color: 'text-emerald-500' },
                   { label: 'Treasury Depth', val: '$1.84B', icon: Landmark, color: 'text-blue-500' },
                   { label: 'Consensus Rate', val: '99.98%', icon: ShieldCheck, color: 'text-indigo-500' }
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
        </div>
      </div>
    </main>
  );
}
