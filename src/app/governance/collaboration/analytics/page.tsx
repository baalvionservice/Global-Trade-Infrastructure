/**
 * @file collaboration/analytics/page.tsx
 * @description Institutional Collaboration Intelligence dashboard.
 * Monitors operational response times, escalation resolution speed, and coordination efficiency.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Activity, 
  Users, 
  Zap, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  TrendingUp, 
  Loader2,
  ArrowUpRight,
  Landmark,
  Globe,
  Share2,
  History,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function CollaborationAnalyticsPage() {
  const chartData = [
    { name: 'W1', sync: 84 },
    { name: 'W2', sync: 92 },
    { name: 'W3', sync: 88 },
    { name: 'W4', sync: 99.8 },
  ];

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Coordination Intelligence</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Coordination Analytics</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority oversight of organizational synchronization, response finality, and cross-functional throughput.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Activity className="h-4 w-4" />
              Sync Integrity: OPTIMAL
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Avg. Response Time', val: '4.2m', delta: '-12%', icon: Clock, color: 'text-emerald-600' },
          { label: 'Escalation Finality', val: '99.4%', delta: '+2.4%', icon: ShieldCheck, color: 'text-blue-600' },
          { label: 'Network Handshakes', val: '14,240', delta: '+842', icon: Users, color: 'text-primary' },
          { label: 'Coordination Latency', val: '140ms', delta: 'Stable', icon: Zap, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="text-3xl font-black tracking-tighter tabular-nums">{stat.val}</div>
                  <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase border-none bg-muted/50">{stat.delta}</Badge>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col h-[500px]">
           <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-xl font-black uppercase tracking-tighter">Organizational Synchronization Pulse</CardTitle>
                 <CardDescription className="text-xs font-medium">Real-time mapping of cross-domain coordination and ledger-alignment finality.</CardDescription>
              </div>
              <Globe className="h-8 w-8 text-primary opacity-20" />
           </CardHeader>
           <CardContent className="p-6 h-full">
              <ChartContainer config={{ sync: { label: "Coherence", color: "hsl(var(--primary))" } }}>
                 <AreaChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[10px] font-black uppercase" />
                    <YAxis hide domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="sync" stroke="var(--color-sync)" fill="var(--color-sync)" fillOpacity={0.1} strokeWidth={5} />
                 </AreaChart>
              </ChartContainer>
           </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Coordination Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: Systemic communication lag detected in the US-West logistics corridor. Decision latency is trending +14%. Recommend autonomous war-room provisioning."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Friction Delta</span>
                       <span className="text-xl font-black text-red-300 tracking-tighter">+14%</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Model Conf.</span>
                       <span className="text-xl font-black text-emerald-300 tracking-tighter">98.4%</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[12px] tracking-wide shadow-md bg-white text-primary border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    REBALANCE DIALOGUE NODES
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
