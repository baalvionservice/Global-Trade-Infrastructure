'use client';

/**
 * @file trade-ops/_components/overview-panel.tsx
 * @description Overview tab — shipment facts (cargo / route / carrier), the carrier milestone
 * timeline + exceptions, and status controls. Reads the embedded milestones/exceptions on the live
 * shipment record; "Refresh" pulls fresh carrier tracking.
 */
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Loader2, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRefreshTracking, useUpdateShipmentStatus, errorMessage, type Shipment, type ShipmentStatus } from '@/api';
import { formatCurrency } from '@/lib/utils';
import { KeyVal, when, humanize, num } from './ui-states';

const STATUS_FLOW: ShipmentStatus[] = [
  'booked', 'picked_up', 'in_transit', 'port_processing', 'customs_clearance',
  'customs_hold', 'released', 'out_for_delivery', 'delivered', 'delayed', 're_routed', 'exception', 'cancelled',
];

export function OverviewPanel({ shipment, mayEdit }: { shipment: Shipment; mayEdit: boolean }) {
  const { toast } = useToast();
  const id = String(shipment.id);
  const refresh = useRefreshTracking(id);
  const updateStatus = useUpdateShipmentStatus(id);

  async function changeStatus(status: string) {
    try { await updateStatus.mutateAsync({ status: status as ShipmentStatus }); toast({ title: `Status → ${humanize(status)}` }); }
    catch (err) { toast({ title: 'Status update failed', description: errorMessage(err), variant: 'destructive' }); }
  }

  async function refreshTracking() {
    try { await refresh.mutateAsync(); toast({ title: 'Tracking refreshed' }); }
    catch (err) { toast({ title: 'Refresh failed', description: errorMessage(err), variant: 'destructive' }); }
  }

  const milestones = shipment.milestones ?? [];
  const exceptions = (shipment.exceptions ?? []).filter((e) => !e.resolved);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Cargo &amp; Route</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <KeyVal label="Carrier" value={shipment.carrier_name} />
          <KeyVal label="Vessel" value={shipment.vessel_name} />
          <KeyVal label="Tracking #" value={shipment.tracking_number} />
          <KeyVal label="Container" value={shipment.container_id} />
          <KeyVal label="Route" value={`${shipment.origin ?? '—'} → ${shipment.destination ?? '—'}`} />
          <KeyVal label="Order" value={shipment.order_id ? `#${shipment.order_id}` : '—'} />
          <KeyVal label="Value" value={shipment.value ? formatCurrency(num(shipment.value), shipment.currency ?? 'USD') : '—'} />
          <KeyVal label="ETA" value={when(shipment.estimated_arrival)} />
          <KeyVal label="Actual Arrival" value={when(shipment.actual_arrival)} />
          <KeyVal label="Created" value={when(shipment.createdAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" /> Tracking Timeline</CardTitle>
            <CardDescription>Carrier milestones &amp; exceptions.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {mayEdit && (
              <Select value={shipment.status} onValueChange={changeStatus}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={refreshTracking} disabled={refresh.isPending} aria-label="Refresh tracking">
              {refresh.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exceptions.length > 0 && (
              <div className="space-y-1.5">
                {exceptions.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="font-medium">{e.message ?? e.code ?? 'Exception'}</span>
                    {e.detectedAt && <span className="ml-auto text-muted-foreground">{when(e.detectedAt)}</span>}
                  </div>
                ))}
              </div>
            )}
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tracking milestones yet.</p>
            ) : (
              <ol className="relative space-y-3 border-l border-border pl-4">
                {milestones.map((m, i) => (
                  <li key={m.id ?? i} className="relative">
                    <span className="absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center">
                      <CheckCircle2 className={`h-3 w-3 ${m.isVerified ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    </span>
                    <p className="text-sm font-medium">{humanize(m.status)}</p>
                    <p className="text-xs text-muted-foreground">{m.location ?? '—'} · {when(m.timestamp)}{m.notes ? ` · ${m.notes}` : ''}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
