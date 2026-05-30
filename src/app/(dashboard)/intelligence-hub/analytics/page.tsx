/**
 * @file intelligence-hub/analytics/page.tsx
 * @description THE STRATEGIC BI COMMAND OBSERVATORY. 
 * Re-engineered entry point for global institutional analytics and operational cognition.
 */
'use client';

import { useEffect } from 'react';
import { analyticsService } from '@/modules/analytics/services/analytics.service';
import { useAnalyticsStore } from '@/modules/analytics/store/use-analytics-store';
import { ExecutiveCommandGrid } from '@/modules/analytics/components/executive-command-grid';
import { DataWarehouseHealth } from '@/modules/analytics/components/data-warehouse-health';
import { OperationalForecastingPanel } from '@/modules/analytics/components/operational-forecasting-panel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { 
  Loader2, 
  RefreshCw, 
  Download, 
  PieChart, 
  Globe,
  TrendingUp,
  Database
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function StrategicAnalyticsObservatory() {
  const { kpis, setKpis, warehouse, setWarehouse, spend, setSpend, isSyncing, setSyncing } = useAnalyticsStore();

  const fetchData = async () => {
    setSyncing(true);
    const [kPulse, wHealth, sDeepDive] = await Promise.all([
      analyticsService.getExecutivePulse(),
      analyticsService.getWarehouseHealth(),
      analyticsService.getSpendDeepDive()
    ]);
    setKpis(kPulse);
    setWarehouse(wHealth);
    setSpend(sDeepDive);
    setSyncing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (kpis.length === 0 || !warehouse) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Strategic Oracle...</p>
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
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: BI_COMMAND_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Strategic <br />Intelligence.</h2>
          <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">"Authoritative planetary oversight of institutional procurement, cash positioning, and execution finality."</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md group" onClick={fetchData}>
            <RefreshCw className={cn("mr-3 h-4 w-4 transition-transform duration-700", isSyncing && "animate-spin")} /> Global Re-Sync
          </Button>
          <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
            <Download className="mr-3 h-4 w-4" /> Export Executive Pack
          </Button>
        </div>
      </div>

      <ExecutiveCommandGrid kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* SPEND VELOCITY MONITOR */}
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Planetary Spend Velocity</CardTitle>
                  <CardDescription className="text-sm font-medium italic">High-fidelity intensity mapping of global procurement liquidity across jurisdictional nodes.</CardDescription>
                </div>
                <Globe className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-6 flex-1 grid md:grid-cols-2 gap-6">
                 <div className="space-y-8">
                    {spend?.breakdown.map((item) => (
                       <div key={item.category} className="space-y-3 group cursor-default">
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{item.category} Node</span>
                             <div className="text-right">
                                <span className="text-sm font-black text-primary tabular-nums">{formatCurrency(item.amount)}</span>
                                <p className={cn("text-[9px] font-bold uppercase tracking-widest", item.trend > 0 ? "text-emerald-600" : "text-red-600")}>
                                  {item.trend > 0 ? '+' : ''}{item.trend}% growth
                                </p>
                             </div>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner relative">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${item.percentage}%` }}
                               transition={{ duration: 1.5, ease: "circOut" }}
                               className="h-full bg-primary"
                             />
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="bg-muted/30 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center space-y-6 group">
                    <PieChart className="h-12 w-16 text-primary opacity-20 group-hover:scale-110 transition-transform duration-700" />
                    <div className="space-y-1">
                       <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Allocation Matrix</p>
                       <p className="text-sm font-medium italic opacity-60 max-w-xs mx-auto">"Corridor-level liquidity rebalancing is recommended for the APAC-US renewables cluster."</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-2 font-black text-[10px] uppercase h-11 px-8 bg-background shadow-md">Review Routing Matrix</Button>
                 </div>
              </CardContent>
           </Card>

           <DataWarehouseHealth health={warehouse} />
        </div>

        <div className="lg:col-span-4 space-y-6">
           <OperationalForecastingPanel signals={[
             {
               id: 'F1',
               targetMetric: 'Settlement Finality',
               horizon: '30d',
               predictedValue: 420,
               confidenceScore: 0.98,
               impactLevel: 'critical',
               recommendation: 'Treasury Signal: Global FX drift in the USD/INR corridor is trending +14%. Recommend autonomous swap activation.',
               probabilityDensity: [0.1, 0.2, 0.4, 0.2, 0.1]
             },
             {
               id: 'F2',
               targetMetric: 'Sourcing Demand',
               horizon: '90d',
               predictedValue: 1240,
               confidenceScore: 0.84,
               impactLevel: 'medium',
               recommendation: 'Industrial Foresight: Surge in high-purity silicon demand predicted for Q3. Secure Tier 1 supplier capacity now.',
               probabilityDensity: [0.1, 0.1, 0.3, 0.4, 0.1]
             }
           ]} />

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Ratios</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Asset Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Node Symmetry', val: '100%', icon: Database, color: 'text-blue-500' },
                   { label: 'Signal Accuracy', val: '98.4%', icon: TrendingUp, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className={cn("h-5 w-5", stat.color)} /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
