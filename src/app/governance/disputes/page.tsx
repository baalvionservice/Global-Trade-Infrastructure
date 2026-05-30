'use client';

/**
 * @file governance/disputes/page.tsx
 * @description Sovereign Adjudication Registry. 
 * Authoritative management center for trade conflicts and arbitration mandates.
 */

import { useEffect, useState } from 'react';
import { disputeService } from '@/services/dispute-service';
import { DisputeCase } from '@/types/institutional';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Gavel, 
  Scale, 
  Search, 
  Filter, 
  Loader2, 
  ArrowRight, 
  AlertTriangle,
  History,
  ShieldCheck,
  Globe,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputeRegistryPage() {
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const data = await disputeService.getDisputes();
    setDisputes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = disputes.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.referenceId.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    OPEN: "bg-orange-50 text-orange-700 border-orange-200",
    EVIDENCE_COLLECTION: "bg-blue-50 text-blue-700 border-blue-200",
    MEDIATION: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ARBITRATION: "bg-red-50 text-red-700 border-red-200 animate-pulse",
    RESOLVED: "bg-green-50 text-green-700 border-green-200",
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Adjudication Ledger...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
           <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary">
              <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Command
           </Button>
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Governance Adjudication</p>
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Dispute Registry</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative management of trade conflicts, arbitration mandates, and resolution finality.</p>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Scale className="h-4 w-4" />
              Arbiter Access: ACTIVE
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Active Cases', val: disputes.filter(d => d.status !== 'RESOLVED').length, icon: AlertTriangle, color: 'text-orange-600' },
          { label: 'Under Arbitration', val: disputes.filter(d => d.status === 'ARBITRATION').length, icon: Gavel, color: 'text-red-600' },
          { label: 'Resolution Rate', val: '92.4%', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Financial Exposure', val: '$4.2M', icon: Globe, color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background hover:border-primary/20 transition-all rounded-2xl group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tighter">{stat.val}</div>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
            <Input 
              placeholder="Search by Case ID, Reference Signature, or Participant..." 
              className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 border-2 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-md bg-background">
             <Filter className="mr-2 h-4 w-4" /> All Severities
          </Button>
        </div>

        <Card className="shadow-2xl border-2 bg-background overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-muted/40">
                    <TableRow className="border-b-2">
                       <TableHead className="text-[10px] font-black uppercase tracking-widest pl-10 py-6">Case Identity</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest">Dispute Context</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest">Severity</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest">Workflow State</TableHead>
                       <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-10">Governance</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    <AnimatePresence>
                       {filtered.map((dispute, i) => (
                          <motion.tr 
                            key={dispute.id} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-primary/[0.02] transition-colors border-b last:border-0 cursor-pointer"
                            onClick={() => router.push(`${PATHS.OVERSIGHT_DISPUTES}/${dispute.id}`)}
                          >
                             <TableCell className="pl-10 py-8">
                                <div className="space-y-1">
                                   <p className="font-mono text-[11px] font-black text-primary">{dispute.id}</p>
                                   <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-tighter">Node: GLOBAL_ADJ_01</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="space-y-1 max-w-[300px]">
                                   <p className="font-black text-sm uppercase tracking-tight truncate">{dispute.title}</p>
                                   <p className="text-[9px] text-muted-foreground uppercase font-bold">Ref: {dispute.referenceType.toUpperCase()} - {dispute.referenceId}</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className={cn(
                                   "text-[8px] font-black uppercase px-2 h-5 border-2",
                                   dispute.severity === 'critical' ? "bg-red-50 text-red-700 border-red-200" : "bg-muted"
                                )}>
                                   {dispute.severity}
                                </Badge>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-black uppercase px-3 h-6 border-2 rounded-full",
                                   statusColors[dispute.status] || "bg-muted"
                                )}>
                                   {dispute.status.replace(/_/g, ' ')}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right pr-10">
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border-2 opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all">
                                   <ArrowRight className="h-5 w-5" />
                                </Button>
                             </TableCell>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-96 text-center">
                          <div className="flex flex-col items-center gap-6 opacity-20">
                             <div className="p-6 rounded-full border-4 border-dashed border-primary/20">
                                <Gavel className="h-12 w-16" />
                             </div>
                             <p className="text-[11px] font-black uppercase tracking-widest">No active disputes detected.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>

      {/* SOVEREIGN INFRASTRUCTURE FOOTER */}
      <div className="p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden group shadow-md">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Scale className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Arbitration Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Globally Adjudicated. <br />Deterministically Settled.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion Adjudication Hub provides the authoritative legal layer for global trade. Rulings issued by neutral arbiters are cryptographically bound to the institutional ledger, triggering atomic state changes across all affected logistics and treasury nodes."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Neutral Node Sync</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">OPTIMAL</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Legal Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">SOVEREIGN</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
