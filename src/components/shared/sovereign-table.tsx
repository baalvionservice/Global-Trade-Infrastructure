/**
 * @file sovereign-table.tsx
 * @description THE AUTHORITATIVE DATA GRID.
 * High-density, institutional table framework with live sync and risk indicators.
 */
'use client';

import * as React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpDown, 
  ShieldAlert, 
  Activity, 
  Loader2,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useDensity } from '@/design-system/hooks/use-density';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  riskAware?: boolean;
}

interface SovereignTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  title?: string;
}

export function SovereignTable<T extends { id: string, riskLevel?: string }>({
  columns,
  data,
  onRowClick,
  isLoading,
  searchPlaceholder = 'Resolve identity...',
  title
}: SovereignTableProps<T>) {
  const { tokens, isCompact } = useDensity();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">{title}</h3>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-40" />
                 <input 
                   placeholder={searchPlaceholder}
                   className="h-9 w-64 bg-background border-2 rounded-xl pl-9 pr-4 text-[10px] font-bold uppercase focus:outline-none focus:border-primary/40 transition-all shadow-sm"
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-2 font-black uppercase text-[9px]">
                 <Filter className="mr-2 h-3.5 w-3.5" /> Filter Matrix
              </Button>
           </div>
        </div>
      )}

      <div className={cn(
        "border-2 bg-card shadow-lvl-2 overflow-hidden transition-all duration-300",
        isCompact ? "rounded-xl" : "rounded-2xl"
      )}>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b-2">
              {columns.map((col) => (
                <TableHead 
                  key={String(col.accessorKey)} 
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wide text-muted-foreground/80",
                    isCompact ? "py-4 px-6" : "py-6 px-6",
                    col.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="h-3 w-3 opacity-20" />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center gap-6">
                      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Establishing Ledger Consensus...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                       <Database className="h-12 w-12" />
                       <p className="text-xs font-black uppercase tracking-wide">No Records Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "group transition-all duration-200 border-b last:border-0",
                      onRowClick && 'cursor-pointer hover:bg-primary/[0.02]',
                      row.riskLevel === 'high' && 'bg-red-500/[0.02] hover:bg-red-500/[0.04]'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, cIdx) => (
                      <TableCell 
                        key={cIdx} 
                        className={cn(
                          "text-sm font-medium",
                          isCompact ? "py-3 px-6" : "py-5 px-6",
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
