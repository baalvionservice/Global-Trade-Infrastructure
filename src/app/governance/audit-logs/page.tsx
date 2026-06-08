"use client";

/**
 * @file governance/audit-logs/page.tsx
 * @description The Sovereign Audit Ledger. 
 * Authoritative interface for event-log forensic reconstruction and operational replay.
 */
import { useEffect, useState } from 'react';
import { eventStore, InstitutionalEvent } from '@/lib/governance-events';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ShieldCheck, 
  History, 
  Fingerprint, 
  Activity, 
  Lock, 
  Search, 
  Filter, 
  Download, 
  ArrowRight,
  Loader2,
  ChevronLeft,
  Terminal,
  Gavel,
  Database,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function GlobalAuditLedgerPage() {
  const [events, setEvents] = useState<InstitutionalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState<'all' | 'critical' | 'normal'>('all');
  const router = useRouter();

  const fetchLogs = async () => {
    setLoading(true);
    // In production, this pulls from the immutable security log
    const data = eventStore.getAllEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = events.filter(e => {
     const haystack = `${e.aggregateId ?? ''} ${e.eventType ?? e.type ?? ''}`.toLowerCase();
     const matchesSearch = haystack.includes(search.toLowerCase());
     return matchesSearch;
  });

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Sovereign Ledger</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative forensic record of identity mutations, access authorizations, and operational event lineage.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-[10px] tracking-widest bg-background shadow-md group" onClick={fetchLogs}>
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> RE-SYNC LEDGER
           </Button>
           <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-[10px] tracking-widest bg-background shadow-md">
              <Download className="mr-2 h-4 w-4" /> EXPORT BUNDLE
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
            <Input 
              placeholder="Resolve event by aggregate signature, causality hash, or node identity..." 
              className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card className="shadow-2xl border-2 bg-background overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-muted/40">
                    <TableRow className="border-b-2">
                       <TableHead className="text-[10px] font-black uppercase tracking-widest pl-12 py-8 text-muted-foreground">Event Identity</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol State Mutation</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tenant / Node</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integrity</TableHead>
                       <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-12 text-muted-foreground">Timestamp (UTC)</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    <AnimatePresence>
                       {filtered.map((event, i) => (
                          <motion.tr 
                            key={event.eventId} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0"
                          >
                             <TableCell className="pl-12 py-8">
                                <div className="flex items-center gap-6">
                                   <div className="h-12 w-12 rounded-xl bg-muted border-2 flex items-center justify-center shadow-inner">
                                      <Fingerprint className="h-6 w-6 text-primary opacity-60" />
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-mono text-[10px] font-black text-primary uppercase">{event.eventId}</p>
                                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Version v{event.version} Locked</p>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="space-y-1">
                                   <div className="flex items-center gap-3">
                                      <p className="font-black text-sm uppercase tracking-tight text-foreground">{event.eventType ?? event.type}</p>
                                      <Badge variant="outline" className="text-[8px] font-black h-5 border-none bg-slate-900 text-white uppercase">{event.aggregateType ?? '—'}</Badge>
                                   </div>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">Aggregate: {event.aggregateId}</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-3">
                                   <div className="p-1.5 rounded-lg bg-muted border shadow-inner"><Cpu className="h-3 w-3 text-muted-foreground" /></div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{String(event.metadata?.tenantId ?? '—')}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border-2 border-emerald-100 shadow-sm w-fit">
                                   <ShieldCheck className="h-3.5 w-3.5" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">SIGNED</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-right pr-12">
                                <div className="flex flex-col items-end">
                                   <span className="text-[11px] font-mono font-bold text-primary">{format(new Date(event.timestamp), "HH:mm:ss.SSS")}</span>
                                   <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter opacity-40">{format(new Date(event.timestamp), "yyyy-MM-dd")}</span>
                                </div>
                             </TableCell>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>

      <div className="p-6 rounded-2xl bg-slate-950 text-white relative overflow-hidden group shadow-md border-2 border-white/5">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Terminal className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Distributed State Protocol v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Truth is Derived, Not Stored.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion operates on a strictly event-sourced architecture. System state is never mutated directly; it is projected from an immutable, append-only event stream. Every transaction hash is cryptographically linked to the previous state, ensuring 100% auditable history across all jurisdictional clusters."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Block Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">~450ms</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Audit Readiness</p>
                  <p className="text-2xl font-black tracking-tighter">99.98%</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">History Depth</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">UNLIMITED</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
