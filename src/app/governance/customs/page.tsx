/**
 * @file customs/page.tsx
 * @description THE NATIONAL CUSTOMS COMMAND HUB.
 * High-authority strategic command for jurisdictional trade finality.
 */
'use client';

import { useEffect, useState } from 'react';
import { customsService } from '@/services/customs-service';
import { useRegulatoryStore } from '@/modules/regulatory/store/regulatory.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Scale, 
  FileCheck, 
  Globe, 
  AlertTriangle, 
  Search, 
  ArrowRight,
  Loader2,
  Lock,
  Gavel,
  History,
  Activity,
  Zap,
  Filter,
  MoreVertical,
  Radio
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CustomsCommandHub() {
  const { entries, pulse, setEntries, setPulse, isLoading, setLoading } = useRegulatoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const [eData, pData] = await Promise.all([
      customsService.getCustomsEntries(),
      customsService.getCustomsPulse()
    ]);
    setEntries(eData);
    setPulse(pData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = entries.filter(e => 
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !pulse) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const kpis = [
    { label: 'Active Declarations', val: pulse?.activeDeclarations, icon: FileCheck, color: 'text-blue-600' },
    { label: 'Clearance Velocity', val: pulse?.clearanceVelocity, icon: Zap, color: 'text-emerald-600' },
    { label: 'Regulatory Flags', val: entries.filter(e => e.status === 'HOLD').length, icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Integrity Index', val: `${pulse?.complianceIntegrityScore}%`, icon: ShieldCheck, color: 'text-indigo-600' },
  ];

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Jurisdictional Gatekeeper</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Customs Command.</h2>
          <p className="text-muted-foreground font-medium italic">Authoritative oversight of national trade rules, tariff audits, and regulatory finality.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> REVISION HISTORY
           </Button>
           <div className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-700 shadow-sm animate-in zoom-in duration-500">
              <Scale className="h-4 w-4" />
              State: ENFORCING
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {kpis.map((stat, i) => (
          <Card key={stat.label} className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
             </CardHeader>
             <CardContent className="px-8 pb-8">
                <div className="text-3xl font-black tracking-tighter tabular-nums">{stat.val}</div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
         <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <CardTitle className="text-xl font-black uppercase tracking-tighter">Jurisdictional Clearance Ledger</CardTitle>
               <CardDescription className="text-xs font-medium">Authoritative record of jurisdictional audits and state transitions.</CardDescription>
            </div>
            <div className="flex gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                  <input 
                    placeholder="Resolve Entry ID..." 
                    className="h-10 w-64 bg-background border-2 rounded-xl pl-9 pr-4 text-[10px] font-bold uppercase focus:outline-none focus:border-primary/40 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button variant="outline" size="sm" className="h-10 rounded-xl border-2 font-black uppercase text-[9px]">
                  <Filter className="mr-2 h-4 w-4" /> Filter Pipeline
               </Button>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/30 border-b-2">
                     <tr>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Identity</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Corridor</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classification</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duties (EST)</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">State</th>
                        <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Finalize</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2">
                     {filtered.map((entry) => (
                        <tr key={entry.id} className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0 cursor-pointer" onClick={() => router.push(`/governance/customs/${entry.id}`)}>
                           <td className="p-8">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"><FileCheck className="h-5 w-5 text-primary opacity-60" /></div>
                                 <div className="space-y-0.5">
                                    <p className="font-black text-sm uppercase tracking-tight">{entry.id}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Shipment: {entry.shipmentId}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-black uppercase tracking-tight">{entry.originCountry}</span>
                                 <ArrowRight className="h-2 w-2 text-muted-foreground opacity-30" />
                                 <span className="text-xs font-black uppercase tracking-tight">{entry.destinationCountry}</span>
                              </div>
                           </td>
                           <td className="p-8">
                              <span className="font-mono text-xs font-bold text-muted-foreground">{entry.htsCode || 'UNCLASSIFIED'}</span>
                           </td>
                           <td className="p-8">
                              <span className="font-black text-sm tabular-nums">{formatCurrency(entry.dutiesCalculated + entry.taxesCalculated, entry.currency)}</span>
                           </td>
                           <td className="p-8">
                              <Badge variant="outline" className={cn(
                                 "text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full",
                                 entry.status === 'CLEARED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                 entry.status === 'HOLD' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-muted'
                              )}>{entry.status}</Badge>
                           </td>
                           <td className="p-8 text-right">
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-20 group-hover:opacity-100 transition-opacity">
                                 <MoreVertical className="h-5 w-5" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </main>
  );
}
