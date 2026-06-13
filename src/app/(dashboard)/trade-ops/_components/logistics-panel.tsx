'use client';

/**
 * @file trade-ops/_components/logistics-panel.tsx
 * @description Logistics tab — multi-leg route optimization (cheapest / fastest / balanced) over the
 * carrier network, with quote generation and route selection (hands off to freight booking).
 */
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Route, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useOptimizations, useOptimizeRoute, useSelectRoute, errorMessage,
  type Shipment, type RouteStrategy, type RouteCandidate,
} from '@/api';
import { formatCurrency } from '@/lib/utils';
import { AsyncGate, when } from './ui-states';

export function LogisticsPanel({ shipmentId, shipment, mayEdit }: { shipmentId: string; shipment: Shipment | undefined; mayEdit: boolean }) {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useOptimizations({ shipment_id: shipmentId });
  const optimize = useOptimizeRoute(shipmentId);
  const select = useSelectRoute(shipmentId);

  const latest = data?.items?.[0];

  async function runOptimize() {
    try {
      await optimize.mutateAsync({
        origin: { hub: shipment?.origin ?? undefined },
        destination: { hub: shipment?.destination ?? undefined },
        shipment_id: shipmentId,
      });
      toast({ title: 'Routes optimized' });
    } catch (err) {
      toast({ title: 'Optimization failed', description: errorMessage(err), variant: 'destructive' });
    }
  }

  async function choose(strategy: RouteStrategy) {
    if (!latest) return;
    try { await select.mutateAsync({ id: latest.id, strategy }); toast({ title: `Selected ${strategy} route` }); }
    catch (err) { toast({ title: 'Selection failed', description: errorMessage(err), variant: 'destructive' }); }
  }

  const OptimizeButton = mayEdit ? (
    <Button size="sm" onClick={runOptimize} disabled={optimize.isPending}>
      {optimize.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
      {latest ? 'Re-optimize' : 'Get Quotes'}
    </Button>
  ) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Route Optimization</CardTitle>
          <CardDescription>Cheapest / fastest / balanced lanes across the carrier network.</CardDescription>
        </div>
        {OptimizeButton}
      </CardHeader>
      <CardContent>
        <AsyncGate
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage(error)}
          onRetry={() => void refetch()}
          isEmpty={!latest}
          emptyMessage="No route optimization run yet. Generate quotes to compare lanes."
        >
          {latest && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{latest.origin_hub ?? shipment?.origin ?? '—'} → {latest.destination_hub ?? shipment?.destination ?? '—'}</span>
                <span>·</span>
                <span>{when(latest.created_at)}</span>
                {latest.selected_strategy && <Badge variant="default">Selected: {latest.selected_strategy}</Badge>}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead><TableHead>Legs</TableHead><TableHead>Cost</TableHead>
                    <TableHead>ETA (days)</TableHead><TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(['cheapest', 'fastest', 'balanced'] as RouteStrategy[]).map((strategy) => {
                    const route = latest[strategy] as RouteCandidate | null | undefined;
                    if (!route) return null;
                    const chosen = latest.selected_strategy === strategy;
                    return (
                      <TableRow key={strategy}>
                        <TableCell className="text-xs font-medium capitalize">{strategy}</TableCell>
                        <TableCell className="text-xs">{route.legs?.length ?? 0}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(route.total_cost ?? 0, 'USD')}</TableCell>
                        <TableCell className="text-xs">{route.total_eta_days ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          {chosen ? (
                            <Badge variant="default"><CheckCircle2 className="mr-1 h-3 w-3" /> Chosen</Badge>
                          ) : mayEdit ? (
                            <Button variant="outline" size="sm" disabled={select.isPending} onClick={() => choose(strategy)}>Select</Button>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {(latest.warnings ?? []).length > 0 && (
                <div className="space-y-1">
                  {(latest.warnings ?? []).map((w, i) => (
                    <p key={i} className="text-xs text-amber-500">⚠ {w.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </AsyncGate>
      </CardContent>
    </Card>
  );
}
