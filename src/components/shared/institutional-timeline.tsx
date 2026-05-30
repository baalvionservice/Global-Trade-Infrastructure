/**
 * @file src/components/shared/institutional-timeline.tsx
 * @description Operational Forensic Timeline.
 * Visualizes the immutable chain of events with high-fidelity state indicators.
 */
'use client';

import React from 'react';
import { format } from 'date-fns';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Clock,
  Zap,
  Lock,
  Landmark,
  Globe,
  MoreHorizontal,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface TimelineEvent {
  id: string;
  type: 'COMMERCIAL' | 'FINANCIAL' | 'LOGISTICS' | 'COMPLIANCE' | 'GOVERNANCE';
  action: string;
  message: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'PENDING';
  actor: string;
  timestamp: string;
  signature?: string;
}

export function InstitutionalTimeline({ events }: { events: TimelineEvent[] }) {
  const iconMap = {
    COMMERCIAL: Zap,
    FINANCIAL: Landmark,
    LOGISTICS: Globe,
    COMPLIANCE: ShieldCheck,
    GOVERNANCE: Lock
  };

  const statusColors = {
    SUCCESS: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    WARNING: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
    CRITICAL: 'text-red-500 border-red-500/20 bg-red-500/5',
    PENDING: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
  };

  if (!events || events.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 opacity-20">
         <HistoryIcon className="h-12 w-12 mx-auto" />
         <p className="text-[10px] font-black uppercase tracking-wide">Timeline Sync Pending</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b-2 border-primary/5 pb-8 px-1">
         <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wide text-foreground flex items-center gap-3">
               <Activity className="h-4 w-4 text-primary" />
               Audit Sequence
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Forensic Trace • 100% Immutable</p>
         </div>
         <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
         </Button>
      </div>

      <div className="relative pl-12 space-y-6 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-muted before:shadow-inner">
        {events.map((event, i) => {
          const Icon = iconMap[event.type] || Activity;
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative group"
            >
              {/* Event Marker */}
              <div className={cn(
                "absolute -left-[45px] top-0 h-11 w-11 rounded-2xl border-2 bg-background z-10 flex items-center justify-center shadow-md transition-all group-hover:scale-110",
                statusColors[event.status]
              )}>
                 <Icon className="h-5 w-5" />
              </div>

              {/* Event Content */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-black uppercase tracking-widest text-foreground">{event.action}</span>
                       <Badge variant="outline" className="text-[8px] font-black h-5 uppercase px-1.5 border-none bg-muted/50 text-muted-foreground">
                          {event.type}
                       </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-mono font-black text-muted-foreground/40 tabular-nums">
                          {format(new Date(event.timestamp), "HH:mm:ss.SSS")}
                       </span>
                    </div>
                 </div>

                 <div className="p-6 rounded-2xl border-2 border-primary/5 bg-background hover:border-primary/20 transition-all shadow-sm group-hover:shadow-lg">
                    <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">
                      "{event.message}"
                    </p>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/5">
                       <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center font-black text-[9px]">{event.actor.charAt(0)}</div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{event.actor}</span>
                       </div>
                       
                       {event.signature && (
                          <div className="flex items-center gap-2 group/sig">
                             <Lock className="h-3 w-3 text-emerald-600 opacity-40 group-hover/sig:opacity-100 transition-opacity" />
                             <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-tighter truncate max-w-[120px]">
                                {event.signature}
                             </span>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
}