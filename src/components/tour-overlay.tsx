
'use client';

import { useAppState, TourStep } from '@/app/(dashboard)/_components/app-state';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, X, Play, ShieldCheck, Zap, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

const TOUR_CONTENT: Record<TourStep, { title: string; content: string; icon: any; path: string }> = {
  welcome: {
    title: 'Platform Discovery',
    content: 'Welcome to Baalvion. This guided tour will showcase the autonomous trade lifecycle, from procurement to final settlement.',
    icon: ShieldCheck,
    path: PATHS.BUYER_DASHBOARD
  },
  sourcing: {
    title: 'Strategic Sourcing',
    content: 'Buyers initiate sourcing via standardized RFQs. Notice the AI Intelligence panel providing real-time corridor risk analysis.',
    icon: Zap,
    path: PATHS.BUYER_RFQS
  },
  negotiation: {
    title: 'Encrypted Deal Room',
    content: 'Terms are finalized in secure, multi-party deal rooms. Counterparty trust scores are verified in every message.',
    icon: Info,
    path: `${PATHS.DEALS}/DEAL-2001`
  },
  settlement: {
    title: 'Financial Provisioning',
    content: 'Once terms are locked, capital is moved to the platform escrow. This secures the transaction for both institutions.',
    icon: Play,
    path: `${PATHS.ESCROW}/ESC-5002`
  },
  logistics: {
    title: 'Autonomous Logistics',
    content: 'Funding automatically triggers logistics booking. Monitor real-time IoT telemetry and port clearance milestones.',
    icon: ArrowRight,
    path: `${PATHS.LOGISTICS_SHIPMENT}/SHP-4421`
  },
  complete: {
    title: 'Lifecycle Complete',
    content: 'Delivery confirmation will trigger the autonomous ledger release. The loop of trust is now closed.',
    icon: ShieldCheck,
    path: PATHS.DASHBOARD
  }
};

export function TourOverlay() {
  const { isTourActive, currentTourStep, nextTourStep, endTour } = useAppState();
  const router = useRouter();

  if (!isTourActive) return null;

  const stepData = TOUR_CONTENT[currentTourStep];

  const handleNext = () => {
    router.push(stepData.path);
    // Add a slight delay to allow navigation to settle
    setTimeout(() => {
      nextTourStep();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-end justify-center p-8 sm:items-center sm:justify-end sm:pr-12">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTourStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative pointer-events-auto max-w-sm w-full"
        >
          <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <stepData.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">{stepData.title}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100" onClick={endTour}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                {stepData.content}
              </p>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t p-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i, idx) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${idx === Object.keys(TOUR_CONTENT).indexOf(currentTourStep) ? 'bg-primary' : 'bg-primary/20'}`} 
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleNext} className="font-black text-[10px] h-8 px-4 uppercase tracking-widest">
                {currentTourStep === 'complete' ? 'Finish Tour' : 'Next Step'}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
