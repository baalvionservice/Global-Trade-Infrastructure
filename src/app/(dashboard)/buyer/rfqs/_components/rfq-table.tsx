'use client';

import { RFQ, RFQStatus } from "@/services/rfq-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { PATHS } from "@/lib/paths";

interface RFQTableProps {
  data: RFQ[];
}

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
  negotiating: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
  closed: "bg-muted text-muted-foreground hover:bg-muted/80",
};

export function RFQTable({ data }: RFQTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
        No RFQs found matching your criteria.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RFQ ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Target Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rfq) => (
            <TableRow 
              key={rfq.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`${PATHS.BUYER_RFQS}/${rfq.id}`)}
            >
              <TableCell className="font-medium">{rfq.id}</TableCell>
              <TableCell>{rfq.productName}</TableCell>
              <TableCell>{(rfq.quantity as any)?.value ?? rfq.quantity} {rfq.unit}</TableCell>
              <TableCell>{rfq.currency} {(rfq.targetPrice || 0).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[rfq.status]}>
                  {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(rfq.createdAt), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
