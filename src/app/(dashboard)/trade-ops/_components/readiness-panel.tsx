'use client';

/**
 * @file trade-ops/_components/readiness-panel.tsx
 * @description Readiness scoring tab — the weighted 0–100 dispatch-eligibility gauge with its four
 * component scores and any blockers. Recalculate forces a fresh engine run.
 */
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReadiness, useRecalculateReadiness, TradeApiError, errorMessage } from '@/api';
import { LoadingState, ErrorState, EmptyState, ScoreRing, ScoreBar, KeyVal, num, humanize } from './ui-states';
import { ReadinessBandBadge, SeverityBadge } from './badges';

export function ReadinessPanel({ shipmentId, mayEdit }: { shipmentId: string; mayEdit: boolean }) {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useReadiness(shipmentId, { poll: true });
  const recalc = useRecalculateReadiness(shipmentId);

  const notFound = isError && error instanceof TradeApiError && error.code === 'HTTP_404';

  async function handleRecalc() {
    try {
      await recalc.mutateAsync();
      toast({ title: 'Readiness recalculated' });
    } catch (err) {
      toast({ title: 'Recalculate failed', description: errorMessage(err), variant: 'destructive' });
    }
  }

  const RecalcButton = mayEdit ? (
    <Button variant="outline" size="sm" onClick={handleRecalc} disabled={recalc.isPending}>
      {recalc.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Recalculate
    </Button>
  ) : null;

  if (isLoading) return <LoadingState label="Scoring readiness…" />;
  if (notFound || !data) {
    return <EmptyState message="No readiness score computed yet for this shipment." action={RecalcButton} />;
  }
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const blockers = data.blockers ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Overall Readiness</CardTitle>
          <ReadinessBandBadge band={data.band} />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <ScoreRing value={num(data.readiness_score)} />
          {data.capped && <p className="text-xs text-amber-500">Score capped by a critical blocker.</p>}
          {RecalcButton}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Component Scores</CardTitle>
          <CardDescription>Documentation 25 · Compliance 25 · Logistics 20 · Risk 30 (weighted).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ScoreBar label="Documentation" value={num(data.documentation_score)} />
          <ScoreBar label="Compliance" value={num(data.compliance_score)} />
          <ScoreBar label="Logistics" value={num(data.logistics_score)} />
          <ScoreBar label="Risk (safety)" value={num(data.risk_score)} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" /> Blockers ({data.blocker_count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blockers — this shipment is clear to progress.</p>
          ) : (
            <div className="space-y-2">
              {blockers.map((b, i) => (
                <div key={i} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="text-sm font-medium">{b.message}</p>
                    {b.component && <p className="text-xs text-muted-foreground">{humanize(b.component)}</p>}
                  </div>
                  {b.severity && <SeverityBadge severity={b.severity} />}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <KeyVal label="Engine" value={data.engine_version} />
            <KeyVal label="Trigger" value={humanize(data.trigger)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
