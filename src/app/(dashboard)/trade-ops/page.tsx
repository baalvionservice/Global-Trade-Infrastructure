'use client';

/**
 * @file trade-ops/page.tsx
 * @description Trade Operations Control Center — the shipment-centric command surface over the live
 * TradeOps Cloud (trade-service). Lists every tenant shipment with live status + lifecycle, with
 * server-side pagination, status filter, debounced search, and live polling. All data is real —
 * fetched through the auth-gateway BFF (tenant + auth enforced server-side).
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, RefreshCw, Radio, Truck, AlertTriangle, PackageCheck, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { canEdit } from '@/core/authorization';
import { useShipments, type ShipmentStatus } from '@/api';
import { AsyncGate, when } from './_components/ui-states';
import { ShipmentStatusBadge } from './_components/badges';
import { NewShipmentDialog } from './_components/new-shipment-dialog';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: ShipmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'booked', label: 'Booked' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'customs_clearance', label: 'Customs Clearance' },
  { value: 'customs_hold', label: 'Customs Hold' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'exception', label: 'Exception' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ACTIVE = new Set(['in_transit', 'booked', 'picked_up', 'port_processing', 'customs_clearance', 'out_for_delivery']);
const TROUBLED = new Set(['delayed', 'customs_hold', 'exception']);

export default function TradeOpsDashboard() {
  const router = useRouter();
  const { authz } = useAppState();
  const mayEdit = canEdit(authz);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ShipmentStatus | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [poll, setPoll] = useState(true);

  // Debounce search → avoids refetch storms while typing.
  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, status: status === 'all' ? undefined : status, q: search || undefined }),
    [page, status, search],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useShipments(params, { poll });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const active = items.filter((s) => ACTIVE.has(s.status)).length;
  const troubled = items.filter((s) => TROUBLED.has(s.status)).length;
  const delivered = items.filter((s) => s.status === 'delivered').length;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Ship className="h-7 w-7 text-primary" /> Trade Operations
          </h2>
          <p className="text-sm text-muted-foreground">Real-time control center over the TradeOps Cloud — shipments, workflow, readiness, documents, compliance, logistics &amp; customs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={poll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPoll((p) => !p)}
            title="Toggle live updates"
          >
            <Radio className={`mr-2 h-4 w-4 ${poll ? 'animate-pulse' : ''}`} /> {poll ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="icon" onClick={() => void refetch()} aria-label="Refresh" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          {mayEdit && <NewShipmentDialog onCreated={(id) => router.push(`/trade-ops/${id}`)} />}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Shipments" value={total} icon={<Ship className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="In Motion (page)" value={active} icon={<Truck className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Needs Attention (page)" value={troubled} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
        <StatCard title="Delivered (page)" value={delivered} icon={<PackageCheck className="h-4 w-4 text-emerald-500" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Shipments</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search ref / carrier / container…"
                className="w-56 pl-8"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v as ShipmentStatus | 'all'); setPage(1); }}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <AsyncGate
            isLoading={isLoading}
            isError={isError}
            errorMessage={error instanceof Error ? error.message : 'Failed to load shipments.'}
            onRetry={() => void refetch()}
            isEmpty={items.length === 0}
            emptyMessage={search || status !== 'all' ? 'No shipments match your filters.' : 'No shipments yet. Create one to begin.'}
            loadingLabel="Loading shipments…"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => router.push(`/trade-ops/${s.id}`)}>
                    <TableCell className="font-mono font-medium">{s.tracking_number ?? `#${s.id}`}</TableCell>
                    <TableCell><ShipmentStatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-xs">{(s.origin ?? '—')} → {(s.destination ?? '—')}</TableCell>
                    <TableCell className="text-xs">{s.carrier_name ?? '—'}</TableCell>
                    <TableCell className="text-xs">{s.vessel_name ?? '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{when(s.estimated_arrival)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{when(s.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {page} of {totalPages} · {total} total</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AsyncGate>
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
      <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
  );
}
