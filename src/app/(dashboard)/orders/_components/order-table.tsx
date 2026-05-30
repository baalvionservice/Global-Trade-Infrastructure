'use client';

import { Order, OrderStatus } from "@/services/order-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrderTableProps {
  data: Order[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
  processing: "bg-purple-500/10 text-purple-600 border-purple-200",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  delivered: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

export function OrderTable({ data }: OrderTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
        No orders found matching your criteria.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow 
              key={order.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <TableCell className="font-mono text-xs">{order.id}</TableCell>
              <TableCell className="font-medium">{order.product}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{order.sellerName}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Seller</span>
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                ${order.total.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("capitalize", statusColors[order.status])}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {format(new Date(order.createdAt ?? Date.now()), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
