'use client';

/**
 * @file trade-ops/_components/ui-states.tsx
 * @description Shared loading / empty / error / retry primitives + small data-display helpers used
 * across every Trade Operations surface. Enforces the contract: every async view has a loading
 * state, an empty state, and an error state with a retry — the UI never silently breaks.
 */
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex h-40 items-center justify-center text-sm text-muted-foreground', className)}>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
      <AlertTriangle className="h-6 w-6 text-destructive" />
      <p className="max-w-md">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
      <Inbox className="h-6 w-6 opacity-50" />
      <p>{message}</p>
      {action}
    </div>
  );
}

/** Generic async gate: render the right state for a React Query result. */
export function AsyncGate({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  emptyMessage,
  onRetry,
  loadingLabel,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  loadingLabel?: string;
  children: React.ReactNode;
}) {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (isError) return <ErrorState message={errorMessage ?? 'Failed to load.'} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState message={emptyMessage ?? 'Nothing here yet.'} />;
  return <>{children}</>;
}

/** A labelled key/value row used in detail panels. */
export function KeyVal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? '—'}</span>
    </div>
  );
}

/** A 0–100 score bar coloured by band. */
export function ScoreBar({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = v >= 80 ? 'bg-emerald-500' : v >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{v}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** A large circular readiness gauge. */
export function ScoreRing({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = v >= 80 ? 'text-emerald-500' : v >= 50 ? 'text-amber-500' : 'text-rose-500';
  const stroke = v >= 80 ? '#10b981' : v >= 50 ? '#f59e0b' : '#f43f5e';
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (v / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', tone)}>{v}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

/** Coerce a DECIMAL-as-string|number into a finite number (0 fallback). */
export function num(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  return Number.isFinite(n as number) ? (n as number) : 0;
}

/** Format an ISO timestamp for display, tolerating null. */
export function when(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

/** Title-case a snake/kebab token for labels. */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
