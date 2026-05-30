'use client';

import { Deal } from '@/services/deal-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Box, Globe, Info, Activity, History } from 'lucide-react';
import { format } from 'date-fns';

export function SummaryPanel({ deal }: { deal: Deal }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Agreement Progress</h3>
        <Card className="shadow-none border bg-muted/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-xs text-muted-foreground">Current Price</span>
               <span className="text-lg font-bold text-primary">${deal.currentPrice}</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-xs text-muted-foreground">Agreed Quantity</span>
               <span className="text-sm font-semibold">{deal.currentQuantity.toLocaleString()} Units</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-xs text-muted-foreground">Total Value</span>
               <span className="text-sm font-bold">${(deal.currentPrice * deal.currentQuantity).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Trade Context</h3>
        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
             <Box className="h-4 w-4 text-primary shrink-0" />
             <div>
                <p className="font-semibold">{deal.productName}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{deal.rfqId}</p>
             </div>
          </div>
          <div className="flex gap-3">
             <Activity className="h-4 w-4 text-primary shrink-0" />
             <div>
                <p className="font-semibold">{deal.status.toUpperCase()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Current Room Status</p>
             </div>
          </div>
          <div className="flex gap-3">
             <History className="h-4 w-4 text-primary shrink-0" />
             <div>
                <p className="font-semibold">{format(new Date(deal.updatedAt ?? Date.now()), "MMM d, HH:mm")}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Last Activity</p>
             </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Participants</h3>
        <div className="space-y-3">
           <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border">
              <span className="text-xs font-bold text-muted-foreground uppercase">Buyer</span>
              <span className="text-xs font-semibold">{deal.buyerName}</span>
           </div>
           <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border">
              <span className="text-xs font-bold text-muted-foreground uppercase">Seller</span>
              <span className="text-xs font-semibold">{deal.sellerName}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
