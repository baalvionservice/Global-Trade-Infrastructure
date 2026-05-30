/**
 * @file rfq-status-timeline.tsx
 * @description Advanced lifecycle visualization for Institutional Sourcing.
 */
'use client';

import { RFQStatus } from "@/services/rfq-service";
import { cn } from "@/lib/utils";
import { Check, Clock, MessageSquare, Lock, ShieldCheck, Gavel, Award } from "lucide-react";
import { motion } from "framer-motion";

interface RFQStatusTimelineProps {
  status: RFQStatus;
}

const steps = [
  { id: 'DRAFT', label: 'Draft', icon: Clock },
  { id: 'INTERNAL_REVIEW', label: 'Review', icon: ShieldCheck },
  { id: 'OPEN', label: 'Bidding', icon: Gavel },
  { id: 'EVALUATION', label: 'Evaluating', icon: SearchIcon },
  { id: 'NEGOTIATION', label: 'Handshake', icon: MessageSquare },
  { id: 'AWARDED', label: 'Awarded', icon: Award },
];

export function RFQStatusTimeline({ status }: RFQStatusTimelineProps) {
  const normalizedStatus = status.toUpperCase();
  const currentStepIndex = steps.findIndex(s => s.id === normalizedStatus);

  return (
    <div className="relative flex justify-between w-full max-w-4xl mx-auto py-8 px-4">
      {/* Background Rail */}
      <div className="absolute top-[48px] left-0 w-full h-1 bg-muted rounded-full z-0" />
      
      {/* Progress Fill */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
        className="absolute top-[48px] left-0 h-1 bg-primary rounded-full z-0 transition-all duration-1000"
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
            <div 
              className={cn(
                "h-12 w-12 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-500",
                isActive ? "border-primary text-primary shadow-lg" : "border-muted text-muted-foreground opacity-40",
                isCurrent && "ring-8 ring-primary/10 scale-125 bg-primary text-white border-primary"
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            
            <div className="flex flex-col items-center text-center">
              <span 
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.1em] leading-tight",
                  isActive ? "text-primary" : "text-muted-foreground opacity-60"
                )}
              >
                {step.label}
              </span>
              {isCurrent && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 mt-1"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-600 uppercase">Live</span>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SearchIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}
