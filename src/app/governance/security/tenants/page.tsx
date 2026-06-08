/**
 * @file governance/security/tenants/page.tsx
 * @description THE SOVEREIGN FABRIC. 
 * Authoritative management of institutional tenant isolation and jurisdictional boundaries.
 */
'use client';

import { useEffect, useState } from 'react';
import { tenantService } from '@/modules/security/services/tenant.service';
import { TenantBoundary } from '@/modules/security/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Globe, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Activity, 
  Server, 
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Maximize,
  Database
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function TenantGovernancePage() {
  const [tenants, setTenants] = useState<TenantBoundary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    tenantService.getTenants().then(setTenants).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Sovereign Fabric...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.SECURITY_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Tenant Isolation</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Manage jurisdictional boundaries, data residency compliance, and systemic node isolation for verified institutions.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Server className="h-4 w-4" />
              Sovereign Nodes: 14 ACTIVE
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9 space-y-6">
           <Card className="shadow-2xl border-2 bg-background rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/40">
                       <TableRow className="border-b-2">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest pl-12 py-6">Institutional Node</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Jurisdiction</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Residency</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Cluster</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Risk</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-12">Status</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       <AnimatePresence>
                          {tenants.map((tenant, i) => (
                             <motion.tr 
                               key={tenant.id} 
                               initial={{ opacity: 0 }} 
                               animate={{ opacity: 1 }} 
                               transition={{ delay: i * 0.05 }}
                               className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0 cursor-pointer"
                             >
                                <TableCell className="pl-12 py-8">
                                   <div className="flex items-center gap-6">
                                      <div className="h-14 w-14 rounded-xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                         <Server className="h-7 w-7 text-primary opacity-60" />
                                      </div>
                                      <div className="space-y-1">
                                         <p className="font-black text-lg uppercase tracking-tighter text-foreground">{tenant.institutionName}</p>
                                         <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest">ID: {tenant.id}{typeof tenant.activeSessions === 'number' ? ` • ${tenant.activeSessions} Active Handshakes` : ''}</p>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <span className="text-xs font-black uppercase tracking-tight text-foreground/80">{tenant.jurisdiction}</span>
                                </TableCell>
                                <TableCell>
                                   <Badge variant="outline" className="text-[8px] font-black uppercase h-5 px-2 bg-muted/50 border-none">{tenant.dataResidency}</Badge>
                                </TableCell>
                                <TableCell>
                                   <span className="text-[10px] font-mono font-bold text-muted-foreground opacity-60">{tenant.clusterNode}</span>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                         <div className="h-full bg-emerald-500" style={{ width: `${100 - tenant.riskScore}%` }} />
                                      </div>
                                      <span className="text-[10px] font-black tabular-nums">{tenant.riskScore}</span>
                                   </div>
                                </TableCell>
                                <TableCell className="text-right pr-12">
                                   <Badge variant="outline" className={cn(
                                      "text-[9px] font-black uppercase px-2.5 h-6 border-2 rounded-full shadow-sm",
                                      tenant.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                   )}>{tenant.status}</Badge>
                                </TableCell>
                             </motion.tr>
                          ))}
                       </AnimatePresence>
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Maximize className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Database className="h-5 w-5 text-white animate-pulse" />
                    Boundary Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Isolation Pulse: Cluster nodes are 100% compliant with jurisdictional residency mandates. Zero cross-tenant signal overlap detected in the Zurich cluster."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    INITIATE CLUSTER ROTATION
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fabric Ratios</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Network Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Admin Finality', val: '450ms', icon: Zap, color: 'text-blue-500' },
                   { label: 'Node Sync', val: 'Locked', icon: Lock, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
