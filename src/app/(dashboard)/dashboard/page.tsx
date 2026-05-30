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
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Syncing Authority Nodes...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-12 p-4 md:p-12 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">System Pulse v4.2</p>
          <h2 className="text-5xl font-black tracking-tight text-foreground uppercase tracking-tighter leading-none">Global Observatory</h2>
          <p className="text-muted-foreground font-medium italic text-lg">Authoritative operational telemetry for the <span className="text-primary font-black uppercase">{role}</span> perspective.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-4 bg-background p-6 rounded-[32px] border-2 shadow-2xl border-primary/5">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-muted-foreground uppercase leading-none tracking-[0.3em] mb-1">State Integrity</span>
                 <span className="text-lg font-black uppercase tracking-tight">ACTIVE & SECURE</span>
              </div>
           </div>
        </div>
      </div>

      {/* INVESTOR-FRIENDLY HERO CARDS */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {heroCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="shadow-xl border-2 border-primary/5 hover:border-primary/40 transition-all group overflow-hidden bg-background rounded-[32px]">
              <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="p-3 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <card.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-10 px-8">
                <div className="text-4xl font-black tracking-tighter tabular-nums">
                  {card.prefix}{formatNumber(card.value)}{card.suffix}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-tight opacity-40 italic">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-10">
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col h-full rounded-[40px]">
              <CardHeader className="bg-muted/10 border-b pb-8 px-10 pt-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.3em]">Network Performance Matrix</CardTitle>
                    <CardDescription className="font-medium text-xs mt-1">Real-time health and transactional finality across the node mesh.</CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-[20px] bg-primary/5 flex items-center justify-center border-2 border-primary/10 shadow-inner">
                     <Activity className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 pt-12 px-10 pb-12">
                {kpis.map((kpi, idx) => (
                  <motion.div 
                    key={kpi.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    className="flex items-center justify-between p-8 rounded-[32px] border-2 border-primary/5 bg-card hover:border-primary/40 hover:shadow-2xl transition-all group cursor-default"
                  >
                    <div className="flex items-center gap-8">
                      <div className="p-5 bg-primary/5 rounded-[24px] group-hover:bg-primary/10 transition-colors shadow-inner border border-primary/5">
                        <kpi.icon className={cn("h-8 w-8", kpi.iconClass || 'text-primary')} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black uppercase tracking-tight leading-none text-foreground/90">{kpi.title}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em] opacity-40">{kpi.description}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <p className="text-4xl font-black tabular-nums tracking-tighter">{kpi.value}</p>
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black h-6 uppercase px-3 border-2 rounded-full tracking-tighter",
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
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-10">
                     <Zap className="h-16 w-16 mb-6" />
                     <p className="text-xs font-black uppercase tracking-[0.4em]">No Active Signals Detected</p>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col h-full gap-10">
           <InsightsPanel />
           
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground flex-1 relative overflow-hidden group rounded-[40px]">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
                 <Globe className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 px-10 pt-10">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5" />
                    Global Infrastructure Status
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10 pt-10 px-10 relative">
                 <p className="text-lg leading-relaxed font-bold italic opacity-95">
                    "All platform nodes are operating at optimal finality. 14 trade corridors are verified. No systemic anomalies detected in current execution pulse."
                 </p>
                 <div className="grid grid-cols-2 gap-10 pt-6 border-t border-white/10">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">System Uptime</span>
                       <p className="text-3xl font-black tracking-tighter">99.999%</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Oracle Sync</span>
                       <p className="text-3xl font-black text-emerald-300 tracking-tighter">LOCKED</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-16 font-black uppercase text-[11px] tracking-[0.3em] shadow-3xl bg-white text-primary border-none rounded-[16px] hover:scale-[1.02] transition-transform">
                    VIEW NETWORK TOPOLOGY <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}