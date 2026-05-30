'use client';

import { CustomsStatus } from "@/services/customs-service";
import { cn } from "@/lib/utils";
import { Clock, Search, ShieldCheck, CheckCircle2, XCircle, Landmark } from "lucide-react";

interface CustomsStatusTimelineProps {
  status: CustomsStatus;
}

const steps = [
  { id: 'pending', label: 'Draft', icon: Clock },
  { id: 'under_review', label: 'Processing', icon: Landmark },
  { id: 'inspection', label: 'Physical Check', icon: Search },
  { id: 'cleared', label: 'Released', icon: CheckCircle2 },
];

export function CustomsStatusTimeline({ status }: CustomsStatusTimelineProps) {
  if (status === 'rejected') {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 border border-red-100 rounded-xl text-red-600 gap-3">
        <XCircle className="h-6 w-6" />
        <span className="font-bold uppercase tracking-wider">Clearance Rejected - Legal Intervention Required</span>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="relative flex justify-between w-full max-w-3xl mx-auto py-6">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-1000"
        style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
            <div 
              className={cn(
                "h-12 w-12 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-500",
                isActive ? "border-primary text-primary" : "border-muted text-muted-foreground",
                isCurrent && "ring-4 ring-primary/20 scale-110 shadow-lg"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span 
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
