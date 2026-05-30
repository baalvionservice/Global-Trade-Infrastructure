'use client';

import { Escrow, EscrowStatus } from "@/services/escrow-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PATHS } from "@/lib/paths";

interface EscrowTableProps {
  data: Escrow[];
}

const statusColors: Record<EscrowStatus, string> = {
  created: "bg-gray-500/10 text-gray-600 border-gray-200",
  funded: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_transit: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  delivered: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  released: "bg-green-500/10 text-green-600 border-green-200",
  disputed: "bg-orange-500/10 text-orange-600 border-orange-200",
  refunded: "bg-purple-500/10 text-purple-600 border-purple-200",
};

export function EscrowTable({ data }: EscrowTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-card">
        No escrow transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Escrow ID</TableHead>
            <TableHead>Linked Order</TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead>Locked Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((escrow) => (
            <TableRow 
              key={escrow.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`${PATHS.ESCROW}/${escrow.id}`)}
            >
              <TableCell className="font-mono text-xs">{escrow.id}</TableCell>
              <TableCell className="text-sm font-medium">{escrow.orderId}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{escrow.sellerName}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Seller</span>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-primary">
                {escrow.currency} {escrow.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("capitalize", statusColors[escrow.status])}>
                  {escrow.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {format(new Date(escrow.updatedAt), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
