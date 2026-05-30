'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { cn, formatCurrency } from '@/lib/utils';
import { ShieldCheck, Zap, AlertTriangle, FileText, Activity, Box } from 'lucide-react';

interface InstitutionalCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  value?: number;
  currency?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'rfq' | 'deal' | 'risk' | 'audit' | 'compliance' | 'general';
  className?: string;
  density?: 'compact' | 'standard' | 'executive';
}

/**
 * @file institutional-cards.tsx
 * @description Standardized situational cards for the Baalvion OS.
 */
export function InstitutionalCard({
  title,
  subtitle,
  status,
  value,
  currency = 'USD',
  icon,
  children,
  footer,
  variant = 'general',
  className,
  density = 'standard'
}: InstitutionalCardProps) {
  const icons = {
    rfq: <FileText className="h-4 w-4 text-primary" />,
    deal: <Zap className="h-4 w-4 text-primary" />,
    risk: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    audit: <Activity className="h-4 w-4 text-primary" />,
    compliance: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
    general: <Box className="h-4 w-4 text-primary" />
  };

  return (
    <Card className={cn(
      "shadow-institutional border-2 transition-all hover:border-primary/40 rounded-2xl overflow-hidden bg-background flex flex-col",
      className
    )}>
      <CardHeader className={cn(
        "border-b bg-muted/5",
        density === 'compact' ? "py-4 px-6" : "py-6 px-8"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-background border-2 shadow-inner">
              {icon || icons[variant]}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-black uppercase tracking-wide truncate">{title}</CardTitle>
              {subtitle && <CardDescription className="text-[10px] font-bold mt-1 italic opacity-60 uppercase truncate">{subtitle}</CardDescription>}
            </div>
          </div>
          {status && <StatusBadge status={status} className="text-[9px] h-6 px-3 border-2" />}
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "flex-1 space-y-6",
        density === 'compact' ? "p-6" : "p-8"
      )}>
        {value !== undefined && (
          <div className="p-6 rounded-2xl bg-muted/20 border-2 border-dashed">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-wide opacity-60 mb-1">Contract Valuation</p>
            <p className="text-3xl font-black tracking-tighter text-primary leading-none tabular-nums">{formatCurrency(value, currency)}</p>
          </div>
        )}
        <div className="text-sm font-medium leading-relaxed">
          {children}
        </div>
      </CardContent>

      {footer && (
        <CardFooter className="p-6 border-t bg-muted/10 flex justify-center">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
