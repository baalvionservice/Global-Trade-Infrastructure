/**
 * @file operational-forecasting-panel.tsx
 * @description Predictive analytics visualization for future institutional demand and systemic risk.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  Zap, 
  TrendingUp,
  Compass
} from 'lucide-react';
import { ForecastSignal } from '../types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function OperationalForecastingPanel({ signals }: { signals: ForecastSignal[] }) {
  return (
    <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
      <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
        <BrainCircuit className="h-80 w-80 brightness-0 invert" />
      </div>
      <CardHeader className="pb-4 relative border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                Strategic Foresight Oracle
              </CardTitle>
           </div>
           <Badge variant="outline" className="text-[8px] font-black text-white border-white/20 uppercase tracking-widest px-3 h-6">v4.2 PROBABILISTIC</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 relative space-y-8">
        <div className="space-y-6">
          {signals.map((signal, i) => (
            <motion.div 
              key={signal.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="space-y-6 group/item"
            >
              <div className="flex justify-between items-start">
                 <div className="space-y-3">
                    <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                      "{signal.recommendation}"
                    </p>
                    <div className="flex gap-4">
                       <Badge className="bg-white text-primary text-[8px] font-black uppercase h-5 px-2 rounded-full border-none">{signal.targetMetric}</Badge>
                       <span className="text-[9px] font-black uppercase tracking-wide opacity-40 text-white">Horizon: {signal.horizon}</span>
                    </div>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[9px] font-black uppercase opacity-60 text-white tracking-widest">Confidence</p>
                    <p className="text-3xl font-black text-emerald-400 tabular-nums leading-none tracking-tighter">{Math.round(signal.confidenceScore * 100)}%</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                 <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white mb-2">Impact Forecast</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black tracking-tighter">+$12.4M</span>
                       <TrendingUp className="h-4 w-4 text-emerald-300" />
                    </div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white mb-2">Priority Level</p>
                    <Badge className={cn(
                      "text-[9px] font-black h-6 px-3 border-none",
                      signal.impactLevel === 'critical' ? 'bg-red-50 text-white' : 'bg-orange-50 text-white'
                    )}>{signal.impactLevel.toUpperCase()}</Badge>
                 </div>
              </div>
              
              {i < signals.length - 1 && <div className="h-px w-full bg-white/10 mt-8" />}
            </motion.div>
          ))}
        </div>

        <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
          <Compass className="mr-3 h-5 w-5" /> EXECUTE PREDICTIVE REBALANCING
        </Button>
      </CardContent>
    </Card>
  );
}
