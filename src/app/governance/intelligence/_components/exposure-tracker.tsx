
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Landmark, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const exposureData = [
  { corridor: 'APAC-US', exposure: 420000000, risk: 'Low' },
  { corridor: 'EU-INDIA', exposure: 215000000, risk: 'Medium' },
  { corridor: 'US-GCC', exposure: 120000000, risk: 'Low' },
  { corridor: 'ASIA-AFRICA', exposure: 84000000, risk: 'High' },
];

export function ExposureTracker() {
  return (
    <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
      <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Exposure Ledger</CardTitle>
        </div>
        <Landmark className="h-6 w-6 text-primary opacity-30" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="h-[250px] w-full">
            <ChartContainer config={{ exp: { label: "Exposure", color: "hsl(var(--primary))" } }}>
              <BarChart data={exposureData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="corridor" tickLine={false} axisLine={false} className="text-[9px] font-black uppercase" />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="exposure" radius={[8, 8, 0, 0]}>
                   {exposureData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.risk === 'High' ? '#ef4444' : 'hsl(var(--primary))'} fillOpacity={0.8} />
                   ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Aggregated Corridor Stress</h4>
            <div className="grid gap-4">
              {exposureData.map((item) => (
                <div key={item.corridor} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5 group hover:border-primary/20 transition-all cursor-default">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-tight">{item.corridor}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Exposure Risk: {item.risk}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black tracking-tighter">{formatCurrency(item.exposure)}</p>
                    <div className="flex items-center justify-end gap-1 text-[8px] font-black text-emerald-600">
                      <ArrowUpRight className="h-2 w-2" /> +4.2%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
