'use client';

/**
 * @file org-ui.tsx
 * @description Shared presentational primitives for the organization-admin console
 * (settings / users / audit). Keeps the three pages visually consistent and DRY:
 * page header, role/status badges, role <Select>, and loading / empty / error states.
 */

import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MEMBERSHIP_ROLES, type MembershipRole } from '@/core/organizations';
import type { OrgStatus } from '@/lib/admin-api';

/** The seven membership roles, ordered most → least privileged, for every role dropdown. */
export const ROLE_OPTIONS: ReadonlyArray<{ value: MembershipRole; label: string }> = [
  { value: MEMBERSHIP_ROLES.OWNER, label: 'Owner' },
  { value: MEMBERSHIP_ROLES.ADMIN, label: 'Admin' },
  { value: MEMBERSHIP_ROLES.MANAGER, label: 'Manager' },
  { value: MEMBERSHIP_ROLES.OFFICER, label: 'Officer' },
  { value: MEMBERSHIP_ROLES.ANALYST, label: 'Analyst' },
  { value: MEMBERSHIP_ROLES.OPERATOR, label: 'Operator' },
  { value: MEMBERSHIP_ROLES.VIEWER, label: 'Viewer' },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
);

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

/** Consistent editorial page header matching the settings/profile surfaces. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="text-4xl font-black uppercase tracking-tighter">{title}</h2>
        <p className="text-muted-foreground font-medium italic">{description}</p>
      </div>
      {children}
    </div>
  );
}

/** Capability-tier badge for a membership role. */
export function RoleBadge({ role }: { role: MembershipRole | string }) {
  const isOwner = role === MEMBERSHIP_ROLES.OWNER;
  const isAdmin = role === MEMBERSHIP_ROLES.ADMIN;
  return (
    <Badge
      variant="outline"
      className={
        isOwner
          ? 'h-6 px-3 text-[9px] font-black uppercase tracking-widest border-primary/40 text-primary'
          : isAdmin
            ? 'h-6 px-3 text-[9px] font-black uppercase tracking-widest border-indigo-300 text-indigo-600'
            : 'h-6 px-3 text-[9px] font-black uppercase tracking-widest border-muted-foreground/30 text-muted-foreground'
      }
    >
      {roleLabel(role)}
    </Badge>
  );
}

/** Active / suspended status pill, shared by org status and member status. */
export function StatusBadge({ status }: { status: OrgStatus | 'active' | 'suspended' | 'removed' | string }) {
  const active = status === 'active';
  const removed = status === 'removed';
  return (
    <Badge
      variant="outline"
      className={
        active
          ? 'h-6 px-3 text-[9px] font-black uppercase tracking-widest border-emerald-300 text-emerald-600'
          : removed
            ? 'h-6 px-3 text-[9px] font-black uppercase tracking-widest border-muted-foreground/30 text-muted-foreground opacity-60'
            : 'h-6 px-3 text-[9px] font-black uppercase tracking-widest border-amber-300 text-amber-600'
      }
    >
      {status}
    </Badge>
  );
}

interface RoleSelectProps {
  value: MembershipRole | string;
  onValueChange: (role: MembershipRole) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Dropdown of the seven membership roles. */
export function RoleSelect({ value, onValueChange, disabled, className, ariaLabel }: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as MembershipRole)} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel ?? 'Select role'}
        className={className ?? 'h-10 w-[150px] font-bold border-2 rounded-xl text-xs uppercase'}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold uppercase">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Centered spinner block for an in-flight fetch. */
export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-primary" /> {label}
    </div>
  );
}

/** Inline destructive error banner with an optional retry. */
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 border-destructive/30 bg-destructive/5 text-destructive">
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-xs font-bold leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 h-9 px-4 font-black uppercase text-[9px] tracking-widest border-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

/** Empty-state placeholder for a table or section with no rows. */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground opacity-30" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{message}</p>
    </div>
  );
}

/** Compact relative/absolute timestamp. Returns an em dash for null. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
