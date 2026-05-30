
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, ShieldAlert, Star, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const highRiskSuppliers = [
  { id: 'GPS', name: 'Global Power Systems', country: 'India', score: 82, trend: 'stable', reason: 'Identity Drift Signal' },
  { id: 'VAP', name: 'Vietnam Auto Parts', country: 'Vietnam', score: 68, trend: 'increasing', reason: 'Repeated Delay Variance' },
  { id: 'TCH', name: 'Tech Core Hub', country: 'China', score: 54, trend: 'decreasing', reason: 'Corridor Mismatch' },
];

export function SupplierRiskList() {
  return (
    <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
      <CardHeader className="bg-muted/10 border-b py-6 px-8 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">High-Variance Node Monitor</CardTitle>
        </div>
        <Users className="h-5 w-5 text-primary opacity-30" />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
           <TableHeader className="bg-muted/30">
              <TableRow className="border-b-2">
                 <TableHead className="text-[9px] font-black uppercase tracking-widest pl-8 py-5">Node Identity</TableHead>
                 <TableHead className="text-[9px] font-black uppercase tracking-widest">Risk Score</TableHead>
                 <TableHead className="text-right text-[9px] font-black uppercase tracking-widest pr-8">Adjudication</TableHead>
              </TableRow>
           </TableHeader>
           <TableBody>
              {highRiskSuppliers.map((s) => (
                 <TableRow key={s.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="pl-8 py-6">
                       <div className="space-y-1">
                          <p className="font-black text-sm uppercase tracking-tight text-foreground">{s.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">{s.country} • {s.reason}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <span className={cn(
                             "text-lg font-black tabular-nums tracking-tighter",
                             s.score > 75 ? 'text-red-600' : 'text-orange-600'
                          )}>{s.score}</span>
                          <Activity className={cn("h-3 w-3", s.trend === 'increasing' ? 'text-red-500' : 'text-emerald-500')} />
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button size="sm" variant="outline" className="h-8 text-[8px] font-black uppercase tracking-widest border-2">AUDIT</Button>
                    </TableCell>
                 </TableRow>
              ))}
           </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
