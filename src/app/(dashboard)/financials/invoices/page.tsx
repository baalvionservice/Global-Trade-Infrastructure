'use client';

/**
 * @file financials/invoices/page.tsx
 * @description Invoice Center — Invoice Management + Accounts Receivable + Accounts Payable.
 * Wired to the live invoice-service (financial-services-java :13021) via /finance-bff. Server
 * computes totals, enforces the status workflow, and tracks AR/AP aging. No mock data.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, AlertTriangle, Banknote, FileText } from 'lucide-react';
import { NewInvoiceDialog } from './_components/new-invoice-dialog';
import {
  listInvoices, getInvoiceMetrics, getReceivablesAging, getPayablesAging,
  issueInvoice, recordInvoicePayment, cancelInvoice, disputeInvoice,
  type Invoice, type InvoiceMetrics, type AgingSummary, type InvoiceStatus,
} from '@/services/invoice-service';

const STATUS_TONE: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border-border',
  ISSUED: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  PARTIALLY_PAID: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  OVERDUE: 'bg-red-500/10 text-red-600 border-red-500/20',
  CANCELLED: 'bg-muted text-muted-foreground border-border line-through',
  DISPUTED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const money = (n: number, ccy = 'USD') =>
  (Number(n) || 0).toLocaleString(undefined, { style: 'currency', currency: ccy, maximumFractionDigits: 2 });

export default function InvoiceCenterPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null);
  const [ar, setAr] = useState<AgingSummary | null>(null);
  const [ap, setAp] = useState<AgingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [inv, m, arA, apA] = await Promise.all([
        listInvoices(), getInvoiceMetrics(), getReceivablesAging(), getPayablesAging(),
      ]);
      setInvoices(inv); setMetrics(m); setAr(arA); setAp(apA);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id); setError(null);
    try { await fn(); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Action failed'); }
    finally { setBusyId(null); }
  };

  const recordPayment = (inv: Invoice) => {
    const raw = window.prompt(`Record payment for ${inv.invoiceNumber} (amount due ${money(inv.amountDue, inv.currency)})`, String(inv.amountDue));
    if (raw == null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) { setError('Enter a positive amount'); return; }
    void act(inv.id, () => recordInvoicePayment(inv.id, amount, inv.currency));
  };

  const receivables = useMemo(() => invoices.filter((i) => i.direction === 'RECEIVABLE'), [invoices]);
  const payables = useMemo(() => invoices.filter((i) => i.direction === 'PAYABLE'), [invoices]);

  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Center</h1>
          <p className="text-sm text-muted-foreground">Invoice management, receivables &amp; payables — live from the financial system of record.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => load()} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          <NewInvoiceDialog onCreated={load} />
        </div>
      </header>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<ArrowDownLeft className="h-4 w-4 text-emerald-600" />} label="Outstanding Receivable" value={money(metrics?.totalOutstandingReceivable ?? 0)} sub={`${ar?.invoiceCount ?? 0} open`} loading={loading} />
        <Kpi icon={<ArrowUpRight className="h-4 w-4 text-sky-600" />} label="Outstanding Payable" value={money(metrics?.totalOutstandingPayable ?? 0)} sub={`${ap?.invoiceCount ?? 0} open`} loading={loading} />
        <Kpi icon={<AlertTriangle className="h-4 w-4 text-red-600" />} label="Overdue" value={money(metrics?.overdueAmount ?? 0)} sub={`${metrics?.overdueCount ?? 0} invoices`} loading={loading} />
        <Kpi icon={<FileText className="h-4 w-4 text-muted-foreground" />} label="Total Invoices" value={String(invoices.length)} sub={statusSummary(metrics)} loading={loading} />
      </section>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <InvoiceTable rows={invoices} loading={loading} busyId={busyId} onAct={act} onPay={recordPayment} />
        </TabsContent>
        <TabsContent value="ar" className="mt-4 space-y-4">
          <AgingCard title="Receivables aging" summary={ar} loading={loading} />
          <InvoiceTable rows={receivables} loading={loading} busyId={busyId} onAct={act} onPay={recordPayment} />
        </TabsContent>
        <TabsContent value="ap" className="mt-4 space-y-4">
          <AgingCard title="Payables aging" summary={ap} loading={loading} />
          <InvoiceTable rows={payables} loading={loading} busyId={busyId} onAct={act} onPay={recordPayment} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function statusSummary(m: InvoiceMetrics | null): string {
  if (!m) return '—';
  const c = m.countsByStatus || {};
  return `${c.PAID ?? 0} paid · ${c.DRAFT ?? 0} draft`;
}

function Kpi({ icon, label, value, sub, loading }: { icon: React.ReactNode; label: string; value: string; sub: string; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{icon}{label}</div>
        {loading ? <Skeleton className="h-7 w-28 mt-2" /> : <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>}
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function AgingCard({ title, summary, loading }: { title: string; summary: AgingSummary | null; loading: boolean }) {
  const buckets = [
    { k: 'Current', v: summary?.current ?? 0 },
    { k: '1–30d', v: summary?.days1To30 ?? 0 },
    { k: '31–60d', v: summary?.days31To60 ?? 0 },
    { k: '61–90d', v: summary?.days61To90 ?? 0 },
    { k: '90d+', v: summary?.days90Plus ?? 0 },
  ];
  const ccy = summary?.currency || 'USD';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">Total outstanding <span className="font-semibold text-foreground tabular-nums">{money(summary?.totalOutstanding ?? 0, ccy)}</span></span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {buckets.map((b) => (
            <div key={b.k} className="rounded-md border bg-card p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{b.k}</div>
              {loading ? <Skeleton className="h-5 w-16 mt-1" /> : <div className="text-sm font-semibold tabular-nums mt-1">{money(b.v, ccy)}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceTable({
  rows, loading, busyId, onAct, onPay,
}: {
  rows: Invoice[]; loading: boolean; busyId: string | null;
  onAct: (id: string, fn: () => Promise<unknown>) => void;
  onPay: (inv: Invoice) => void;
}) {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (rows.length === 0) return <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No invoices yet. Create one to get started.</CardContent></Card>;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Dir</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((inv) => {
              const busy = busyId === inv.id;
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs">
                      {inv.direction === 'RECEIVABLE' ? <ArrowDownLeft className="h-3 w-3 text-emerald-600" /> : <ArrowUpRight className="h-3 w-3 text-sky-600" />}
                      {inv.direction === 'RECEIVABLE' ? 'AR' : 'AP'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{inv.counterpartyName}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(inv.total, inv.currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(inv.amountDue, inv.currency)}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_TONE[inv.status]}>{inv.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.dueDate || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {inv.status === 'DRAFT' && <Button size="sm" variant="outline" disabled={busy} onClick={() => onAct(inv.id, () => issueInvoice(inv.id))}>Issue</Button>}
                      {['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status) && (
                        <Button size="sm" variant="outline" className="gap-1" disabled={busy} onClick={() => onPay(inv)}><Banknote className="h-3 w-3" /> Pay</Button>
                      )}
                      {['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status) && (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onAct(inv.id, () => disputeInvoice(inv.id))}>Dispute</Button>
                      )}
                      {['DRAFT', 'ISSUED', 'DISPUTED'].includes(inv.status) && (
                        <Button size="sm" variant="ghost" className="text-muted-foreground" disabled={busy} onClick={() => onAct(inv.id, () => cancelInvoice(inv.id))}>Cancel</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
