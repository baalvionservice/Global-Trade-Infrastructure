'use client';

/**
 * @file src/app/(dashboard)/trade-management/[id]/page.tsx
 * @description Trade detail — the single-trade command surface. One TradeTransaction
 * id retrieves workflow, risk, compliance, finance, shipment, customs, settlement,
 * documents, events and audit, with lifecycle actions. Reuses the dashboard design
 * system (Card/Tabs/Table/Badge/Progress/Button).
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Ban, CheckCircle2, Landmark, FilePlus2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { useToast } from '@/hooks/use-toast';
import {
  tradeCommandService,
  TradeGraph,
  ComplianceView,
  FinanceView,
  DomainEventRow,
  AuditRow,
  StatusRow,
} from '@/services/trade-command-service';
import { StateBadge, RiskBadge, ComplianceBadge, FinanceBadge } from '../_components/badges';

const HAPPY_PATH = [
  'RFQ_CREATED', 'RFQ_SUBMITTED', 'RFQ_ACCEPTED', 'DEAL_CREATED', 'DEAL_NEGOTIATION', 'DEAL_APPROVED',
  'ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_EXECUTING', 'ESCROW_CREATED', 'ESCROW_FUNDED',
  'SHIPMENT_CREATED', 'SHIPMENT_PICKED_UP', 'SHIPMENT_IN_TRANSIT', 'SHIPMENT_CUSTOMS', 'SHIPMENT_DELIVERED',
  'SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED', 'TRADE_COMPLETED',
];
const TERMINAL = new Set(['TRADE_COMPLETED', 'TRADE_CANCELLED']);

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { userId, role, tenantId } = useAppState();
  const { toast } = useToast();

  const [graph, setGraph] = useState<TradeGraph | null>(null);
  const [compliance, setCompliance] = useState<ComplianceView | null>(null);
  const [finance, setFinance] = useState<FinanceView | null>(null);
  const [events, setEvents] = useState<DomainEventRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const auth = { userId, role, orgId: tenantId };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [g, c, f, e, a] = await Promise.all([
        tradeCommandService.get(id),
        tradeCommandService.compliance(id),
        tradeCommandService.finance(id),
        tradeCommandService.events(id),
        tradeCommandService.audit(id),
      ]);
      setGraph(g);
      setCompliance(c);
      setFinance(f);
      setEvents(e);
      setAudit(a.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function runAction(label: string, fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      toast({ title: `${label} succeeded` });
      await loadAll();
    } catch (err) {
      toast({ title: `${label} failed`, description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading trade…
      </main>
    );
  }
  if (error || !graph) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
        <p>{error ?? 'Trade not found'}</p>
        <Button variant="outline" onClick={() => router.push('/trade-management')}>Back to Command Center</Button>
      </main>
    );
  }

  const stateIdx = HAPPY_PATH.indexOf(graph.currentState);
  const progress = graph.currentState === 'TRADE_CANCELLED' ? 100 : Math.max(0, Math.round(((stateIdx + 1) / HAPPY_PATH.length) * 100));
  const orderValue = graph.order?.totalAmount ? Number(graph.order.totalAmount) : graph.terms.quantity * graph.terms.unitPrice;
  const isTerminal = TERMINAL.has(graph.currentState);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trade-management')} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground">{graph.reference}</h2>
            <div className="mt-1 flex items-center gap-2">
              <StateBadge state={graph.currentState} />
              <RiskBadge level={graph.riskStatus} />
              <ComplianceBadge status={graph.complianceStatus} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void runAction('Request LC', () =>
            tradeCommandService.requestFinance(id, { type: 'LETTER_OF_CREDIT', amount: orderValue, currency: graph.terms.currency }, auth))}>
            <Landmark className="mr-2 h-4 w-4" /> Request LC
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void runAction('Attach Invoice', () =>
            tradeCommandService.addDocument(id, { kind: 'INVOICE', url: `https://docs.baalvion.local/${graph.reference}/invoice.pdf` }, auth))}>
            <FilePlus2 className="mr-2 h-4 w-4" /> Attach Invoice
          </Button>
          {graph.currentState === 'SETTLEMENT_PENDING' && (
            <Button disabled={busy} onClick={() => void runAction('Complete Trade', () => tradeCommandService.complete(id, auth))}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Release Settlement
            </Button>
          )}
          {!isTerminal && (
            <Button variant="destructive" disabled={busy} onClick={() => void runAction('Cancel Trade', () =>
              tradeCommandService.cancel(id, 'cancelled_from_command_center', auth))}>
              <Ban className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Lifecycle Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">{progress}% · {graph.currentState.replace(/_/g, ' ')}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="risk">Risk &amp; Compliance</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="logistics">Shipment &amp; Customs</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewPanel graph={graph} orderValue={orderValue} /></TabsContent>
        <TabsContent value="workflow"><WorkflowPanel graph={graph} /></TabsContent>
        <TabsContent value="risk"><RiskPanel data={compliance} /></TabsContent>
        <TabsContent value="finance"><FinancePanel data={finance} /></TabsContent>
        <TabsContent value="logistics"><LogisticsPanel graph={graph} /></TabsContent>
        <TabsContent value="documents"><DocumentsPanel graph={graph} /></TabsContent>
        <TabsContent value="events"><EventsPanel events={events} /></TabsContent>
        <TabsContent value="audit"><AuditPanel rows={audit} /></TabsContent>
      </Tabs>
    </main>
  );
}

function KeyVal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function entityLine(label: string, row: StatusRow | null) {
  return <KeyVal label={label} value={row ? `${row.status}` : '—'} />;
}

function OverviewPanel({ graph, orderValue }: { graph: TradeGraph; orderValue: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Commercial</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <KeyVal label="Buyer" value={graph.buyer?.name ?? graph.terms.buyerId} />
          <KeyVal label="Supplier" value={graph.supplier?.name ?? graph.terms.sellerId ?? '—'} />
          <KeyVal label="Commodity" value={graph.terms.commodity} />
          <KeyVal label="Quantity" value={graph.terms.quantity} />
          <KeyVal label="Unit Price" value={formatCurrency(graph.terms.unitPrice, graph.terms.currency)} />
          <KeyVal label="Order Value" value={formatCurrency(orderValue, graph.terms.currency)} />
          <KeyVal label="Route" value={`${graph.terms.originCountry ?? '—'} → ${graph.terms.destinationCountry ?? '—'}`} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Lifecycle Entities</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {entityLine('RFQ', graph.rfq)}
          {entityLine('Deal', graph.deal)}
          {entityLine('Order', graph.order)}
          {entityLine('Escrow', graph.escrow)}
          {entityLine('Payment', graph.payment)}
          {entityLine('Shipment', graph.shipment)}
          {entityLine('Customs', graph.customs)}
          {entityLine('Settlement', graph.settlement)}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkflowPanel({ graph }: { graph: TradeGraph }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">State History</CardTitle>
        <CardDescription>Persisted, replay-safe workflow transitions &amp; compensations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead><TableHead>Type</TableHead><TableHead>From → To</TableHead>
              <TableHead>Actor</TableHead><TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {graph.workflowEvents.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{w.sequence}</TableCell>
                <TableCell>{w.type}</TableCell>
                <TableCell className="font-mono text-xs">{(w.fromState ?? 'GENESIS')} → {w.toState}</TableCell>
                <TableCell className="text-xs">{w.actorRole}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RiskPanel({ data }: { data: ComplianceView | null }) {
  if (!data) return <EmptyCard text="No risk/compliance data." />;
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Risk Assessments</CardTitle></CardHeader>
        <CardContent>
          {data.risk.length === 0 ? <p className="text-sm text-muted-foreground">No assessments yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Score</TableHead><TableHead>Factors</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.risk.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><RiskBadge level={r.level} /></TableCell>
                    <TableCell>{r.score}</TableCell>
                    <TableCell className="text-xs">{(r.factors ?? []).join(', ') || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Compliance Checks</CardTitle></CardHeader>
        <CardContent>
          {data.compliance.length === 0 ? <p className="text-sm text-muted-foreground">No checks yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Control</TableHead><TableHead>Outcome</TableHead><TableHead>Subject</TableHead><TableHead>Reasons</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.compliance.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.type}</TableCell>
                    <TableCell><ComplianceBadge status={c.outcome} /></TableCell>
                    <TableCell className="text-xs">{c.subject}</TableCell>
                    <TableCell className="text-xs">{(c.reasons ?? []).join(', ') || '—'}</TableCell>
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

function FinancePanel({ data }: { data: FinanceView | null }) {
  if (!data) return <EmptyCard text="No finance data." />;
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Finance Instruments</CardTitle></CardHeader>
        <CardContent>
          {data.instruments.length === 0 ? <p className="text-sm text-muted-foreground">No instruments.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Provider</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.instruments.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell><FinanceBadge status={i.status} /></TableCell>
                    <TableCell>{formatCurrency(Number(i.amount), i.currency)}</TableCell>
                    <TableCell className="text-xs">{i.provider ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Financing Requests</CardTitle></CardHeader>
        <CardContent>
          {data.requests.length === 0 ? <p className="text-sm text-muted-foreground">No requests.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Requested By</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell><FinanceBadge status={r.status} /></TableCell>
                    <TableCell>{formatCurrency(Number(r.amount), r.currency)}</TableCell>
                    <TableCell className="text-xs">{r.requestedBy}</TableCell>
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

function LogisticsPanel({ graph }: { graph: TradeGraph }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Shipment</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {graph.shipment ? (
            <>
              <KeyVal label="Status" value={graph.shipment.status} />
              <KeyVal label="Carrier" value={graph.shipment.carrier ?? '—'} />
              <KeyVal label="Origin" value={graph.shipment.origin ?? '—'} />
              <KeyVal label="Destination" value={graph.shipment.destination ?? '—'} />
            </>
          ) : <p className="text-sm text-muted-foreground">Not created yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Customs</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {graph.customs ? (
            <>
              <KeyVal label="Status" value={graph.customs.status} />
              <KeyVal label="Country" value={graph.customs.country ?? '—'} />
            </>
          ) : <p className="text-sm text-muted-foreground">No declaration yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Settlement</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {graph.settlement ? (
            <>
              <KeyVal label="Status" value={graph.settlement.status} />
              <KeyVal label="Amount" value={graph.settlement.amount ? formatCurrency(Number(graph.settlement.amount), graph.settlement.currency ?? 'USD') : '—'} />
            </>
          ) : <p className="text-sm text-muted-foreground">Pending delivery.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentsPanel({ graph }: { graph: TradeGraph }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Trade Documents</CardTitle><CardDescription>Versioned, trade-linked. Superseded versions retained.</CardDescription></CardHeader>
      <CardContent>
        {graph.documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Kind</TableHead><TableHead>Version</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead></TableRow></TableHeader>
            <TableBody>
              {graph.documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.kind}</TableCell>
                  <TableCell>v{d.version}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EventsPanel({ events }: { events: DomainEventRow[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Domain Events</CardTitle><CardDescription>Persisted, replayable event stream.</CardDescription></CardHeader>
      <CardContent>
        {events.length === 0 ? <p className="text-sm text-muted-foreground">No events.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Correlation</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.type}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{e.correlationId.slice(0, 8)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(e.occurredAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AuditPanel({ rows }: { rows: AuditRow[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Audit Trail</CardTitle><CardDescription>Every mutation: who, what, when.</CardDescription></CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No audit records.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Actor</TableHead><TableHead>Source</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs font-medium">{a.action}</TableCell>
                  <TableCell className="text-xs">{a.entityType}</TableCell>
                  <TableCell className="text-xs">{a.actorRole ?? a.actorId}</TableCell>
                  <TableCell className="text-xs">{a.source}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
