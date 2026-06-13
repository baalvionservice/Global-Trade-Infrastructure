'use client';

/**
 * @file trade-ops/_components/badges.tsx
 * @description Domain status badges for the Trade Operations surfaces. Each maps a backend enum to a
 * semantic badge variant so status reads consistently across the dashboard and detail tabs.
 */
import { Badge } from '@/components/ui/badge';
import { humanize } from './ui-states';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

function Pill({ value, map, fallback = 'secondary' }: { value: string; map: Record<string, Variant>; fallback?: Variant }) {
  return <Badge variant={map[value] ?? fallback}>{humanize(value)}</Badge>;
}

const SHIPMENT: Record<string, Variant> = {
  delivered: 'default', released: 'default', out_for_delivery: 'default',
  in_transit: 'secondary', booked: 'secondary', picked_up: 'secondary',
  port_processing: 'secondary', customs_clearance: 'secondary',
  delayed: 'destructive', customs_hold: 'destructive', exception: 'destructive', cancelled: 'destructive',
};
export function ShipmentStatusBadge({ status }: { status: string }) {
  return <Pill value={status} map={SHIPMENT} />;
}

const WORKFLOW: Record<string, Variant> = {
  COMPLETED: 'default', DELIVERED: 'default', FAILED: 'destructive', CREATED: 'outline',
};
export function WorkflowStateBadge({ state }: { state: string }) {
  return <Pill value={state} map={WORKFLOW} fallback="secondary" />;
}

const DECISION: Record<string, Variant> = {
  clear: 'default', monitor: 'secondary', review: 'outline', block: 'destructive',
};
export function DecisionBadge({ decision }: { decision: string }) {
  return <Pill value={decision} map={DECISION} fallback="outline" />;
}

const SEVERITY: Record<string, Variant> = {
  none: 'secondary', low: 'secondary', medium: 'outline', high: 'destructive', critical: 'destructive',
};
export function SeverityBadge({ severity }: { severity: string }) {
  return <Pill value={severity} map={SEVERITY} fallback="outline" />;
}

const BAND: Record<string, Variant> = { high: 'default', medium: 'outline', low: 'destructive' };
export function ReadinessBandBadge({ band }: { band: string }) {
  return <Pill value={band} map={BAND} fallback="outline" />;
}

const DOC: Record<string, Variant> = {
  verified: 'default', available: 'secondary', draft: 'outline', scanning: 'outline',
  quarantined: 'destructive', rejected: 'destructive', expired: 'destructive', archived: 'secondary',
};
export function DocStatusBadge({ status }: { status: string }) {
  return <Pill value={status} map={DOC} fallback="outline" />;
}

const SCAN: Record<string, Variant> = {
  clean: 'default', pending: 'outline', skipped: 'secondary', infected: 'destructive', error: 'destructive',
};
export function ScanBadge({ status }: { status: string }) {
  return <Pill value={status} map={SCAN} fallback="outline" />;
}

const VALIDATION: Record<string, Variant> = {
  passed: 'default', passed_with_warnings: 'outline', failed: 'destructive',
};
export function ValidationBadge({ status }: { status: string }) {
  return <Pill value={status} map={VALIDATION} fallback="outline" />;
}

const CUSTOMS: Record<string, Variant> = {
  accepted: 'default', submitted: 'secondary', submitting: 'secondary', queued: 'outline', draft: 'outline',
  rejected: 'destructive', failed: 'destructive', cancelled: 'destructive',
};
export function CustomsStatusBadge({ status }: { status: string }) {
  return <Pill value={status} map={CUSTOMS} fallback="outline" />;
}

const DISPATCH: Record<string, Variant> = {
  dispatched: 'default', ready: 'secondary', dispatching: 'secondary', pending: 'outline',
  failed: 'destructive', rolled_back: 'destructive', cancelled: 'destructive',
};
export function DispatchStatusBadge({ status }: { status: string }) {
  return <Pill value={status} map={DISPATCH} fallback="outline" />;
}
