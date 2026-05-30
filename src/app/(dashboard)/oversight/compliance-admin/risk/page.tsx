/**
 * @file RiskDashboardPage
 * @description The updated Risk & Compliance dashboard reflecting advanced fraud signals.
 */
'use client';

import { useEffect, useState } from 'react';
import { 
  getRiskOverview, 
  getHighRiskUsers, 
  getAdminDisputes, 
  getRiskAlerts,
  RiskOverview,
  RiskUser,
  AdminDispute,
  RiskAlert 
} from '@/services/admin-risk-service';
import { RiskKpiCards } from './_components/risk-kpi-cards';
import { RiskDistributionChart, TransactionTrendChart } from './_components/risk-charts';
import { AlertFeed } from './_components/alert-feed';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, Eye, ShieldAlert, Gavel, ExternalLink, Activity, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function RiskDashboardPage() {
  const [overview, setOverview] = useState<RiskOverview | null>(null);
  const [users, setUsers] = useState<RiskUser[]>([]);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRiskOverview(),
      getHighRiskUsers(),
      getAdminDisputes(),
      getRiskAlerts()
    ]).then(([ov, us, ds, al]) => {
      setOverview(ov);
      setUsers(us);
      setDisputes(ds);
      setAlerts(al);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !overview) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Risk Intelligence Center</h2>
          <p className="text-muted-foreground font-medium">Monitoring platform integrity via autonomous fraud signals and sanctions screening.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border shadow-sm">
           <ShieldCheck className="h-5 w-5 text-green-600" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase leading-none">Security Core</span>
              <span className="text-sm font-black uppercase">Fraud Engine: Active</span>
           </div>
        </div>
      </div>

      <RiskKpiCards data={overview} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
              <RiskDistributionChart data={overview.riskDistribution} />
              <TransactionTrendChart data={overview.transactionTrend} />
           </div>

           <Card className="shadow-none border bg-background">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 py-5 px-6">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Active Governance Disputes</CardTitle>
                  <CardDescription className="text-xs">Trade finalizations currently under manual arbiter review.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary">View Queue</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/30">
                       <TableRow>
                          <TableHead className="text-[10px] font-black uppercase pl-6">Reference</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Contract Value</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-right pr-6">Status</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {disputes.length === 0 ? (
                         <TableRow><TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic">No active disputes detected.</TableCell></TableRow>
                       ) : (
                         disputes.map((dispute) => (
                           <TableRow key={dispute.id} className="hover:bg-muted/10 group">
                              <TableCell className="pl-6">
                                 <div className="flex flex-col">
                                    <span className="font-mono text-[11px] font-bold text-primary">{dispute.id}</span>
                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">Order: {dispute.orderId}</span>
                                 </div>
                              </TableCell>
                              <TableCell className="text-sm font-black text-foreground">${dispute.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-right pr-6">
                                 <Badge variant="outline" className={cn(
                                   "uppercase text-[9px] font-black border-2",
                                   dispute.status === 'open' ? "text-orange-600 border-orange-200 bg-orange-50" : "text-green-600 border-green-200 bg-green-50"
                                 )}>
                                   {dispute.status}
                                 </Badge>
                              </TableCell>
                           </TableRow>
                         ))
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <AlertFeed alerts={alerts} />
           
           <Card className="shadow-none border overflow-hidden">
              <CardHeader className="bg-red-50 border-b border-red-100">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-red-800 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    High-Risk Entity Monitor
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                 {users.map((user) => (
                    <div key={user.id} className="p-4 rounded-xl border-2 border-red-100 bg-card space-y-4 shadow-sm">
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-sm font-black uppercase tracking-tight">{user.companyName}</p>
                             <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">ID: {user.id} • Score: {user.riskScore}</p>
                          </div>
                          <Badge className="bg-red-600 text-white uppercase text-[8px] font-black h-5 border-none">FLAGGED</Badge>
                       </div>
                       <div className="p-2.5 rounded bg-muted/30 border border-dashed flex gap-2">
                          <Info className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">"{user.recentActivity}"</p>
                       </div>
                       <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-[9px] font-black uppercase border-2 text-red-600 border-red-100">
                            <ShieldAlert className="mr-1.5 h-3 w-3" /> RESTRICT
                          </Button>
                          <Button size="sm" className="flex-1 h-8 text-[9px] font-black uppercase shadow-sm">
                            <Activity className="mr-1.5 h-3 w-3" /> AUDIT
                          </Button>
                       </div>
                    </div>
                 ))}
                 {users.length === 0 && <p className="text-center text-xs text-muted-foreground italic py-8">All institutional profiles verified.</p>}
              </CardContent>
           </Card>

           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden">
              <CardContent className="p-8 space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-wide opacity-80">Autonomous Policy Control</h4>
                 <p className="text-sm font-bold italic leading-relaxed opacity-90">
                    "The platform fraud engine is currently checking 48 active nodes. Zero critical failures detected."
                 </p>
                 <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[88%] animate-pulse" />
                 </div>
                 <Button variant="secondary" className="w-full h-12 text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Configure Guardrails
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
