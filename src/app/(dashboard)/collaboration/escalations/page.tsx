'use client';

/**
 * @file collaboration/escalations/page.tsx
 * @description The Sovereign Escalation Command Center.
 * High-authority coordination node for resolving critical operational failures.
 */

import { useEffect, useState } from 'react';
import { escalationService, EscalationCase } from '@/services/escalation-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Siren, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  MessageSquare, 
  Loader2, 
  Gavel,
  History,
  Activity,
  AlertTriangle,
  Lock,
  Search,
  Filter
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function EscalationCenterPage() {
  const [cases, setCases] = useState<EscalationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    escalationService.getActiveEscalations()
      .then(setCases)
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.referenceId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div>;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Governance Escalation Hub</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Escalation Center</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative coordination of operational failures, SLA breaches, and high-priority cross-domain incidents.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-red-50 rounded-2xl border-2 border-red-100 text-xs font-black uppercase tracking-widest text-red-600 shadow-xl animate-in zoom-in duration-500">
              <Siren className="h-4 w-4 animate-pulse" />
              Incident Mode: ACTIVE
           </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input 
                placeholder="Search by Case ID, Entity Signature, or Category..." 
                className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-14 border-2 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-md bg-background">
              <Filter className="mr-2 h-4 w-4" /> ALL SEVERITIES
           </Button>
        </div>

        <Card className="shadow-2xl border-2 bg-background overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
           <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-xl font-black uppercase tracking-wide">Critical Incident Queue</CardTitle>
                 <CardDescription className="text-xs font-medium mt-2">Active escalations requiring human-in-the-loop adjudication.</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-black border-2 h-6 uppercase px-4 rounded-full bg-background shadow-sm">{cases.length} ACTIVE CASES</Badge>
           </CardHeader>
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-muted/40">
                    <TableRow className="border-b-2">
                       <TableHead className="text-[10px] font-black uppercase tracking-widest pl-12 py-6">Case Identity</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest">Escalation Context</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest">SLA Deadline</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest">Workflow State</TableHead>
                       <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-12">Adjudication</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    <AnimatePresence>
                       {filtered.map((c, i) => (
                          <motion.tr 
                            key={c.id} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-red-500/[0.01] transition-colors border-b last:border-0 cursor-pointer"
                          >
                             <TableCell className="pl-12 py-6">
                                <div className="space-y-1">
                                   <p className="font-mono text-[11px] font-black text-primary uppercase">{c.id}</p>
                                   <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-tighter">NODE: WAR_ROOM_A</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="space-y-2 max-w-[400px]">
                                   <div className="flex items-center gap-3">
                                      <p className="font-black text-base uppercase tracking-tight truncate text-foreground">{c.title}</p>
                                      <Badge className="bg-red-600 text-white text-[8px] font-black uppercase h-5 border-none shadow-lg">{c.category}</Badge>
                                   </div>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Linked Entity: {c.referenceId}</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex flex-col gap-1.5">
                                   <div className="flex items-center gap-2 text-red-600">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span className="text-xs font-black tabular-nums">{formatDistanceToNow(new Date(c.slaDeadline))} Left</span>
                                   </div>
                                   <Progress value={84} className="h-0.5 bg-muted w-24" />
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className="text-[9px] font-black uppercase px-3 h-6 border-2 border-red-100 text-red-700 bg-red-50 rounded-full animate-pulse shadow-sm">
                                   {c.status.replace(/_/g, ' ')}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right pr-12">
                                <Button 
                                  className="h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl rounded-2xl bg-primary hover:scale-105 transition-all"
                                  onClick={() => router.push(`/messages/${c.id}`)}
                                >
                                   ENTER WAR ROOM <ArrowRight className="ml-2 h-4 w-4" />
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
                                <ShieldCheck className="h-12 w-16" />
                             </div>
                             <p className="text-[11px] font-black uppercase tracking-widest">Zero Systemic Escalations Detected</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>

      <div className="p-6 rounded-2xl bg-slate-950 text-white relative overflow-hidden group shadow-md border-2 border-white/5">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Gavel className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Operational Resolution Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Autonomous Adjudication. <br />Finality Enforced.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion Escalation Core ensures that operational friction is never stagnant. Incident war-rooms are deterministically provisioned, bringing required institutional sign-offs into a single, high-fidelity coordination node to resolve breaches with millisecond ledger finality."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Avg. Resolution</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">4.2 Hours</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">SLA Integrity</p>
                  <p className="text-2xl font-black tracking-tighter">99.8%</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Decision Speed</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">OPTIMAL</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
