/**
 * @file page.tsx
 * @description Global Institutional Registry & Hierarchy Management Command.
 * Authoritative node for governing the platform's multi-tenant organization graph.
 */
'use client';

import { useEffect, useState } from 'react';
import { platformGovernance } from '@/modules/platform/services/platform-governance.service';
import { SovereignTenant } from '@/modules/platform/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRight, 
  Loader2, 
  ChevronLeft,
  Globe,
  ShieldCheck,
  Building,
  Activity,
  History,
  Lock,
  Plus,
  Network,
  Share2
} from 'lucide-react';
import { cn, getFlag } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function GlobalOrganizationRegistryPage() {
  const [organizations, setOrganizations] = useState<SovereignTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    platformGovernance.getTenants().then(setOrganizations).finally(() => setLoading(false));
  }, []);

  const filtered = organizations.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Registry Link...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: ORG_GRAPH_MASTER</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Global <br />Registry.</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 font-black uppercase text-xs tracking-widest hover:bg-white/10">
              <Share2 className="mr-3 h-4 w-4" /> Map Subsidiaries
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Plus className="mr-3 h-5 w-5" /> Provision Institution
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* HIERARCHY OBSERVATORY */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 opacity-40" />
                <Input 
                  placeholder="Resolve Organization Identity, Tax ID, or Node Hash..." 
                  className="pl-16 h-12 bg-white/5 border-white/10 rounded-3xl text-lg font-black uppercase tracking-tight shadow-inner text-white placeholder:text-slate-700 focus-visible:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
           </div>

           <Card className="shadow-none border-none bg-slate-900/50 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-white/5">
                       <TableRow className="border-b-2 border-white/5">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest pl-12 py-8 text-slate-500">Institutional Identity</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jurisdiction</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Status</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sync Health</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-12 text-slate-500">Action</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    <AnimatePresence>
                       {filtered.map((org, i) => (
                          <motion.tr 
                            key={org.id} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                          >
                             <TableCell className="pl-12 py-6">
                                <div className="flex items-center gap-8">
                                   <div className="h-14 w-14 rounded-xl border-2 border-white/10 bg-slate-950 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                      <Building className="h-7 w-7 text-primary opacity-60" />
                                   </div>
                                   <div className="space-y-1.5">
                                      <p className="font-black text-xl uppercase tracking-tighter text-white leading-none">{org.name}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {org.id} • Lvl 4 Verification</p>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-3">
                                   <span className="text-2xl filter drop-shadow-sm">{getFlag(org.region)}</span>
                                   <span className="text-xs font-black uppercase tracking-tight text-slate-300">{org.region}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-black h-6 px-3 rounded-full uppercase tracking-tighter border-2",
                                   (org as any).status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                )}>{(org as any).status}</Badge>
                             </TableCell>
                             <TableCell>
                                <div className="flex flex-col gap-2">
                                   <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400 uppercase tabular-nums">
                                      <span>Optimal</span>
                                      <span>{org.uptime}%</span>
                                   </div>
                                   <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: `${org.uptime}%` }} />
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell className="text-right pr-12">
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                   <ArrowRight className="h-6 w-6 text-white" />
                                </Button>
                             </TableCell>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-6">
         <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
               <Network className="h-80 w-80 brightness-0 invert" />
            </div>
            <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                  <Activity className="h-6 w-6 text-yellow-400 animate-pulse" />
                  Ecosystem Topology
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative space-y-8">
               <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                  "Registry Pulse: 14,240 cross-jurisdictional nodes resolved. Identity coherence has reached Tier-1 threshold. Suggest protocol lock for the Zurich cluster."
               </p>
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Graph Edges</span>
                     <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">42.4k</span>
                  </div>
                  <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Symmetry</span>
                     <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">100%</span>
                  </div>
               </div>
               <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                  VIEW RELATIONSHIP MESH
               </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  </main>
  );
}
