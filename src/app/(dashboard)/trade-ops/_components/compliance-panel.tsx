'use client';

/**
 * @file trade-ops/_components/compliance-panel.tsx
 * @description Compliance tab — the AI compliance agent's risk-scored assessment for this shipment
 * (decision clear/monitor/review/block, findings, explainability narrative). Compliance gates
 * dispatch eligibility, so a fresh assessment invalidates readiness.
 */
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Gavel, ShieldQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShipmentAssessment, useAssessShipment, TradeApiError, errorMessage } from '@/api';
import { LoadingState, ErrorState, EmptyState, ScoreBar, KeyVal, num, humanize } from './ui-states';
import { DecisionBadge, SeverityBadge } from './badges';

export function CompliancePanel({ shipmentId, mayEdit }: { shipmentId: string; mayEdit: boolean }) {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useShipmentAssessment(shipmentId);
  const assess = useAssessShipment(shipmentId);

  const notFound = isError && error instanceof TradeApiError && error.code === 'HTTP_404';

  async function run() {
    try { await assess.mutateAsync({}); toast({ title: 'Compliance assessment complete' }); }
    catch (err) { toast({ title: 'Assessment failed', description: errorMessage(err), variant: 'destructive' }); }
  }

  const AssessButton = mayEdit ? (
    <Button variant="outline" size="sm" onClick={run} disabled={assess.isPending}>
      {assess.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />}
      {data ? 'Re-assess' : 'Run Assessment'}
    </Button>
  ) : null;

  if (isLoading) return <LoadingState label="Loading compliance assessment…" />;
  if (notFound || !data) return <EmptyState message="No compliance assessment has been run for this shipment." action={AssessButton} />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const findings = data.findings ?? [];
  const topRisks = data.top_risks ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Decision</CardTitle>
          <DecisionBadge decision={data.decision} />
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBar label="Risk score" value={num(data.risk_score)} />
          <KeyVal label="Risk level" value={humanize(data.risk_level)} />
          <KeyVal label="Confidence" value={`${data.confidence}%`} />
          <KeyVal label="Blocking" value={data.blocking ? 'Yes' : 'No'} />
          <KeyVal label="Model" value={data.model_provider ?? '—'} />
          {AssessButton}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><ShieldQuestion className="h-4 w-4" /> Findings ({data.finding_count})</CardTitle>
          <CardDescription>{data.rule_finding_count} rule-grounded · {data.ai_finding_count} AI-surfaced.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.narrative && <p className="rounded-lg bg-muted/40 p-3 text-sm">{data.narrative}</p>}
          {topRisks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topRisks.map((r, i) => <span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{humanize(String(r))}</span>)}
            </div>
          )}
          {findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings.</p>
          ) : (
            <div className="space-y-2">
              {findings.map((f, i) => (
                <div key={i} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="text-sm font-medium">{f.message}</p>
                    <p className="text-xs text-muted-foreground">{humanize(f.category)} · {f.source ?? 'rule'}</p>
                  </div>
                  <SeverityBadge severity={f.severity} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
