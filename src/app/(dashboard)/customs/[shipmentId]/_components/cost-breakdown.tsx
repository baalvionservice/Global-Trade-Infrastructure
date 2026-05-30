'use client';

import { CustomsData } from "@/services/customs-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function CostBreakdown({ data }: { data: CustomsData }) {
  const total = data.importDuty + data.tax;

  return (
    <Card className="shadow-none border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase tracking-widest">Duties & Taxes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
           <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <Percent className="h-4 w-4" />
                 <span>Import Duty</span>
              </div>
              <span className="font-bold">{data.currency} {data.importDuty.toLocaleString()}</span>
           </div>
           <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <DollarSign className="h-4 w-4" />
                 <span>Regional Taxes (VAT/GST)</span>
              </div>
              <span className="font-bold">{data.currency} {data.tax.toLocaleString()}</span>
           </div>
           <Separator />
           <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest">Total Payable</span>
              <span className="text-xl font-black text-primary">{data.currency} {total.toLocaleString()}</span>
           </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg border border-dashed flex gap-2">
           <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
           <p className="text-[10px] text-muted-foreground leading-relaxed">
              These are estimates based on HTS code classification. Final amounts are determined by destination customs following physical inspection or document audit.
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
