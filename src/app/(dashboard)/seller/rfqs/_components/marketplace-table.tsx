/**
 * @file marketplace-table.tsx
 * @description Enhanced discovery view with liquidity ranking and engagement indicators.
 */
'use client';

import { RFQ } from "@/services/rfq-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PATHS } from "@/lib/paths";
import { TrendingUp, Zap, Package, Eye, MessageSquare, Clock } from "lucide-react";
import { cn, getFlag } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MarketplaceTableProps {
  data: RFQ[];
}

const statusColors: Record<string, string> = {
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  NEGOTIATION: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CLOSING_SOON: "bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse",
};

export function MarketplaceTable({ data }: MarketplaceTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-3xl bg-card/50">
        <TrendingUp className="h-12 w-12 mb-4 opacity-10" />
        <p className="font-black uppercase tracking-widest text-[10px]">No matching institutional demand found.</p>
        <p className="text-[9px] mt-1 opacity-60 uppercase tracking-tighter">Adjust your node or sector filters to expand reach.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 bg-card shadow-2xl overflow-hidden transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b-2">
            <TableHead className="text-[10px] font-black uppercase tracking-wide pl-10 py-6">Trade Opportunity</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wide">Target Terms</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wide">Buyer Node</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wide">Market Depth</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-wide pr-10">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rfq) => (
            <TableRow 
              key={rfq.id} 
              className="group hover:bg-primary/[0.03] transition-colors border-b last:border-0 cursor-pointer"
              onClick={() => router.push(`${PATHS.SELLER_RFQS}/${rfq.id}`)}
            >
              <TableCell className="pl-10 py-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                     <span className="font-black text-lg text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{rfq.productName || rfq.title}</span>
                     {(rfq.flags?.quality_score || 0) > 90 && (
                        <div className="p-1 rounded-md bg-primary/10"><Zap className="h-3 w-3 text-primary fill-primary animate-pulse" /></div>
                     )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-[8px] font-black px-2 h-5 bg-muted border-none uppercase tracking-widest opacity-80">
                      {rfq.category}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                       <Package className="h-3 w-3 opacity-30" />
                       {(rfq.quantity?.value || rfq.quantity || 0).toLocaleString()} {rfq.quantity?.unit || rfq.unit || 'Units'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                       <Clock className="h-3 w-3 opacity-30" />
                       {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                   <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground opacity-60">{rfq.pricing?.currency || rfq.currency || 'USD'}</span>
                      <span className="font-black text-lg text-primary tracking-tighter">{(rfq.pricing?.target_price || rfq.targetPrice || 0).toLocaleString()}</span>
                   </div>
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      {rfq.pricing?.pricing_model || 'FOB'} • {rfq.logistics?.shipment_terms || 'Ocean'}
                   </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <span className="text-2xl filter drop-shadow-sm">{getFlag(rfq.buyer?.country || 'USA')}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter">{rfq.buyer?.country || 'United States'}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">{rfq.buyer?.type || 'Institution'}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-8">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black tabular-nums">{rfq.engagement?.views || 0}</span>
                          <Eye className="h-3 w-3 text-muted-foreground opacity-30" />
                       </div>
                       <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wide opacity-40">Visibility</span>
                    </div>
                    <div className="flex flex-col gap-1 border-l pl-8 border-muted">
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black tabular-nums text-primary">{rfq.engagement?.quotes_received || 0}</span>
                          <MessageSquare className="h-3 w-3 text-primary opacity-30" />
                       </div>
                       <span className="text-[7px] font-black text-primary uppercase tracking-wide opacity-40">Bids Received</span>
                    </div>
                 </div>
              </TableCell>
              <TableCell className="text-right pr-10">
                <Badge variant="outline" className={cn(
                  "font-black text-[9px] px-3 py-1 border-2 rounded-full uppercase tracking-widest",
                  statusColors[rfq.status] || "bg-muted"
                )}>
                  {rfq.status.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
