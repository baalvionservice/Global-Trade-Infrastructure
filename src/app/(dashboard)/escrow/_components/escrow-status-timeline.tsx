'use client';

import { EscrowStatus } from "@/services/escrow-service";
import { cn } from "@/lib/utils";
import { Clock, Wallet, Truck, PackageCheck, CheckCircle2, AlertOctagon, Landmark, ShieldCheck } from "lucide-react";

interface EscrowStatusTimelineProps {
  status: EscrowStatus;
}

const steps = [
  { id: 'created', label: 'Provisioned', icon: Clock },
  { id: 'funded', label: 'Secured', icon: Wallet },
  { id: 'in_transit', label: 'In Transit', icon: Truck },
  { id: 'delivered', label: 'Verified', icon: PackageCheck },
  { id: 'released', label: 'Settled', icon: Landmark },
];

export function EscrowStatusTimeline({ status }: EscrowStatusTimelineProps) {
  if (status === 'disputed') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-orange-50 border-2 border-orange-200 rounded-2xl text-orange-700 gap-4 animate-in zoom-in duration-300">
        <div className="h-12 w-16 bg-orange-100 rounded-full flex items-center justify-center shadow-sm">
           <AlertOctagon className="h-10 w-10 text-orange-600 animate-pulse" />
        </div>
        <div className="text-center">
           <h4 className="font-black uppercase tracking-widest text-lg">Escrow Disputed</h4>
           <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-tighter">Governance Audit Mode Active • Funds Frozen</p>
        </div>
      </div>
    );
  }

  if (status === 'refunded') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-700 gap-4">
        <div className="h-12 w-16 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
           <Wallet className="h-10 w-10 text-blue-600" />
        </div>
        <div className="text-center">
           <h4 className="font-black uppercase tracking-widest text-lg">Transaction Reversed</h4>
           <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-tighter">Full Refund Credited to Institutional Wallet</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="relative flex justify-between w-full max-w-4xl mx-auto py-8">
      {/* Connector Rail */}
      <div className="absolute top-[48px] left-0 w-full h-1.5 bg-muted rounded-full z-0" />
      <div 
        className="absolute top-[48px] left-0 h-1.5 bg-primary rounded-full z-0 transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
        style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isPast = index < currentStepIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-5">
            <div 
              className={cn(
                "h-12 w-12 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-500",
                isActive ? "border-primary text-primary" : "border-muted text-muted-foreground opacity-30",
                isCurrent && "ring-8 ring-primary/10 scale-125 shadow-xl bg-primary text-white border-primary",
                isPast && "bg-primary/5"
              )}
            >
              {isPast ? <CheckCircle2 className="h-6 w-6 stroke-[3]" /> : <Icon className="h-6 w-6" />}
            </div>
            
            <div className="flex flex-col items-center text-center w-24">
                <span 
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] leading-none",
                    isActive ? "text-primary" : "text-muted-foreground opacity-60"
                  )}
                >
                {step.label}
                </span>
                {isCurrent && (
                   <div className="flex items-center gap-1 mt-2">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[8px] font-black uppercase text-primary tracking-tighter">Verified</span>
                   </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
