/**
 * @file treasury/page.tsx
 * @description THE GLOBAL TREASURY COMMAND CENTER.
 * Bloomberg-grade liquidity oversight and strategic cash positioning.
 */
'use client';

import { useEffect, useState } from 'react';
import { treasuryService } from '@/modules/financials/services/treasury.service';
import { WalletNode, TreasuryKPI, FinancialLog } from '@/modules/financials/types/financial.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Landmark, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Zap, 
  ArrowUpRight, 
  History, 
  Lock,
  Globe,
  Loader2,
  RefreshCw,
  Download,
  Plus,
  ArrowRight,
  Database
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function TreasuryCommandCenter() {
  const [wallets, setWallets] = useState<WalletNode[]>([]);
  const [kpis, setKpis] = useState<TreasuryKPI[]>([]);
  const [logs, setLogs] = useState<FinancialLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      treasuryService.getCashPosition('COMP-101'),
      treasuryService.getTreasuryKPIs(),
      treasuryService.getLedger('COMP-101')
    ]).then(([w, k, l]) => {
      setWallets(w);
      setKpis(k);
      setLogs(l);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Treasury Rails...</p>
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
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: TREASURY_CORE_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Treasury <br />Command.</h2>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <Download className="mr-3 h-4 w-4" /> Export Ledger
          </Button>
          <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
            <Plus className="mr-3 h-5 w-5 fill-current" /> Provision Capital
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden group hover:border-primary transition-all duration-500">
               <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                  <div className={cn(
                    "p-2 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors",
                    kpi.status === 'optimal' ? 'text-emerald-600' : 'text-orange-600'
                  )}>
                    <TrendingUp className="h-4 w-4" />
                  </div>
               </CardHeader>
               <CardContent className="px-8 pb-8 pt-2">
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{kpi.value}</div>
                  <div className="flex items-center gap-2 mt-3">
                     <span className={cn(
                       "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border",
                       kpi.status === 'optimal' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-orange-50 text-orange-700 border-orange-100"
                     )}>
                       {kpi.delta}
                     </span>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 italic">Finality Index</span>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CASH POSITIONING MATRIX */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col">
           <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
              <div className="space-y-1">
                 <CardTitle className="text-xl font-black uppercase tracking-tighter">Institutional Cash Positioning</CardTitle>
                 <CardDescription className="font-medium italic">Multi-currency liquidity depth across jurisdictional platform nodes.</CardDescription>
              </div>
              <Globe className="h-8 w-8 text-primary opacity-20" />
           </CardHeader>
           <CardContent className="p-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {wallets.map((wallet) => (
                    <div key={wallet.id} className="p-8 rounded-2xl border-2 bg-muted/5 space-y-6 group hover:border-primary/20 transition-all cursor-default relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><Landmark className="h-24 w-24" /></div>
                       <div className="flex items-center justify-between relative z-10">
                          <Badge className="bg-primary text-white text-[10px] font-black uppercase h-6 px-3 border-none shadow-sm">{wallet.currency} Node</Badge>
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       </div>
                       <div className="space-y-1 relative z-10">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Liquid Liquidity</p>
                          <p className="text-4xl font-black tracking-tighter text-foreground">{formatCurrency(wallet.availableLiquidity, wallet.currency)}</p>
                       </div>
                       <div className="space-y-4 pt-4 border-t border-muted/50 relative z-10">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                             <span className="text-muted-foreground opacity-60">Escrow Locked</span>
                             <span className="text-orange-600">{formatCurrency(wallet.escrowLocked, wallet.currency)}</span>
                          </div>
                          <Progress value={(wallet.escrowLocked / wallet.balance) * 100} className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                             <div className="h-full bg-orange-500 animate-pulse" />
                          </Progress>
                       </div>
                    </div>
                 ))}
                 
                 <div className="bg-muted/30 rounded-2xl border-2 border-dashed flex items-center justify-center p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="text-center space-y-6 relative z-10">
                       <RefreshCw className="h-12 w-16 text-primary mx-auto opacity-20 group-hover:rotate-180 transition-transform duration-1000" />
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Federated Sync</p>
                          <p className="text-sm font-medium italic opacity-60 max-w-xs mx-auto">"Provision secondary currency nodes for cross-border rebalancing."</p>
                       </div>
                       <Button variant="outline" className="rounded-2xl border-2 font-black text-[10px] uppercase h-11 px-8 bg-background">Launch Provisioning Wizard</Button>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* FINANCIAL AI ORACLE */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 animate-pulse" />
                    Treasury Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: Strategic rebalancing into the EUR corridor could reduce settlement friction by 12%. Recommend activating the secondary liquidity swap node."
                 </p>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Margin Optimization</span>
                       <span className="text-lg font-black text-emerald-300">+$124k Est.</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Confidence</span>
                       <span className="text-lg font-black text-blue-300">99.8%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE LIQUIDITY SWAP
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Capital Integrity</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Ledger Consistency', val: '100%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Settlement Finality', val: '450ms', icon: Activity, color: 'text-blue-500' },
                   { label: 'Audit Readiness', val: 'Optimal', icon: History, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className={cn("h-5 w-5", stat.color)} /></div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* OPERATIONAL LEDGER FEED */}
      <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 p-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-black uppercase tracking-wide">Operational Ledger Stream</CardTitle>
            <CardDescription className="text-xs font-medium">Real-time immutable trace of institutional settlements and capital releases.</CardDescription>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-primary/5 rounded-full border-2 border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
             <History className="h-4 w-4" /> Live Execution Stream
          </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-muted/30 border-b-2">
                    <tr>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference / ID</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp (UTC)</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Integrity</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-2">
                    {logs.map((log) => (
                       <tr key={log.id} className="group hover:bg-primary/[0.01] transition-colors">
                          <td className="p-6">
                             <div className="flex items-center gap-5">
                                <div className="p-3 rounded-xl bg-muted border-2 shadow-inner group-hover:scale-105 transition-transform"><Lock className="h-5 w-5 text-primary opacity-40" /></div>
                                <div className="space-y-1">
                                   <p className="font-mono text-[11px] font-black text-primary uppercase">{log.id}</p>
                                   <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">REF: {log.referenceId}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-6">
                             <Badge variant="outline" className={cn(
                                "text-[9px] font-black h-6 uppercase px-3 border-2 rounded-full",
                                log.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                             )}>{log.type}</Badge>
                          </td>
                          <td className="p-6 font-black text-lg tabular-nums">
                             {formatCurrency(log.amount || 0, log.currency)}
                          </td>
                          <td className="p-6 text-xs font-medium text-muted-foreground">
                             {new Date(log.timestamp ?? Date.now()).toLocaleTimeString()}
                          </td>
                          <td className="p-6 text-right">
                             <ShieldCheck className="h-5 w-5 text-emerald-600 inline-block opacity-40" />
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
    </main>
  );
}
