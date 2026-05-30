'use client';

import { Transaction, TransactionStatus } from "@/services/payment-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, ShieldQuestion } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface TransactionTableProps {
  data: Transaction[];
  limit?: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  failed: "bg-red-500/10 text-red-600 border-red-200",
};

const typeIcons = {
  payment: ArrowUpRight,
  escrow: ArrowDownLeft,
  release: ArrowDownLeft,
  refund: RefreshCcw,
};

export function TransactionTable({ data, limit }: TransactionTableProps) {
  const router = useRouter();
  const displayData = limit ? data.slice(0, limit) : data;

  if (displayData.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Ledger ID</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Type</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Description</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Settlement</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((txn) => {
            const Icon = typeIcons[txn.type as keyof typeof typeIcons] || ShieldQuestion;
            return (
              <TableRow 
                key={txn.id} 
                className="cursor-pointer hover:bg-primary/[0.02] transition-colors border-b last:border-0"
                onClick={() => router.push(`/payments/transactions/${txn.id}`)}
              >
                <TableCell className="font-mono text-[11px] font-bold pl-6 text-primary">{txn.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-muted/50">
                       <Icon className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="capitalize text-xs font-bold">{txn.type}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-xs font-medium">
                   {txn.description}
                   {txn.orderId && <span className="block text-[8px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">Order: {txn.orderId}</span>}
                </TableCell>
                <TableCell>
                  <span className="font-black text-xs">{formatCurrency(txn.amount, txn.currency)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize text-[9px] font-black border-2", statusColors[txn.status])}>
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-[10px] font-bold text-right pr-6">
                  {format(new Date(txn.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
