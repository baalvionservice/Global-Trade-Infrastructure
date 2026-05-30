"use client";

/**
 * @file business-units/page.tsx
 * @description Institutional Hierarchy & Business Unit Orchestration.
 */
import { useEffect, useState } from 'react';
import { organizationService } from '@/modules/administration/services/organization.service';
import { OrgUnit } from '@/modules/administration/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Zap } from 'lucide-react';
import { 
  Network, 
  Building, 
  Landmark, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Search, 
  ChevronRight,
  MoreVertical,
  ChevronLeft,
  MapPin,
  Activity,
  History,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessUnitRegistryPage() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    organizationService.getHierarchy('COMP-101')
      .then(setUnits)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Organizational Graph...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.OVERSIGHT_PLATFORM_ADMIN)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Organizational Units</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Manage the multi-tenant hierarchy, regional hubs, and operational divisions of the enterprise node.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> CHANGE LOG
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> PROVISION UNIT
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* HIERARCHY TREE VIEW */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid gap-6">
              <AnimatePresence>
                 {units.map((unit, i) => (
                    <motion.div 
                      key={unit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                       <Card className="shadow-lg border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                          <CardContent className="p-0 flex items-stretch">
                             <div className={cn(
                                "w-2 shrink-0 transition-colors duration-500",
                                unit.status === 'active' ? "bg-emerald-500" : "bg-red-500"
                             )} />
                             <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-8 flex-1 min-w-0">
                                   <div className="h-12 w-16 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                      {(unit.type as any) === 'HEADQUARTERS' ? <Landmark className="h-7 w-7 text-primary opacity-60" /> : <Building className="h-7 w-7 text-primary opacity-60" />}
                                   </div>
                                   <div className="space-y-1.5 min-w-0">
                                      <div className="flex items-center gap-4">
                                         <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground truncate group-hover:text-primary transition-colors">{unit.name}</h3>
                                         <Badge className="bg-slate-900 text-white text-[8px] font-black uppercase h-5 px-2 border-none shadow-sm">{unit.type}</Badge>
                                      </div>
                                      <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                         <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {unit.region} Node</span>
                                         <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {unit.headcount.toLocaleString()} Active</span>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="flex items-center gap-6 shrink-0">
                                   <div className="text-right space-y-1">
                                      <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Authority Node</p>
                                      <p className="text-xs font-black uppercase">{unit.managerId}</p>
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                      <ArrowRight className="h-5 w-5" />
                                   </Button>
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

        {/* SIDEBAR: GOVERNANCE INTEL */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Network className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Structure Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Ecosystem Mapping: Structural redundancy detected between the US-East logistics cluster and the NYC regional hub. Recommend autonomous node merging to reduce intra-unit latency by 14%."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE STRUCTURE MERGE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hierarchy Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Network Coherence', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Admin Finality', val: '450ms', icon: Database, color: 'text-blue-500' },
                   { label: 'Unit Availability', val: '100%', icon: Activity, color: 'text-indigo-500' }
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
