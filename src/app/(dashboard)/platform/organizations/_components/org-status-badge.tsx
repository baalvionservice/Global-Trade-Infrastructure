'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrgStatus } from '@/lib/admin-api';

type Props = {
  status: OrgStatus | string;
};

/**
 * Semantic status pill for an organization: green = active, red = suspended.
 * Kept tiny and reusable so the registry table and the detail header read identically.
 */
export function OrgStatusBadge({ status }: Props) {
  const isActive = status === 'active';
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[9px] font-black h-6 px-3 rounded-full uppercase tracking-tighter border-2',
        isActive
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
          : 'bg-red-500/10 text-red-600 border-red-500/30',
      )}
    >
      {isActive ? 'Active' : 'Suspended'}
    </Badge>
  );
}
