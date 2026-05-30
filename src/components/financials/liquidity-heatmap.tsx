/**
 * @file liquidity-heatmap.tsx
 * @description Jurisdictional liquidity distribution visualization for the Global Treasury Command.
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RegionLiquidity {
  region: string;
  volume: number;
  health: number; // 0-100
  activeNodes: number;
  status: 'OPTIMAL' | 'STABLE' | 'WARNING';
}

const MOCK_DATA: RegionLiquidity[] = [
  { region: 'North America', volume: 840000000, health: 98, activeNodes: 42, status: 'OPTIMAL' },
  { region: 'Southeast Asia', volume: 450000000, health: 92, activeNodes: 31, status: 'STABLE' },
  { region: 'European Union', volume: 380000000, health: 100, activeNodes: 28, status: 'OPTIMAL' },
  { region: 'Middle East', volume: 120000000, health: 74, activeNodes: 12, status: 'WARNING' }
];

export function LiquidityHeatmap() {
  return (
    <div className="space-y-10">
      {MOCK_DATA.map((item, i) => (
        <motion.div 
          key={item.region}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-4 group cursor-default p-6 rounded-[32px] border-2 bg-muted/5 hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Globe className="h-4 w-4 text-primary opacity-40 group-hover:rotate-45 transition-transform duration-700" />
               <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{item.region} Cluster</span>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">{item.activeNodes} Authority Nodes</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-sm font-black text-primary tabular-nums">{formatCurrency(item.volume)}</span>
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Aggregate Depth</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className="opacity-40">Health Index</span>
               <span className={item.health > 90 ? 'text-emerald-500' : 'text-orange-500'}>{item.health}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner relative">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${item.health}%` }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className="h-full bg-primary relative"
               >
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
               </motion.div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
             <Badge className={item.status === 'OPTIMAL' ? 'bg-emerald-500' : item.status === 'WARNING' ? 'bg-orange-500' : 'bg-blue-500'}>
                {item.status}
             </Badge>
             <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                ANALYZE NODES <ArrowRight className="h-2 w-2" />
             </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
