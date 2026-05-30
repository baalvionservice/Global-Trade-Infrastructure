
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, MapPin, ShieldAlert, Zap } from 'lucide-react';
import { cn, getFlag } from '@/lib/utils';
import { motion } from 'framer-motion';

const heatmapData = [
  { country: 'Singapore', risk: 12, health: 'Optimal', status: 'verified', color: 'text-emerald-500' },
  { country: 'United States', risk: 18, health: 'Stable', status: 'verified', color: 'text-blue-500' },
  { country: 'China', risk: 42, health: 'Elevated', status: 'verified', color: 'text-orange-500' },
  { country: 'India', risk: 38, health: 'Stable', status: 'verified', color: 'text-blue-500' },
  { country: 'Vietnam', risk: 45, health: 'Elevated', status: 'verified', color: 'text-orange-500' },
  { country: 'United Kingdom', risk: 15, health: 'Optimal', status: 'verified', color: 'text-emerald-500' },
];

export function RiskHeatmap() {
  return (
    <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
      <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-black uppercase tracking-wide">Global Jurisdictional Heatmap</CardTitle>
        </div>
        <Globe className="h-6 w-6 text-primary opacity-30" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {heatmapData.map((item, i) => (
            <motion.div 
              key={item.country}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, backgroundColor: 'rgba(var(--primary), 0.02)' }}
              className="p-6 rounded-3xl border-2 transition-all relative overflow-hidden bg-background"
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><MapPin className="h-10 w-10" /></div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFlag(item.country)}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.country}</span>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-3xl font-black tracking-tighter tabular-nums">{item.risk}%</p>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", item.color)}>{item.health}</span>
                  </div>
                  <Progress value={item.risk} className="h-1 bg-muted" />
                </div>
                <div className="pt-2 flex items-center gap-2 text-[8px] font-black uppercase text-muted-foreground opacity-40">
                   <ShieldAlert className="h-3 w-3" /> Sanctions Sync: 100%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
