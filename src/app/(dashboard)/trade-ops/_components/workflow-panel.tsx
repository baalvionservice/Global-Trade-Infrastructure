'use client';

/**
 * @file trade-ops/_components/workflow-panel.tsx
 * @description Workflow / lifecycle tab — shows the shipment's workflow state, the events it may
 * dispatch next (rendered as transition controls, role-gated), and the append-only transition log.
 * A transition is the event-driven driver of the whole lifecycle.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, GitBranch, Zap, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useWorkflows, useWorkflow, useWorkflowTransitions, useDispatchEvent,
  workflowsApi, qk, errorMessage, type ShipmentWorkflow,
} from '@/api';
import { LoadingState, ErrorState, EmptyState, when, humanize } from './ui-states';
import { WorkflowStateBadge } from './badges';

export function WorkflowPanel({ shipmentId, mayEdit }: { shipmentId: string; mayEdit: boolean }) {
  const list = useWorkflows({ shipment_id: shipmentId }, { poll: true });
  const workflow = list.data?.items?.[0];

  if (list.isLoading) return <LoadingState label="Loading workflow…" />;
  if (list.isError) return <ErrorState message={errorMessage(list.error)} onRetry={() => void list.refetch()} />;
  if (!workflow) return <NoWorkflow shipmentId={shipmentId} mayEdit={mayEdit} />;

  return <WorkflowDetail workflowId={workflow.id} seed={workflow} mayEdit={mayEdit} />;
}

function NoWorkflow({ shipmentId, mayEdit }: { shipmentId: string; mayEdit: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: () => workflowsApi.create({ shipment_id: shipmentId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.workflows.all });
      toast({ title: 'Workflow started' });
    },
    onError: (err) => toast({ title: 'Could not start workflow', description: errorMessage(err), variant: 'destructive' }),
  });
  return (
    <EmptyState
      message="No lifecycle workflow exists for this shipment yet."
      action={mayEdit ? (
        <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Start Workflow
        </Button>
      ) : undefined}
    />
  );
}

function WorkflowDetail({ workflowId, seed, mayEdit }: { workflowId: string; seed: ShipmentWorkflow; mayEdit: boolean }) {
  const { toast } = useToast();
  const { data: wf } = useWorkflow(workflowId, { poll: true });
  const transitions = useWorkflowTransitions(workflowId);
  const dispatch = useDispatchEvent(workflowId);
  const current = wf ?? seed;
  const events = current.allowed_events ?? [];

  async function fire(event: string) {
    try {
      const res = await dispatch.mutateAsync({ event, reason: 'dispatched_from_trade_ops' });
      toast({ title: `Transition: ${humanize(event)}`, description: `→ ${humanize(res.transition.to_state)}` });
    } catch (err) {
      toast({ title: 'Transition failed', description: errorMessage(err), variant: 'destructive' });
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Lifecycle State</CardTitle>
            <CardDescription>{current.reference_no ?? workflowId.slice(0, 8)}</CardDescription>
          </div>
          <WorkflowStateBadge state={current.current_state} />
        </CardHeader>
        <CardContent>
          {current.is_terminal ? (
            <p className="text-sm text-muted-foreground">This workflow has reached a terminal state ({humanize(current.current_state)}).</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transitions available from the current state.</p>
          ) : !mayEdit ? (
            <p className="text-sm text-muted-foreground">You do not have permission to advance this workflow.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {events.map((event) => (
                <Button key={event} variant="outline" size="sm" disabled={dispatch.isPending} onClick={() => fire(event)}>
                  {dispatch.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                  {humanize(event)}
                </Button>
              ))}
            </div>
          )}
          {current.failure_reason && <p className="mt-3 text-sm text-rose-500">Failure: {current.failure_reason}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><GitBranch className="h-4 w-4" /> Transition History</CardTitle>
          <CardDescription>Append-only, idempotent, replay-safe.</CardDescription>
        </CardHeader>
        <CardContent>
          {transitions.isLoading ? (
            <LoadingState label="Loading transitions…" />
          ) : (transitions.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No transitions recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead><TableHead>Event</TableHead><TableHead>From → To</TableHead>
                  <TableHead>Source</TableHead><TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transitions.data ?? []).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.seq}</TableCell>
                    <TableCell className="text-xs">{humanize(t.event)}</TableCell>
                    <TableCell className="font-mono text-xs">{(t.from_state ?? 'GENESIS')} → {t.to_state}</TableCell>
                    <TableCell className="text-xs">{t.source}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{when(t.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
