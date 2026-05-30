
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Siren, Fingerprint, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const anomalies = [
  { id: '1', type: 'IDENTITY_DRIFT', node: 'COMP-102', severity: 'critical', message: 'Pattern mismatch in institutional handshake protocol.', time: '2m ago' },
  { id: '2', type: 'VELOCITY_SPIKE', node: 'CORR-APAC', severity: 'high', message: 'RFQ frequency exceeding 200% of node baseline.', time: '14m ago' },
  { id: '3', type: 'SETTLEMENT_DELAY', node: 'BANK-001', severity: 'medium', message: 'Liquidity finality drift detected in US-EUR corridor.', time: '45m ago' },
];

export function AnomalyDetector() {
  return (
    <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
      <CardHeader className="bg-muted/10 border-b py-6 px-8 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">Behavioral Anomaly Feed</CardTitle>
        </div>
        <Siren className="h-5 w-5 text-red-500 animate-pulse" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y-2">
          {anomalies.map((anom, i) => (
            <motion.div 
              key={anom.id} 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 flex items-start gap-6 group hover:bg-primary/[0.01] transition-colors"
            >
              <div className={cn(
                "p-3 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
                anom.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-muted border-primary/5'
              )}>
                {anom.type === 'IDENTITY_DRIFT' ? <Fingerprint className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{anom.type}</span>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-black uppercase h-5 px-1.5 border-none",
                    anom.severity === 'critical' ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                  )}>{anom.severity}</Badge>
                </div>
                <p className="text-sm font-medium leading-relaxed italic opacity-80">"{anom.message}"</p>
                <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                   <span>Node: {anom.node}</span>
                   <span>•</span>
                   <span>{anom.time}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-20 group-hover:opacity-100 transition-opacity">
                 <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
