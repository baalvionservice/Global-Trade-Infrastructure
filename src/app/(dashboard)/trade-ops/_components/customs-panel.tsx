'use client';

/**
 * @file trade-ops/_components/customs-panel.tsx
 * @description Customs tab — async declarations to national customs gateways (ICEGATE / ACE /
 * EU-CDS / Mirsal) with retry + cancel on failure.
 */
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, FileStack, RotateCcw, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useCustomsSubmissions, useCreateCustoms, useRetryCustoms, useCancelCustoms,
  errorMessage, type Shipment,
} from '@/api';
import { AsyncGate, when, humanize } from './ui-states';
import { CustomsStatusBadge } from './badges';

const TERMINAL = new Set(['accepted', 'cancelled']);
const RETRYABLE = new Set(['failed', 'rejected']);

export function CustomsPanel({ shipmentId, shipment, mayEdit }: { shipmentId: string; shipment: Shipment | undefined; mayEdit: boolean }) {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useCustomsSubmissions({ shipment_id: shipmentId }, { poll: true });
  const create = useCreateCustoms();
  const retry = useRetryCustoms();
  const cancel = useCancelCustoms();

  const subs = data?.items ?? [];

  async function run(label: string, p: Promise<unknown>) {
    try { await p; toast({ title: `${label} done` }); }
    catch (err) { toast({ title: `${label} failed`, description: errorMessage(err), variant: 'destructive' }); }
  }

  async function submit() {
    await run('Customs submission', create.mutateAsync({
      shipment_id: shipmentId,
      direction: 'export',
      origin_country: shipment?.origin ?? undefined,
      destination_country: shipment?.destination ?? undefined,
    }));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Customs Submissions</CardTitle>
          <CardDescription>Routed to the destination's national customs system; retried on transient failure.</CardDescription>
        </div>
        {mayEdit && (
          <Button size="sm" onClick={submit} disabled={create.isPending}>
            {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileStack className="mr-2 h-4 w-4" />}
            Submit Declaration
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <AsyncGate
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage(error)}
          onRetry={() => void refetch()}
          isEmpty={subs.length === 0}
          emptyMessage="No customs submissions for this shipment yet."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead><TableHead>Direction</TableHead><TableHead>Status</TableHead>
                <TableHead>Gov Ref</TableHead><TableHead>Attempts</TableHead><TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs font-medium uppercase">{s.channel}</TableCell>
                  <TableCell className="text-xs">{humanize(s.direction)}</TableCell>
                  <TableCell><CustomsStatusBadge status={s.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{s.gateway_reference ?? '—'}</TableCell>
                  <TableCell className="text-xs">{s.attempts}/{s.max_attempts}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{when(s.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {mayEdit && RETRYABLE.has(s.status) && (
                        <Button variant="ghost" size="sm" title="Retry" disabled={retry.isPending}
                          onClick={() => run('Retry', retry.mutateAsync(s.id))}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {mayEdit && !TERMINAL.has(s.status) && (
                        <Button variant="ghost" size="sm" title="Cancel" disabled={cancel.isPending}
                          onClick={() => run('Cancel', cancel.mutateAsync(s.id))}>
                          <Ban className="h-4 w-4 text-rose-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AsyncGate>
      </CardContent>
    </Card>
  );
}
