/**
 * @file hooks/use-workflow.ts
 * @description Standardized React hook for interacting with the Atomic Orchestration Layer.
 * Bridges UI interactions with Consensus and Workflow engines.
 */
'use client';

import { useState } from 'react';
import { atomicOrchestrator } from '@/orchestration/atomic-orchestrator';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { LifecycleStatus } from '@/types/institutional';
import { useToast } from './use-toast';

export function useWorkflow(domain: string, entityId: string) {
  const { role } = useAppState();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const transition = async (from: LifecycleStatus, to: LifecycleStatus, actorId: string = 'USER_CURRENT') => {
    setIsProcessing(true);
    try {
      const result = await (atomicOrchestrator as any).orchestrateStep(
        domain.toUpperCase(),
        entityId,
        from.toUpperCase(),
        to.toUpperCase(),
        actorId,
        role
      );

      if (result.status === 'WAITING_FOR_CONSENSUS') {
        toast({
          title: 'Consensus Required',
          description: 'This transition has been staged. Awaiting secondary institutional signatures.'
        });
        return 'PENDING_CONSENSUS';
      }

      if (result.status === 'EXECUTED') {
        toast({
          title: 'Operational Success',
          description: `Entity transitioned to ${to.toUpperCase()}. Operational state is now final.`
        });
        return true;
      }

      if (result.status === 'FAILED' || result.status === 'ERROR') {
        toast({
          variant: 'destructive',
          title: 'Execution Failure',
          description: result.message || 'Systemic rule rejection. Compensation flow triggered.'
        });
        return false;
      }
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Orchestration Error', 
        description: error.message 
      });
    } finally {
      setIsProcessing(false);
    }
    return false;
  };

  return { transition, isProcessing };
}
