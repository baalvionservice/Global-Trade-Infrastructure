/**
 * @file liquidity-heatmap.tsx
 * @description Jurisdictional liquidity distribution visualization.
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RegionLiquidity {
  region: string;
  volume: number;
  health: number; // 0-100
  activeNodes: number;
}

const MOCK_DATA: RegionLiquidity[] = [
  { region: 'North America', volume: 840000000, health: 98, activeNodes: 42 },
  { region: 'Southeast Asia', volume: 450000000, health: 92, activeNodes: 31 },
  { region: 'European Union', volume: 380000000, health: 100, activeNodes: 28 },
  { region: 'Middle East', volume: 120000000, health: 74, activeNodes: 12 }
];

export function LiquidityHeatmap() {
  return (
    <div className="space-y-6">
      {MOCK_DATA.map((item, i) => (
        <motion.div 
          key={item.region}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-4 group cursor-default"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Globe className="h-4 w-4 text-primary opacity-40 group-hover:rotate-45 transition-transform duration-700" />
               <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{item.region} Node Cluster</span>
            </div>
            <div className="text-right">
               <span className="text-sm font-black text-primary tabular-nums">{formatCurrency(item.volume)}</span>
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Aggregate Depth</p>
            </div>
          </div>
          
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${item.health}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-primary relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          
          <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase opacity-60">
             <span>Nodes: {item.activeNodes}</span>
             <span>Health Index: {item.health}%</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
