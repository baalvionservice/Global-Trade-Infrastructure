'use client';

/**
 * @file wizard-stepper.tsx
 * @description Shared progress indicator for the buyer/seller KYC onboarding wizards.
 */

import { cn } from '@/lib/utils';

interface WizardStepperProps {
  steps: string[];
  current: number;
}

export function WizardStepper({ steps, current }: WizardStepperProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em]">
        <span className="text-primary">Step {Math.min(current + 1, steps.length)} / {steps.length}</span>
        <span className="text-muted-foreground truncate ml-4">{steps[Math.min(current, steps.length - 1)]}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {steps.map((label, i) => (
          <div
            key={label}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-500',
              i <= current ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
