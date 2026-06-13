'use client';

/**
 * @file src/app/(dashboard)/trade-management/page.tsx
 * @description Trade Command Center — the cross-cutting view over the
 * orchestration TradeTransaction lifecycle (RFQ → Settlement). Lists every
 * trade with live workflow / risk / compliance status and links to the full
 * trade detail. Built on the existing dashboard shell + design system.
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { GanttChartSquare, FileText, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { tradeCommandService, TradeListItem } from '@/services/trade-command-service';
import { StateBadge, RiskBadge, ComplianceBadge } from './_components/badges';
import { NewTradeDialog } from './_components/new-trade-dialog';

const TERMINAL = new Set(['TRADE_COMPLETED', 'TRADE_CANCELLED']);

export default function TradeCommandCenterPage() {
  const router = useRouter();
  const [items, setItems] = useState<TradeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tradeCommandService.list({ page: 1, pageSize: 100 });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const inProgress = items.filter((t) => !TERMINAL.has(t.currentState)).length;
  const completed = items.filter((t) => t.currentState === 'TRADE_COMPLETED').length;
  const cancelled = items.filter((t) => t.currentState === 'TRADE_CANCELLED').length;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Trade Command Center</h2>
          <p className="text-sm text-muted-foreground">Orchestrated TradeTransaction lifecycle across RFQ → Settlement.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => void load()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <NewTradeDialog onCreated={(id) => router.push(`/trade-management/${id}`)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Trades" value={total} icon={<GanttChartSquare className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="In Progress" value={inProgress} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Completed" value={completed} icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Cancelled" value={cancelled} icon={<XCircle className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading trades…
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>{error}</p>
              <Button variant="outline" onClick={() => void load()}>Retry</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
              No trades yet. Use “New Trade” to initiate one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => router.push(`/trade-management/${t.id}`)}>
                    <TableCell className="font-mono font-medium">{t.reference}</TableCell>
                    <TableCell><StateBadge state={t.currentState} /></TableCell>
                    <TableCell><RiskBadge level={t.riskStatus} /></TableCell>
                    <TableCell><ComplianceBadge status={t.complianceStatus} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
