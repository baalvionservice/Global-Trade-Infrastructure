
/**
 * @file bank-admin/page.tsx
 * @description Banker's Workbench for institutional finance oversight.
 */
'use client';

import { useEffect, useState } from 'react';
import { tradeFinanceService } from '@/services/trade-finance-service';
import { treasuryService } from '@/services/treasury-service';
import { adminService, FinancialStats } from '@/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Landmark, 
  Lock, 
  Activity, 
  ShieldCheck, 
  Loader2, 
  Zap, 
  ArrowUpRight, 
  FileText, 
  TrendingUp,
  Banknote,
  Globe,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

export default function BankersWorkbenchPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [instruments, setInstruments] = useState<any>({ lettersOfCredit: [], invoiceFinancing: [] });
  const [liquidity, setLiquidity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    const [s, inst, liq] = await Promise.all([
      (adminService as any).getFinancialMonitoringStats(),
      (tradeFinanceService as any).getBankInstruments('BANK-001'),
      treasuryService.getLiquidityPositions()
    ]);
    setStats(s);
    setInstruments(inst);
    setLiquidity(liq);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveLC = async (id: string) => {
    try {
      await tradeFinanceService.issueLC(id, 'BANK-001');
      toast({ title: "LC Issued", description: "Instrument cryptographically signed and broadcast to advising node." });
      fetchData();
    } catch (e) {
      toast({ variant: 'destructive', title: "Issuance Failed" });
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Banking Rails...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Service Node: FIN_INST_001</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Banker's Workbench</h2>
          <p className="text-muted-foreground font-medium italic">Institutional management of trade instruments, syndicated finance, and treasury liquidity.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 h-14 px-8 uppercase tracking-widest bg-background shadow-md">
              <Plus className="mr-2 h-4 w-4" /> NEW INSTRUMENT
           </Button>
           <div className="flex items-center gap-2 px-6 py-2.5 bg-green-50 rounded-2xl border-2 border-indigo-100 text-xs font-black uppercase tracking-widest text-green-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              SWIFT Connectivity: SECURE
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Escrow Under Management', val: stats ? formatCurrency(stats.escrowVolume || 0) : '—', icon: Landmark, color: 'text-primary' },
          { label: 'Settlement Volume', val: stats ? formatCurrency(stats.settlementVolume || 0) : '—', icon: Activity, color: 'text-emerald-600' },
          { label: 'Active LCs', val: instruments.lettersOfCredit.length, icon: FileText, color: 'text-blue-600' },
          { label: 'Outstanding Credit', val: stats ? formatCurrency(stats.outstandingCredit || 0) : '—', icon: TrendingUp, color: 'text-orange-600' },
        ].map(kpi => (
          <Card key={kpi.label} className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{kpi.label}</CardTitle>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
             </CardHeader>
             <CardContent>
                <div className="text-3xl font-black tracking-tighter">{kpi.val}</div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* TRADE INSTRUMENTS QUEUE */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Active Trade Instruments</CardTitle>
                  <CardDescription className="text-xs font-medium">Pending Letters of Credit and Documentary Collections requiring bank sign-off.</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/40">
                       <TableRow className="border-b-2">
                          <TableHead className="text-[10px] font-black uppercase pl-10 py-6">Instrument / ID</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Beneficiary</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Value</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase pr-10">Actions</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {instruments.lettersOfCredit.map((lc: any) => (
                         <TableRow key={lc.id} className="hover:bg-primary/[0.01] transition-colors border-b last:border-0">
                            <TableCell className="pl-10 py-8">
                               <div className="space-y-1">
                                  <p className="font-black text-sm uppercase tracking-tight">Letter of Credit</p>
                                  <p className="font-mono text-[10px] text-primary">{lc.lc_id}</p>
                               </div>
                            </TableCell>
                            <TableCell>
                               <p className="text-xs font-bold uppercase">{lc.sellerId || 'Verified Institutional Seller'}</p>
                               <p className="text-[9px] text-muted-foreground uppercase opacity-60">Expires: {lc.expiryDate}</p>
                            </TableCell>
                            <TableCell>
                               <span className="font-black text-sm">{formatCurrency(lc.amount, lc.currency)}</span>
                            </TableCell>
                            <TableCell className="text-right pr-10">
                               <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase border-2">REVIEW</Button>
                                  {lc.status === 'PENDING' && (
                                     <Button size="sm" className="h-8 text-[9px] font-black uppercase bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveLC(lc.id)}>ISSUE</Button>
                                  )}
                               </div>
                            </TableCell>
                         </TableRow>
                       ))}
                       {instruments.lettersOfCredit.length === 0 && (
                         <TableRow><TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic">No pending trade instruments in current cycle.</TableCell></TableRow>
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* RISK EXPOSURE OBSERVATORY */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <TrendingUp className="h-5 w-5 text-white" />
                    Market Risk Engine
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "AI Intelligence: Global exposure in the USD/CNY corridor is reaching peak thresholds. Suggest rebalancing liquidity nodes via the Singapore advisory node."
                 </p>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-sm">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Systemic Delta</span>
                       <span className="text-xl font-black text-emerald-300">+0.04%</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-sm">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Risk Sentiment</span>
                       <Badge className="bg-white text-primary text-[9px] font-black px-3 py-1 uppercase tracking-tighter border-none h-6 rounded-full">STABLE</Badge>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    REBALANCE GLOBAL LIQUIDITY
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
