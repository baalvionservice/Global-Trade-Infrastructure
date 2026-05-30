'use client';

import { ShipmentStatus } from "@/services/logistics-service";
import { cn } from "@/lib/utils";
import { Check, Truck, Anchor, ShieldCheck, MapPin, PackageCheck, Box, Loader2 } from "lucide-react";

interface TrackingTimelineProps {
  status: ShipmentStatus;
}

const steps: { id: ShipmentStatus; label: string; icon: any }[] = [
  { id: 'created', label: 'Created', icon: Box },
  { id: 'picked_up', label: 'Picked Up', icon: Truck },
  { id: 'in_transit', label: 'In Transit', icon: Anchor },
  { id: 'delivered', label: 'Delivered', icon: PackageCheck },
];

export function TrackingTimeline({ status }: TrackingTimelineProps) {
  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="relative flex justify-between w-full max-w-4xl mx-auto py-8">
      {/* Background Rail */}
      <div className="absolute top-[48px] left-0 w-full h-1 bg-muted rounded-full z-0" />
      
      {/* Active Progress Fill */}
      <div 
        className="absolute top-[48px] left-0 h-1 bg-primary rounded-full z-0 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
        style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isPast = index < currentStepIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
            <div 
              className={cn(
                "h-12 w-12 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-500",
                isActive ? "border-primary text-primary shadow-md" : "border-muted text-muted-foreground opacity-40",
                isCurrent && "ring-4 ring-primary/10 scale-125 shadow-xl bg-primary text-white border-primary",
                isPast && "bg-primary/5 border-primary/40"
              )}
            >
              {isPast ? (
                <Check className="h-6 w-6 stroke-[3]" />
              ) : isCurrent ? (
                <Icon className="h-6 w-6 animate-in zoom-in duration-300" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex flex-col items-center text-center w-24">
                <span 
                  className={cn(
                      "text-[10px] font-black uppercase tracking-[0.1em] leading-tight",
                      isActive ? "text-primary" : "text-muted-foreground opacity-60"
                  )}
                >
                {step.label}
                </span>
                {isCurrent && (
                  <div className="flex items-center gap-1 mt-1">
                    <Loader2 className="h-2 w-2 animate-spin text-primary" />
                    <span className="text-[8px] text-primary font-black uppercase animate-pulse">Live</span>
                  </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
