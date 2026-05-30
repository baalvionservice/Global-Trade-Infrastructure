'use client';

/**
 * @file adaptive-data-view.tsx
 * @description THE AUTHORITATIVE DATA GRID. 
 * High-density grid that dynamically scales between Bloomberg-style tables and mobile command cards.
 */

import React from 'react';
import { useDeviceClass } from '@/hooks/use-device-class';
import { useDensity } from '@/design-system/hooks/use-density';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdaptiveDataViewProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  renderMobileCard?: (row: T) => React.ReactNode;
  isLoading?: boolean;
}

export function AdaptiveDataView<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  renderMobileCard,
  isLoading
}: AdaptiveDataViewProps<T>) {
  const { isMobile } = useDeviceClass();
  const { tokens, isCompact } = useDensity();

  if (isMobile) {
    return (
      <div className="space-y-6 pb-24">
        <AnimatePresence mode="popLayout">
          {data.map((row, idx) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onRowClick?.(row)}
            >
              {renderMobileCard ? (
                renderMobileCard(row)
              ) : (
                <Card className="border-2 border-white/5 bg-slate-900/60 shadow-2xl active:scale-[0.98] transition-all rounded-2xl overflow-hidden group">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                       <span className="font-mono text-[10px] font-black text-primary opacity-60">ID::{row.id}</span>
                       <div className="h-1.5 w-10 rounded-full bg-primary/20" />
                    </div>
                    <div className="grid gap-6">
                      {columns.filter(c => c.accessorKey !== 'id').map((col, cIdx) => (
                        <div key={cIdx} className="space-y-1.5">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wide">
                            {col.header}
                          </p>
                          <div className="text-sm font-black text-white uppercase tracking-tight">
                            {col.cell ? col.cell(row) : (row[col.accessorKey] as React.ReactNode)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn(
      "border-2 border-white/5 bg-slate-900/40 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700",
      isCompact ? "rounded-2xl" : "rounded-2xl"
    )}>
      <Table>
        <TableHeader className="bg-white/5 border-b border-white/5">
          <TableRow className="hover:bg-transparent">
            {columns.map((col, idx) => (
              <TableHead 
                key={idx} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest text-slate-500",
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
          {data.map((row, rIdx) => (
            <TableRow
              key={row.id}
              className={cn(
                "group transition-all border-b border-white/5 last:border-0",
                onRowClick && "cursor-pointer hover:bg-white/[0.02]"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, cIdx) => (
                <TableCell key={cIdx} className={cn(
                  "text-sm font-bold text-slate-300 uppercase tracking-tight",
                  isCompact ? "py-3 px-6" : "py-6 px-6",
                  col.className
                )}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: rIdx * 0.02 }}>
                    {col.cell ? col.cell(row) : (row[col.accessorKey] as React.ReactNode)}
                  </motion.div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
