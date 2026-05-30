'use client';

import { Shipment, ShipmentStatus } from "@/services/logistics-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn, getFlag, formatCurrency } from "@/lib/utils";
import { PATHS } from "@/lib/paths";
import { Ship, ArrowRight } from "lucide-react";

interface ShipmentTableProps {
  data: Shipment[];
}

const statusColors: Record<string, string> = {
  created: "bg-gray-500/10 text-gray-600 border-gray-200",
  picked_up: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_transit: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  delivered: "bg-green-500/10 text-green-600 border-green-200",
};

export function ShipmentTable({ data }: ShipmentTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-card">
        No shipment records found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">ID / Order</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Carrier</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Global Corridor</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Value</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">ETA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((shipment) => (
            <TableRow 
              key={shipment.id} 
              className="cursor-pointer hover:bg-primary/[0.02] transition-colors border-b last:border-0"
              onClick={() => router.push(`${PATHS.LOGISTICS_SHIPMENT}/${shipment.id}`)}
            >
              <TableCell className="pl-6">
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-primary">{shipment.id}</span>
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{shipment.orderId}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded-md bg-muted/50 border">
                      <Ship className="h-3 w-3 text-muted-foreground" />
                   </div>
                   <span className="text-xs font-bold">{shipment.carrier}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{getFlag(shipment.origin.split(',')[shipment.origin.split(',').length-1].trim())}</span>
                  </div>
                  <ArrowRight className="h-2 w-2 text-muted-foreground opacity-30" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{getFlag(shipment.destination.split(',')[shipment.destination.split(',').length-1].trim())}</span>
                  </div>
                  <div className="flex flex-col ml-1">
                    <span className="text-[10px] font-bold truncate max-w-[120px]">{shipment.origin.split(',')[0]}</span>
                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">to {shipment.destination.split(',')[0]}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-black">{formatCurrency(shipment.value || 0)}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("capitalize text-[9px] font-black px-2 py-0.5 border-2", statusColors[shipment.status])}>
                  {shipment.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                <span className="text-xs font-medium text-muted-foreground">
                  {format(new Date(shipment.estimatedDelivery), "MMM d, yyyy")}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
