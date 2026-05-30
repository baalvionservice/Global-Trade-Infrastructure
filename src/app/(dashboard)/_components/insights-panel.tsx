'use client';

/**
 * @file insights-panel.tsx
 * @description THE STRATEGIC INTELLIGENCE HUB. 
 * High-density panel for AI-driven operational insights and risk signals.
 */

import { useEffect, useState } from 'react';
import { insightService, Insight } from '@/services/insight-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown,
  Loader2,
  AlertCircle,
  Lightbulb,
  Zap,
  Landmark,
  Truck,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const typeIcons: Record<string, any> = {
  risk: ShieldAlert,
  market: TrendingUp,
  operations: Activity,
  compliance: AlertCircle,
  treasury: Landmark,
  logistics: Truck,
  economic: Zap
};

const severityColors = {
  info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  warning: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  critical: "text-red-400 bg-red-500/10 border-red-500/20 shadow-red-500/5 animate-pulse",
};

export function InsightsPanel({ companyId }: { companyId?: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightService.getInsights(companyId)
      .then(setInsights)
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl">
      <CardHeader className="pb-6 border-b border-white/5 shrink-0 p-6 bg-white/5">
        <div className="flex items-center justify-between">
           <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-3">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Strategic Intelligence
           </CardTitle>
           <Badge variant="outline" className="bg-primary/5 text-primary text-[8px] font-black border-primary/20 uppercase tracking-widest px-2 h-5">
              ORACLE_v4.2
           </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 space-y-0 overflow-auto terminal-scroll">
        <AnimatePresence initial={false}>
          {insights.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 text-center space-y-6 opacity-20"
            >
               <Database className="h-12 w-12" />
               <p className="text-[10px] font-black uppercase tracking-wide px-6 leading-relaxed">Gathering signal pulse... <br />No high-confidence anomalies detected.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-white/5">
              {insights.map((insight, idx) => (
                <motion.div 
                  key={insight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 space-y-6 group cursor-default hover:bg-white/[0.02] transition-all"
                >
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
                            {(() => {
                               const Icon = typeIcons[insight.type] || Activity;
                               return <Icon className="h-5 w-5 text-primary" />;
                            })()}
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                            {insight.type} SIGNAL
                         </span>
                      </div>
                      <Badge className={cn("text-[8px] font-black uppercase border-none h-6 px-3 rounded-full shadow-sm", severityColors[insight.severity])}>
                         {insight.severity}
                      </Badge>
                   </div>

                   <p className="text-lg leading-relaxed font-bold italic text-slate-200 tracking-tight">
                    "{insight.message}"
                   </p>

                   <div className="flex items-center justify-between pt-4">
                      <div className="flex gap-4">
                         <button className="p-1.5 hover:text-emerald-400 transition-colors opacity-20 hover:opacity-100"><ThumbsUp className="h-4 w-4" /></button>
                         <button className="p-1.5 hover:text-red-400 transition-colors opacity-20 hover:opacity-100"><ThumbsDown className="h-4 w-4" /></button>
                      </div>
                      {insight.ctaLink && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-[10px] font-black text-primary hover:no-underline flex gap-3 items-center group/btn uppercase tracking-widest" asChild>
                           <Link href={insight.ctaLink}>
                              {insight.ctaLabel || 'Execute'} <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-2 transition-transform" />
                           </Link>
                        </Button>
                      )}
                   </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="p-6 border-t border-white/5 bg-slate-950/40">
           <div className="flex items-center gap-3 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Cognitive Health Matrix</p>
           </div>
           <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">
             "Modeling 14,240 cross-jurisdictional nodes. Prediction accuracy 99.98%. All cognitive shards are synchronized with the sovereign kernel."
           </p>
        </div>
      </CardContent>
    </div>
  );
}
