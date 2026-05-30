
'use client';

import { useEffect, useState } from 'react';
import { slaEngine, SLAMonitor } from '@/services/sla-engine';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * @file governance/sla/page.tsx
 * @description Strategic SLA and Reliability monitor for jurisdictional trade commitments.
 */

export default function SLAMonitoringPage() {
  const [monitors, setMonitors] = useState<SLAMonitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    slaEngine.getActiveMonitors().then(setMonitors).finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Commitment ID', accessorKey: 'id', className: 'font-mono text-[10px]' },
    { header: 'Entity', accessorKey: 'entityId', className: 'font-bold' },
    { 
      header: 'Commitment Type', 
      accessorKey: 'commitmentType',
      cell: (row: SLAMonitor) => <span className="uppercase text-[10px] font-black">{row.commitmentType}</span>
    },
    { 
      header: 'Deadline', 
      accessorKey: 'deadline',
      cell: (row: SLAMonitor) => <span className="font-medium">{format(new Date(row.deadline), "MMM d, HH:mm")}</span>
    },
    { 
      header: 'Integrity State', 
      accessorKey: 'breached',
      cell: (row: SLAMonitor) => (
        <Badge variant={row.breached ? 'destructive' : 'success'} className="uppercase text-[8px] font-black">
          {row.breached ? 'BREACHED' : 'OPTIMAL'}
        </Badge>
      )
    }
  ];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Reliability Layer</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">SLA Monitoring Hub</h2>
          <p className="text-muted-foreground font-medium italic">Autonomous oversight of cross-border execution finality and operational reliability commitments.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-emerald-700 border-emerald-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              SLA Compliance: 99.98%
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card className="shadow-lg border-2 border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Monitors</CardTitle>
               <Timer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black">{monitors.length}</div></CardContent>
         </Card>
         <Card className="shadow-lg border-2 border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Systemic Breaches</CardTitle>
               <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black">{monitors.filter(m => m.breached).length}</div></CardContent>
         </Card>
         <Card className="shadow-lg border-2 border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Decision Latency</CardTitle>
               <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black">140ms</div></CardContent>
         </Card>
      </div>

      <DataTable 
        columns={columns as any}
        data={monitors}
        emptyMessage="Zero active SLA breaches detected in the current cycle."
        className="rounded-2xl border-2 shadow-2xl"
      />
    </main>
  );
}
