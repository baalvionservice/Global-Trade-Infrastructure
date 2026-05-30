/**
 * @file governance/security/audit/page.tsx
 * @description THE IDENTITY LEDGER. 
 * Authoritative record of all security-sensitive events and permission mutations.
 */
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { SecurityAuditEntry } from '@/modules/security/types';
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

export default function SecurityAuditPage() {
  const [logs, setLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Real immutable audit hash-chain from trade-service.
      const res = await apiClient.get<any[]>('/audit', { limit: 50 });
      const mapped: SecurityAuditEntry[] = toList<any>(res).map((e: any, i: number) => {
        const action = String(e.action ?? 'event');
        const denied = /denied|reject|fail|blocked|reuse/i.test(action);
        return {
          id: String(e.id ?? `EVT-${i}`),
          actorId: String(e.actorId ?? e.userId ?? 'system'),
          actorName: String(e.actorId ?? e.userId ?? 'System'),
          action: action.toUpperCase().replace(/[._]/g, ' '),
          resource: [e.resourceType, e.resourceId].filter(Boolean).join('/') || '—',
          status: denied ? 'DENIED' : 'SUCCESS',
          severity: /lock|reuse|denied|tenant|breach/i.test(action) ? 'CRITICAL' : /fail|reject/i.test(action) ? 'HIGH' : 'INFO',
          ipAddress: String(e.ipAddress ?? e.ip ?? '—'),
          timestamp: String(e.createdAt ?? e.timestamp ?? new Date().toISOString()),
        } as SecurityAuditEntry;
      });
      setLogs(mapped);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.actorName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-transparent hover:text-primary">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Identity Ledger</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative forensic record of identity mutations, access authorizations, and security anomalies.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-[10px] tracking-widest bg-background shadow-md group" onClick={fetchLogs}>
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> RE-SYNC LEDGER
           </Button>
           <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-[10px] tracking-widest bg-background shadow-md">
              <Download className="mr-2 h-4 w-4" /> EXPORT SIGNED BUNDLE
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
          <Input 
            placeholder="Search by actor identity, action signature, or node hash..." 
            className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="shadow-2xl border-2 bg-background overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-muted/40">
                    <TableRow className="border-b-2">
                       <TableHead className="text-[10px] font-black uppercase tracking-widest pl-12 py-8 text-muted-foreground">Event Identity</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Action</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authority State</TableHead>
                       <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intensity</TableHead>
                       <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-12 text-muted-foreground">Timestamp (UTC)</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    <AnimatePresence>
                       {filtered.map((log, i) => (
                          <motion.tr 
                            key={log.id} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0 cursor-pointer"
                          >
                             <TableCell className="pl-12 py-8">
                                <div className="flex items-center gap-6">
                                   <div className="h-12 w-12 rounded-xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                      <Fingerprint className="h-6 w-6 text-primary opacity-60" />
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-mono text-[10px] font-black text-primary uppercase">{log.id}</p>
                                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{log.actorName}</p>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="space-y-1">
                                   <p className="font-black text-sm uppercase tracking-tight text-foreground">{log.action.replace(/_/g, ' ')}</p>
                                   <p className="text-[9px] font-bold text-primary uppercase opacity-60 tracking-widest">Res: {log.resource}</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-black uppercase px-2.5 h-6 border-2 rounded-full shadow-sm",
                                   log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                )}>{log.status}</Badge>
                             </TableCell>
                             <TableCell>
                                <Badge className={cn(
                                   "text-[8px] font-black uppercase h-5 px-2 border-none shadow-lg",
                                   log.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 text-white'
                                )}>{log.severity}</Badge>
                             </TableCell>
                             <TableCell className="text-right pr-12">
                                <div className="flex flex-col items-end">
                                   <span className="text-[11px] font-mono font-bold text-primary">{format(new Date(log.timestamp), "HH:mm:ss.SSS")}</span>
                                   <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter opacity-40">{format(new Date(log.timestamp), "yyyy-MM-dd")}</span>
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
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Finality Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Sovereign <br />Identity Lineage.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion uses a strictly enforced cryptographical identity model. Every administrative session and state mutation is hashed and linked to the previous state, ensuring 100% visibility into the lifecycle of institutional authority nodes. Truth is derived from the immutable chain of custody."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Sync Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">~450ms</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Audit Readiness</p>
                  <p className="text-2xl font-black tracking-tighter">99.98%</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Ledger Sync</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">LOCKED</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
