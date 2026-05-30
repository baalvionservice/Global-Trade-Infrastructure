'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * @file status-badge.tsx
 * @description Standardized institutional status badge that handles trade lifecycle mapping.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const getVariant = () => {
    switch (normalized) {
      case 'VERIFIED':
      case 'SETTLED':
      case 'CLEARED':
      case 'DELIVERED':
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
      case 'UNDER_REVIEW':
      case 'IN_TRANSIT':
      case 'BOOKED':
        return 'warning';
      case 'FLAGGED':
      case 'HIGH_RISK':
      case 'REJECTED':
      case 'DISPUTED':
      case 'CANCELLED':
      case 'FAILED':
        return 'destructive';
      case 'OPEN':
      case 'PROVISIONED':
      case 'RELEASED':
        return 'verified';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant() as any} className={cn("px-3 h-6 border-2 font-black tracking-tighter", className)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
