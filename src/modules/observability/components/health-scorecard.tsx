/**
 * @file health-scorecard.tsx
 * @description High-fidelity visualization of institutional system health.
 */
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Activity, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { HealthStatus } from '../types';

interface HealthScorecardProps {
  score: number;
  status: HealthStatus;
  label: string;
}

export function HealthScorecard({ score, status, label }: HealthScorecardProps) {
  const isOptimal = status === 'OPTIMAL';
  const isCritical = status === 'CRITICAL';

  return (
    <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
       <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
             <div className="p-3 rounded-2xl bg-muted border group-hover:bg-primary/5 transition-colors">
                <ShieldCheck className={cn("h-5 w-5", isOptimal ? "text-emerald-500" : "text-orange-500")} />
             </div>
             <Badge variant="outline" className={cn(
               "text-[9px] font-black uppercase h-6 px-3 border-2 rounded-full",
               isOptimal ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-200"
             )}>{status}</Badge>
          </div>
          
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</p>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter tabular-nums">{score}%</span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase">Stable</span>
             </div>
          </div>

          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${score}%` }}
               transition={{ duration: 1.5, ease: "circOut" }}
               className={cn("h-full", isOptimal ? "bg-emerald-500" : "bg-orange-500")}
             />
          </div>
       </CardContent>
    </Card>
  );
}
