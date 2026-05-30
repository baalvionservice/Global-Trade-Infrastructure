'use client';

import { RFQResponse } from "@/services/rfq-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Zap, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PATHS } from "@/lib/paths";

interface ResponsesTableProps {
  data: RFQResponse[];
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-700 border-blue-200",
  accepted: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  rejected: "bg-rose-500/10 text-rose-700 border-rose-200",
};

export function ResponsesTable({ data }: ResponsesTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-3xl bg-card/50">
        <Search className="h-12 w-12 mb-4 opacity-10" />
        <p className="font-black uppercase tracking-widest text-[10px]">No active quotations found in current cycle.</p>
        <p className="text-[9px] mt-1 opacity-60 uppercase tracking-tighter">Explore open RFQs to submit your first institutional bid.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b-2">
            <TableHead className="text-[10px] font-black uppercase tracking-wide pl-10 py-6">Identity / RFQ</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wide">Commercial Bid</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wide">Lead Time</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wide">State</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-wide pr-10">Submission Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((res) => (
            <TableRow 
              key={res.id} 
              className="group hover:bg-primary/[0.02] transition-colors border-b last:border-0 cursor-pointer"
              onClick={() => router.push(`${PATHS.SELLER_RFQS}/${res.rfqId}`)}
            >
              <TableCell className="pl-10 py-8">
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-primary">{res.id}</span>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Linked: {res.rfqId}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                   <span className="font-black text-sm text-foreground">{formatCurrency(res.price)}</span>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Unit Price Proposal</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                   <Clock className="h-3.5 w-3.5 text-muted-foreground opacity-30" />
                   <span className="text-xs font-bold uppercase tracking-tight">{res.deliveryTime}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(
                  "font-black text-[9px] px-2.5 py-0.5 border-2 rounded-full uppercase tracking-tighter",
                  statusColors[res.status] || "bg-muted"
                )}>
                  {res.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-10">
                <div className="flex flex-col items-end">
                   <span className="text-xs font-bold text-muted-foreground">{format(new Date(res.createdAt), "MMM d, yyyy")}</span>
                   <span className="text-[8px] font-black uppercase text-muted-foreground opacity-40">Handshake Pending</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
