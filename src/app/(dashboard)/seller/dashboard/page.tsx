/**
 * @file page.tsx
 * @description THE SELLER COMMAND OBSERVATORY. 
 * High-fidelity cockpit for institutional revenue management, demand signal discovery, and negotiation finality.
 */
'use client';

import { useEffect, useState } from 'react';
import { sellerService } from '@/services/seller-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Loader2, 
  ArrowRight,
  Wallet,
  Globe,
  Plus,
  Landmark,
  ArrowUpRight,
  Target,
  FileText,
  History
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
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { InsightsPanel } from '../../_components/insights-panel';

export default function SellerCommandObservatory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Establishing Seller Node Handshake...</p>
      </div>
    );
  }

  return (
    <main className="space-y-12 pb-24">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Authority Node: SELLER_COMMAND_GPS_01</p>
          </div>
          <h2 className="text-6xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Seller <br />Observatory.</h2>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-16 px-10 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <Landmark className="mr-3 h-4 w-4" /> Treasury Re-Sync
          </Button>
          <Button className="h-16 px-12 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-3xl hover:scale-[1.02] transition-all">
            <Plus className="mr-3 h-5 w-5 fill-current" /> Create Proposal
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Settled Revenue', val: formatCurrency(data.stats.revenue), sub: '+12.4% WoW', icon: Wallet, color: 'text-emerald-600' },
          { label: 'Active Deals', val: data.stats.activeDeals, sub: '5 High-Affinity', icon: Zap, color: 'text-primary' },
          { label: 'Market Visibility', val: '4.2k', sub: 'Nodes reached', icon: Globe, color: 'text-blue-600' },
          { label: 'Finality Health', val: '99.98%', sub: 'Zero Sync Drift', icon: ShieldCheck, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-lg border-2 border-primary/5 bg-background h-full group hover:border-primary/20 transition-all rounded-[32px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">{stat.label}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="text-3xl font-black tracking-tighter tabular-nums">{stat.val}</div>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60 italic">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-10">
           {/* REVENUE VELOCITY */}
           <Card className="shadow-none border-2 bg-background rounded-[48px] overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="bg-muted/10 border-b p-10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Revenue Finality Stream</CardTitle>
                  <CardDescription className="text-sm font-medium italic mt-1">Capital release tracking across active commercial mandates.</CardDescription>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-10 flex-1">
                 <ChartContainer config={{ rev: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
                    <AreaChart data={Array.isArray(data.revenueTrend) ? data.revenueTrend : []}>
                       <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-50" />
                       <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[10px] font-black uppercase" />
                       <YAxis tickLine={false} axisLine={false} className="text-[10px] font-black" tickFormatter={v => `$${Number(v)/1000}k`} />
                       <Tooltip content={<ChartTooltipContent />} />
                       <Area type="monotone" dataKey="rev" stroke="var(--color-rev)" fill="var(--color-rev)" fillOpacity={0.1} strokeWidth={5} />
                    </AreaChart>
                 </ChartContainer>
              </CardContent>
           </Card>

           {/* ACTIVE DEMAND PULSE */}
           <Card className="shadow-none border-2 bg-background rounded-[48px] overflow-hidden">
              <CardHeader className="bg-muted/10 border-b p-10">
                 <CardTitle className="text-lg font-black uppercase tracking-tighter">Strategic Demand Registry</CardTitle>
                 <CardDescription className="text-xs">Incoming RFQs matching your institutional capabilities and corridor specializations.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {data.rfqs.map((rfq: any) => (
                       <div key={rfq.id} className="p-10 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className="h-16 w-16 rounded-[24px] bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <Target className="h-8 w-8 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1.5">
                                <div className="flex items-center gap-4">
                                   <p className="font-black text-xl uppercase tracking-tighter leading-none">{rfq.productName}</p>
                                   <Badge className="bg-primary text-white text-[8px] font-black h-5 px-2 border-none shadow-lg tracking-widest">{rfq.category}</Badge>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Buyer: {rfq.buyerName} • Target Value: {formatCurrency(rfq.targetValue)}</p>
                             </div>
                          </div>
                          <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-primary border-2 border-transparent group-hover:border-primary/20 h-12 px-6 rounded-2xl transition-all">
                             PREPARE BID <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* INTELLIGENCE SIDEBAR */}
        <div className="lg:col-span-4 space-y-10">
           <InsightsPanel companyId="COMP-102" />

           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-[48px]">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-10 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-4 text-white">
                    <TrendingUp className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Demand Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 relative space-y-12">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Market Signal: Industrial demand for utility-scale lithium batching in the Germany-US corridor is trending +24%. Recommend prioritizing the 'Beacon Tech' proposal for Q4 capture."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-[32px] bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Market Depth</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">HIGH</span>
                    </div>
                    <div className="p-8 rounded-[32px] bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Conversion</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">92%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-20 font-black uppercase text-[12px] tracking-[0.4em] shadow-4xl bg-white text-primary border-none rounded-[20px] hover:scale-[1.02] transition-transform">
                    LAUNCH PROPOSAL BUILDER
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-10 space-y-12 rounded-[48px]">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Fulfillment Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-10">
                 {[
                   { label: 'Network Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Active Shipments', val: '12', icon: Activity, color: 'text-blue-500' },
                   { label: 'Audit Readiness', val: 'Optimal', icon: History, color: 'text-indigo-500' }
                 ].map((stat: any) => (
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
