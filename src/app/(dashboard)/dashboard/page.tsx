'use client';

import { useEffect, useState } from 'react';
import { getHeroCards, getKpiData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Activity, 
  Loader2, 
  ArrowUpRight,
  Zap,
  Globe,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Cpu,
  ArrowRight
} from "lucide-react";
import { useAppState } from '../_components/app-state';
import { USER_ROLES } from '@/core/roles';
import { InsightsPanel } from '../_components/insights-panel';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { role } = useAppState();
  const [heroCards, setHeroCards] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHeroCards(), getKpiData()])
      .then(([h, k]) => {
        setHeroCards(h.filter(card => card.role.includes(role)));
        setKpis(k.filter(kpi => kpi.roles.includes(role)));
      })
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Authority Nodes...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wide text-primary">System Pulse v4.2</p>
          <h2 className="text-3xl font-black tracking-tight text-foreground uppercase tracking-tighter leading-none">Global Observatory</h2>
          <p className="text-muted-foreground font-medium text-sm">Operational telemetry for the <span className="text-primary font-bold">{role}</span> perspective.</p>
        </div>
        <div className="flex items-center gap-3 bg-background px-4 py-3 rounded-xl border shadow-sm">
           <ShieldCheck className="h-5 w-5 text-emerald-600" />
           <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">State Integrity</span>
              <span className="text-sm font-black uppercase tracking-tight">Active &amp; Secure</span>
           </div>
        </div>
      </div>

      {/* KPI HERO CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="shadow-sm border hover:border-primary/40 hover:shadow-md transition-all group bg-background rounded-2xl h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2 pt-5 px-5 space-y-0">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground leading-snug">
                  {card.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-5 px-5">
                <div className="text-3xl font-black tracking-tight tabular-nums">
                  {card.prefix}{formatNumber(card.value)}{card.suffix}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground/70 mt-1.5">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
           <Card className="shadow-sm border bg-background overflow-hidden flex flex-col h-full rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-4 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-wider">Network Performance Matrix</CardTitle>
                    <CardDescription className="font-medium text-xs mt-0.5">Real-time health and transactional finality across the node mesh.</CardDescription>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                     <Activity className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2.5 p-4">
                {kpis.map((kpi, idx) => (
                  <motion.div
                    key={kpi.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.06) }}
                    className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all group cursor-default"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                        <kpi.icon className={cn("h-5 w-5", kpi.iconClass || 'text-primary')} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-bold tracking-tight leading-none text-foreground truncate">{kpi.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide truncate">{kpi.description}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1 shrink-0 pl-3">
                      <p className="text-2xl font-black tabular-nums tracking-tight">{kpi.value}</p>
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-bold h-5 uppercase px-2 rounded-full",
                        kpi.change.startsWith('+') ? 'text-green-700 bg-green-50 border-green-200' :
                        kpi.change === 'Stable' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        'text-red-700 bg-red-50 border-red-200'
                      )}>
                        {kpi.change}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {kpis.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center opacity-20">
                     <Zap className="h-10 w-10 mb-3" />
                     <p className="text-[11px] font-bold uppercase tracking-widest">No Active Signals Detected</p>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col h-full gap-6">
           <InsightsPanel />
           
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground flex-1 relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
                 <Globe className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 px-6 pt-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5" />
                    Global Infrastructure Status
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 px-6 relative">
                 <p className="text-lg leading-relaxed font-bold italic opacity-95">
                    "All platform nodes are operating at optimal finality. 14 trade corridors are verified. No systemic anomalies detected in current execution pulse."
                 </p>
                 <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase tracking-wide opacity-60">System Uptime</span>
                       <p className="text-3xl font-black tracking-tighter">99.999%</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase tracking-wide opacity-60">Oracle Sync</span>
                       <p className="text-3xl font-black text-emerald-300 tracking-tighter">LOCKED</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-wide shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    VIEW NETWORK TOPOLOGY <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}