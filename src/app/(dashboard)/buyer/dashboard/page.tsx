'use client';

/**
 * @file buyer/dashboard/page.tsx
 * @description Buyer Command Observatory — live buyer KPIs + real per-country trade velocity.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBuyerDashboardData, BuyerDashboardData } from '@/services/buyer-service';
import { adminService, HeatmapData } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity, Globe, Zap, ShieldCheck, FileText, PackageCheck, Wallet, Truck,
  RefreshCw, Loader2, ArrowRight, TrendingUp,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber, getFlag } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function BuyerCommandObservatory() {
  const [data, setData] = useState<BuyerDashboardData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([getBuyerDashboardData(), adminService.getTradeHeatmapData()])
      .then(([d, h]) => { setData(d); setHeatmap(Array.isArray(h) ? h : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, []);

  if (loading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Synchronizing buyer node…</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Active RFQs', value: String(data.kpis.activeRfqs), sub: 'Open tenders', icon: FileText, tone: 'text-blue-400', href: '/buyer/rfqs' },
    { label: 'Open Orders', value: String(data.kpis.activeOrders), sub: 'In execution', icon: PackageCheck, tone: 'text-primary', href: '/orders' },
    { label: 'Pending Payments', value: String(data.kpis.pendingPayments), sub: 'Awaiting release', icon: Wallet, tone: 'text-amber-400', href: '/payments' },
    { label: 'Shipments In Transit', value: String(data.kpis.shipmentsInTransit), sub: 'Live tracking', icon: Truck, tone: 'text-emerald-400', href: '/logistics-shipment' },
  ];

  const maxVol = Math.max(1, ...heatmap.map((h) => h.volume));

  return (
    <main className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Buyer Command</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none text-white">Strategic Observatory</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={load} variant="outline" className="h-11 px-5 border border-white/10 bg-white/5 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white/10 transition-all text-white">
            <RefreshCw className="mr-2 h-4 w-4" /> Re-Sync
          </Button>
          <Link href="/buyer/rfqs/new">
            <Button className="h-11 px-6 bg-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:scale-[1.02] transition-all rounded-xl">
              <Zap className="mr-2 h-4 w-4 fill-current" /> New RFQ
            </Button>
          </Link>
        </div>
      </div>

      {/* LIVE KPI GRID */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link href={k.href}>
              <Card className="border border-white/5 bg-slate-900/40 rounded-2xl group hover:bg-white/[0.04] transition-all h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{k.label}</span>
                    <k.icon className={cn('h-4 w-4', k.tone)} />
                  </div>
                  <div className="text-3xl font-black tracking-tight tabular-nums text-white mt-2">{k.value}</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">{k.sub} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" /></div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* REAL TRADE VELOCITY */}
        <Card className="lg:col-span-8 shadow-sm bg-slate-900/20 rounded-2xl overflow-hidden border border-white/5">
          <CardHeader className="bg-white/5 border-b border-white/5 px-6 py-5 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Jurisdictional Trade Velocity</CardTitle>
              <CardDescription className="text-slate-400 font-medium text-xs">Live volume aggregated by counterparty jurisdiction.</CardDescription>
            </div>
            <Globe className="h-7 w-7 text-primary opacity-20" />
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {heatmap.length === 0 && (
              <div className="py-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">No corridor activity yet</div>
            )}
            {heatmap.map((flow) => (
              <div key={flow.country} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{getFlag(flow.country)}</span>
                    <div>
                      <span className="text-sm font-bold tracking-tight text-slate-200">{flow.country}</span>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{flow.activeRfqs} RFQs · {flow.activeDeals} deals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-white tabular-nums">{formatCurrency(flow.volume)}</span>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Aggregate Flow</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(4, (flow.volume / maxVol) * 100)}%` }} transition={{ duration: 1, ease: 'circOut' }} className="h-full bg-primary" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* STRATEGY SENTINEL */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-white/10 p-6">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-90 flex items-center gap-2.5 text-white">
                <Zap className="h-4 w-4 text-yellow-300" /> Strategy Sentinel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <p className="text-xl font-bold leading-snug text-white">
                {heatmap[0]
                  ? `${heatmap[0].country} leads your corridor flow at ${formatCurrency(heatmap[0].volume)}. Prioritize RFQ coverage there to capture the active demand.`
                  : 'Publish your first RFQ to start sourcing across the global marketplace.'}
              </p>
              <Link href="/marketplace">
                <Button variant="secondary" className="w-full h-12 font-bold uppercase text-[11px] tracking-wide bg-white text-primary border-none rounded-xl hover:bg-white/90">
                  Explore Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-white/5 bg-slate-900/40 rounded-2xl">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <Activity className="h-4 w-4 text-emerald-400" /> Recent Activity
              </div>
              {data.activities.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-1.5 border-t border-white/5 first:border-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-600">{a.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
