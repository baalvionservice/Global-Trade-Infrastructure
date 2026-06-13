'use client';

/**
 * @file trade-ops/_components/dispatch-panel.tsx
 * @description Dispatch tab — the gated saga that releases a shipment once every condition (docs
 * validated / compliance passed / customs ready / freight booked) is signaled clear. Supports
 * signal, dispatch, rollback, and retry.
 */
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket, Plus, CheckCircle2, Circle, RotateCcw, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useDispatchConfig, useDispatchPlans, useCreateDispatch, useSignalDispatch,
  useTriggerDispatch, useRollbackDispatch, useRetryDispatch, errorMessage, type DispatchPlan,
} from '@/api';
import { LoadingState, ErrorState, EmptyState, humanize, when } from './ui-states';
import { DispatchStatusBadge } from './badges';

export function DispatchPanel({ shipmentId, mayEdit, mayApprove }: { shipmentId: string; mayEdit: boolean; mayApprove: boolean }) {
  const { toast } = useToast();
  const config = useDispatchConfig();
  const { data, isLoading, isError, error, refetch } = useDispatchPlans({ shipment_id: shipmentId }, { poll: true });
  const create = useCreateDispatch();

  const plan = data?.items?.[0];

  async function run(label: string, p: Promise<unknown>) {
    try { await p; toast({ title: `${label} done` }); }
    catch (err) { toast({ title: `${label} failed`, description: errorMessage(err), variant: 'destructive' }); }
  }

  if (isLoading) return <LoadingState label="Loading dispatch plan…" />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (!plan) {
    return (
      <EmptyState
        message="No dispatch plan for this shipment yet."
        action={mayEdit ? (
          <Button size="sm" disabled={create.isPending}
            onClick={() => run('Create plan', create.mutateAsync({ shipment_id: shipmentId, required: config.data?.default_required }))}>
            {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Dispatch Plan
          </Button>
        ) : undefined}
      />
    );
  }

  return <PlanView plan={plan} requiredFallback={config.data?.default_required ?? []} mayApprove={mayApprove} onRun={run} />;
}

function PlanView({ plan, requiredFallback, mayApprove, onRun }: {
  plan: DispatchPlan;
  requiredFallback: string[];
  mayApprove: boolean;
  onRun: (label: string, p: Promise<unknown>) => Promise<void>;
}) {
  const signal = useSignalDispatch();
  const trigger = useTriggerDispatch();
  const rollback = useRollbackDispatch();
  const retry = useRetryDispatch();

  const conditionMap = plan.conditions ?? {};
  const conditions = Object.keys(conditionMap).length > 0 ? Object.keys(conditionMap) : requiredFallback;
  const allClear = conditions.length > 0 && conditions.every((c) => conditionMap[c]);
  const canDispatch = mayApprove && (plan.status === 'ready' || allClear) && plan.status !== 'dispatched';

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Dispatch Plan</CardTitle>
            <CardDescription>{plan.reference_no ?? plan.id.slice(0, 8)} · updated {when(plan.updated_at)}</CardDescription>
          </div>
          <DispatchStatusBadge status={plan.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {conditions.map((c) => {
              const ok = !!conditionMap[c];
              return (
                <div key={c} className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-2.5">
                  <span className="flex items-center gap-2 text-sm">
                    {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    {humanize(c)}
                  </span>
                  {!ok && mayApprove && plan.status !== 'dispatched' && (
                    <Button variant="outline" size="sm" disabled={signal.isPending}
                      onClick={() => onRun('Signal', signal.mutateAsync({ id: plan.id, condition: c }))}>
                      Signal clear
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {canDispatch && (
              <Button size="sm" disabled={trigger.isPending}
                onClick={() => onRun('Dispatch', trigger.mutateAsync(plan.id))}>
                {trigger.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                Dispatch
              </Button>
            )}
            {mayApprove && plan.status === 'dispatched' && (
              <Button variant="outline" size="sm" disabled={rollback.isPending}
                onClick={() => onRun('Rollback', rollback.mutateAsync({ id: plan.id, reason: 'rolled_back_from_trade_ops' }))}>
                <Undo2 className="mr-2 h-4 w-4" /> Rollback
              </Button>
            )}
            {mayApprove && plan.status === 'failed' && (
              <Button variant="outline" size="sm" disabled={retry.isPending}
                onClick={() => onRun('Retry', retry.mutateAsync(plan.id))}>
                <RotateCcw className="mr-2 h-4 w-4" /> Retry
              </Button>
            )}
          </div>
          {plan.failure_reason && <p className="text-sm text-rose-500">Failure: {plan.failure_reason}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
