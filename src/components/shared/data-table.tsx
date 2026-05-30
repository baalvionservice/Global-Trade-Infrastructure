'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Inbox, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useDensity } from '@/design-system/hooks/use-density';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * @file data-table.tsx
 * @description High-performance unified data grid for institutional records.
 * Upgraded: Reacts to global Design System Density Tokens.
 */
export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  searchPlaceholder = 'Search records...',
  onSearch,
  isLoading,
  emptyMessage = 'No records found matching your criteria.',
  className
}: DataTableProps<T>) {
  const { tokens, isCompact } = useDensity();

  return (
    <div className={cn("space-y-6", className)}>
      {onSearch && (
        <div className="flex items-center justify-between px-2">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
            <Input
              placeholder={searchPlaceholder}
              className={cn(
                "pl-12 bg-background border-2 rounded-2xl shadow-sm focus-visible:ring-primary/20 transition-all font-black text-sm",
                isCompact ? "h-11" : "h-14"
              )}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-primary/5 rounded-full border-2 border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
             <Zap className="h-3.5 w-3.5" /> High-Scale Logic Active
          </div>
        </div>
      )}

      <div className={cn(
        "border-2 bg-card shadow-lvl-2 overflow-hidden transition-all duration-300",
        isCompact ? "rounded-2xl" : "rounded-2xl"
      )}>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b-2">
              {columns.map((col, colIdx) => (
                <TableHead
                  key={colIdx}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wide text-muted-foreground/80",
                    isCompact ? "py-4 px-6" : "py-8 px-6",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center gap-6">
                      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Operational Ledger...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center gap-8 py-16"
                    >
                      <div className="p-6 rounded-2xl bg-muted/30 border-4 border-dashed border-primary/5">
                         <Inbox className="h-14 w-20 text-muted-foreground opacity-10" />
                      </div>
                      <div className="space-y-2 px-6">
                        <p className="text-2xl font-black uppercase tracking-tighter text-foreground">{emptyMessage}</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium italic opacity-50">"Institutional context is required to reconstruct this operational view."</p>
                      </div>
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "group transition-all duration-200 border-b last:border-0",
                      onRowClick && 'cursor-pointer hover:bg-primary/[0.02]',
                      isCompact ? "h-[56px]" : "h-[72px]"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={cn(
                          "text-sm font-medium",
                          isCompact ? "py-2 px-6" : "py-6 px-6",
                          col.className
                        )}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.01 + 0.1 }}
                        >
                          {col.cell ? col.cell(row) : (row[col.accessorKey] as React.ReactNode)}
                        </motion.div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
