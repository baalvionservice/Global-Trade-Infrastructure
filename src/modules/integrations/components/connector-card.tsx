/**
 * @file connector-card.tsx
 * @description High-fidelity card representing an institutional data connector node.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectorNode } from '../types';
import { 
  Database, 
  Landmark, 
  Globe, 
  Zap, 
  Activity, 
  Settings2, 
  RefreshCw,
  Link2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  ERP: Database,
  BANKING: Landmark,
  CUSTOMS: Lock,
  LOGISTICS: Globe,
  INTELLIGENCE: Zap
};

export function ConnectorCard({ node, onSync }: { node: ConnectorNode, onSync: (id: string) => void }) {
  const Icon = iconMap[node.type] || Link2;
  const isActive = node.status === 'ACTIVE' || node.status === 'SYNCING';

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-xl border-2 border-primary/5 bg-background rounded-2xl overflow-hidden group hover:border-primary/40 transition-all">
        <CardHeader className="bg-muted/10 border-b p-8 flex flex-row items-start justify-between">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white text-[9px] font-black uppercase h-5 px-2 border-none shadow-sm">{node.type}</Badge>
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
             </div>
             <CardTitle className="text-xl font-black uppercase tracking-tighter text-foreground leading-tight">
               {node.name}
             </CardTitle>
          </div>
          <div className="p-4 rounded-2xl bg-background border-2 shadow-inner group-hover:scale-110 transition-transform">
             <Icon className="h-6 w-6 text-primary opacity-60" />
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Throughput</p>
                 <p className="text-sm font-black text-foreground">{node.throughput}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Avg Latency</p>
                 <p className="text-sm font-black text-foreground">{node.latencyMs}ms</p>
              </div>
           </div>

           <div className="space-y-3 pt-2">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                 <span>Node Availability</span>
                 <span>{node.uptime}%</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${node.uptime}%` }}
                   className="h-full bg-emerald-500" 
                 />
              </div>
           </div>

           <div className="flex items-center justify-between pt-4 border-t border-muted/50">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Sync State</span>
                 <span className={cn(
                   "text-[10px] font-black uppercase tracking-tighter",
                   node.status === 'SYNCING' ? "text-blue-600 animate-pulse" : "text-emerald-600"
                 )}>{node.status}</span>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border-2 hover:bg-muted opacity-40 group-hover:opacity-100 transition-opacity">
                    <Settings2 className="h-5 w-5" />
                 </Button>
                 <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl border-2 text-primary hover:bg-primary/5 shadow-sm"
                    onClick={() => onSync(node.id)}
                    disabled={node.status === 'SYNCING'}
                 >
                    <RefreshCw className={cn("h-5 w-5", node.status === 'SYNCING' && "animate-spin")} />
                 </Button>
              </div>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
