import { Badge } from '@/components/ui/badge';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

function pick(map: Record<string, Variant>, value: string, fallback: Variant = 'secondary'): Variant {
  return map[value] ?? fallback;
}

const STATE_VARIANT: Record<string, Variant> = {
  TRADE_COMPLETED: 'default',
  TRADE_CANCELLED: 'destructive',
  RFQ_REJECTED: 'destructive',
};

export function StateBadge({ state }: { state: string }) {
  return <Badge variant={pick(STATE_VARIANT, state, 'secondary')}>{state.replace(/_/g, ' ')}</Badge>;
}

const RISK_VARIANT: Record<string, Variant> = {
  PENDING: 'outline',
  LOW: 'secondary',
  CLEARED: 'secondary',
  MEDIUM: 'default',
  HIGH: 'destructive',
  CRITICAL: 'destructive',
  BLOCKED: 'destructive',
};

export function RiskBadge({ level }: { level: string }) {
  return <Badge variant={pick(RISK_VARIANT, level, 'outline')}>{level}</Badge>;
}

const COMPLIANCE_VARIANT: Record<string, Variant> = {
  PASSED: 'default',
  PASS: 'default',
  FAILED: 'destructive',
  FAIL: 'destructive',
  BLOCKED: 'destructive',
  PENDING: 'outline',
  REVIEW: 'outline',
  UNDER_REVIEW: 'outline',
};

export function ComplianceBadge({ status }: { status: string }) {
  return <Badge variant={pick(COMPLIANCE_VARIANT, status, 'outline')}>{status.replace(/_/g, ' ')}</Badge>;
}

const FINANCE_VARIANT: Record<string, Variant> = {
  REQUESTED: 'outline',
  UNDER_REVIEW: 'outline',
  APPROVED: 'default',
  ACTIVE: 'default',
  SETTLED: 'secondary',
  REJECTED: 'destructive',
  CANCELLED: 'destructive',
};

export function FinanceBadge({ status }: { status: string }) {
  return <Badge variant={pick(FINANCE_VARIANT, status, 'outline')}>{status}</Badge>;
}
