'use client';

import { OrderStatus } from "@/services/order-service";
import { cn } from "@/lib/utils";
import { Check, Clock, Package, Truck, Home, BadgeCheck, XCircle } from "lucide-react";

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

const steps = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: BadgeCheck },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
  // 'delivered' is the terminal UI state (the order mapper collapses delivered+closed → delivered),
  // so a delivered order fills the timeline to 100% with no dangling 'completed' step.
];

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 border border-red-100 rounded-xl text-red-600 gap-3">
        <XCircle className="h-6 w-6" />
        <span className="font-bold uppercase tracking-wider">Order Cancelled</span>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="relative flex justify-between w-full max-w-3xl mx-auto py-8">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-700"
        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className={cn(
                "h-10 w-10 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-300",
                isActive ? "border-primary text-primary" : "border-muted text-muted-foreground",
                isCurrent && "ring-4 ring-primary/20 scale-110"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span 
              className={cn(
                "text-[10px] font-bold uppercase tracking-tighter",
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
