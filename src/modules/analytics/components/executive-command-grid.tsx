/**
 * @file executive-command-grid.tsx
 * @description High-density grid of strategic institutional KPIs with trend visualizations.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Landmark, 
  Globe, 
  Box 
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { KpiDefinition } from '../types';

interface ExecutiveCommandGridProps {
  kpis: KpiDefinition[];
}

const icons: Record<string, any> = {
  FINANCIAL: Landmark,
  OPERATIONAL: Zap,
  COMPLIANCE: ShieldCheck,
  LOGISTICS: Globe,
  STRATEGIC: Box
};

export function ExecutiveCommandGrid({ kpis }: ExecutiveCommandGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => {
        const Icon = icons[kpi.category] || Activity;
        const isOptimal = kpi.status === 'optimal';

        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="shadow-2xl border-2 border-primary/5 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-8 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <div className={cn(
                  "p-2.5 rounded-xl transition-all shadow-inner border border-primary/5",
                  isOptimal ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-6">
                <div className="flex items-baseline gap-1.5">
                   <div className="text-4xl font-black tracking-tighter tabular-nums text-foreground">
                     {typeof kpi.value === 'number' ? formatNumber(kpi.value) : kpi.value}{kpi.unit}
                   </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                   <Badge variant="outline" className={cn(
                     "text-[9px] font-black h-6 px-2.5 rounded-full border-2",
                     kpi.trend === 'up' && isOptimal ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                     kpi.trend === 'down' && isOptimal ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                     "bg-orange-50 text-orange-700 border-orange-100"
                   )}>
                     {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                     {kpi.delta}%
                   </Badge>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 italic tracking-tighter">Planetary Drift Index</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
