'use client';

/**
 * @file page.tsx
 * @description THE BUYER COMMAND OBSERVATORY. 
 * High-fidelity, Bloomberg-grade strategic dashboard for trade oversight.
 * FINALIZED: Integrated High-Density SDL and Geopolitical Velocity Mapping.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Globe, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  ArrowUpRight, 
  Compass,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  Loader2,
  Scaling,
  Dna
} from 'lucide-react';
import { cn, formatCurrency, formatNumber, getFlag } from '@/lib/utils';
import { motion } from 'framer-motion';
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

const MOCK_FLOWS = [
  { jurisdiction: 'United States', volume: 450000000, activeNodes: 42, compliancePassRate: 99.8, intensity: 95 },
  { jurisdiction: 'China', volume: 380000000, activeNodes: 31, compliancePassRate: 94.2, intensity: 88 },
  { jurisdiction: 'India', volume: 210000000, activeNodes: 28, compliancePassRate: 98.4, intensity: 75 },
  { jurisdiction: 'Singapore', volume: 150000000, activeNodes: 14, compliancePassRate: 100, intensity: 62 }
];

export default function BuyerCommandObservatory() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 animate-pulse">Synchronizing Authority Nodes...</p>
      </div>
    );
  }

  return (
    <main className="space-y-12 pb-32">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Authority: BUYER_COMMAND_ALPHA</p>
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] text-white">Strategic <br />Observatory.</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="h-16 px-10 border-2 border-white/5 bg-white/5 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-white/10 transition-all">
            <RefreshCw className="mr-3 h-4 w-4" /> Global Re-Sync
          </Button>
          <Button className="h-16 px-12 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-4xl hover:scale-105 transition-all rounded-2xl">
            <Zap className="mr-3 h-5 w-5 fill-current" /> Execute Mandate
          </Button>
        </div>
      </div>

      {/* STRATEGIC KPI GRID - Bloomberg Density */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Settlement Finality', value: '450ms', trend: -12, status: 'optimal', desc: 'Cross-node latency' },
          { label: 'Decision Latency', value: '4.2h', trend: -4, status: 'stable', desc: 'Avg. handshake time' },
          { label: 'Corridor Load', value: '84%', trend: 14, status: 'at_risk', desc: 'Throughput vs Capacity' },
          { label: 'Integrity Index', value: '99.98%', trend: 0.01, status: 'optimal', desc: 'Ledger consistency' }
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="shadow-none border-none bg-slate-900/40 rounded-[32px] overflow-hidden group hover:bg-white/[0.02] transition-all duration-500 relative">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Scaling className="h-16 w-16" /></div>
               <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    {kpi.label}
                  </CardTitle>
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    kpi.status === 'at_risk' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
                  )}>
                    <Activity className="h-4 w-4" />
                  </div>
               </CardHeader>
               <CardContent className="px-8 pb-8 pt-2 relative z-10">
                  <div className="text-5xl font-black tracking-tighter tabular-nums text-white">{kpi.value}</div>
                  <div className="flex items-center gap-3 mt-4">
                     <span className={cn(
                       "text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full border",
                       kpi.trend < 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                     )}>
                       {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                     </span>
                     <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic opacity-60">{kpi.desc}</span>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* MAIN INTELLIGENCE MATRIX */}
      <div className="grid gap-12 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-none border-none bg-slate-900/20 rounded-[48px] overflow-hidden flex flex-col h-[650px] relative group border border-white/5">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <CardHeader className="bg-white/5 border-b border-white/5 p-12 flex flex-row items-center justify-between z-10">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">Jurisdictional Trade Velocity</CardTitle>
                 <CardDescription className="text-slate-400 font-medium italic">High-fidelity intensity mapping of planetary liquidity and node finality.</CardDescription>
              </div>
              <Globe className="h-10 w-10 text-primary opacity-20 animate-pulse" />
           </CardHeader>
           <CardContent className="p-12 flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-10 overflow-y-auto terminal-scroll pr-6">
                 {MOCK_FLOWS.map((flow) => (
                    <div key={flow.jurisdiction} className="space-y-4 group cursor-default">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <span className="text-3xl filter drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all">{getFlag(flow.jurisdiction)}</span>
                             <div className="space-y-0.5">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">{flow.jurisdiction}</span>
                                <p className="text-[9px] font-bold text-slate-600 uppercase">Audit Pass: {flow.compliancePassRate}%</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-base font-black text-primary tabular-nums">{formatNumber(flow.volume)}</span>
                             <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Aggregate Flow</p>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${flow.intensity}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full bg-primary relative"
                          >
                             <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </motion.div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="bg-slate-950/40 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 text-center space-y-8 relative overflow-hidden group">
                 <Compass className="h-20 w-20 text-primary opacity-10 group-hover:opacity-40 group-hover:rotate-45 transition-all duration-700" />
                 <div className="space-y-2 relative z-10">
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-white">Spatial Discovery</p>
                    <p className="text-xs font-medium italic text-slate-500 leading-relaxed px-6">"Interactive Node Topology is synchronized with the Global SSOT Ledger."</p>
                 </div>
                 <Button variant="outline" className="rounded-2xl border-2 border-white/10 text-white font-black text-[10px] uppercase h-12 px-10 bg-slate-900 shadow-2xl hover:bg-slate-800 transition-all">Launch Topology Graph</Button>
              </div>
           </CardContent>
        </Card>

        {/* AI STRATEGY ORACLE */}
        <div className="lg:col-span-4 space-y-12">
           <Card className="shadow-4xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-[48px] h-[450px]">
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 p-12">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-6 text-white">
                    <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                    Strategy Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-12 relative space-y-12">
                 <p className="text-3xl font-bold italic leading-[1.1] opacity-95 tracking-tighter text-white">
                    "AI Forecast: Systemic shift in the APAC electronics corridor detected. Recommend rebalancing liquidity nodes into Mumbai to capture 14.2% yield delta."
                 </p>
                 <Button variant="secondary" className="w-full h-20 font-black uppercase text-[12px] tracking-[0.4em] shadow-4xl bg-white text-primary border-none rounded-[24px] hover:scale-[1.02] transition-transform">
                    OPTIMIZE ROUTING MATRIX
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
