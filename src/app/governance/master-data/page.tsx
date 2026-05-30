'use client';

/**
 * @file governance/master-data/page.tsx
 * @description Institutional Data Stewardship Command Center.
 */

import { useEffect, useState } from 'react';
import { masterDataService, CountryIntel } from '@/services/master-data-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Globe, 
  FileCheck, 
  ShieldCheck, 
  History, 
  Zap, 
  Loader2, 
  ArrowRight,
  Settings2,
  Box,
  MapPin,
  Activity,
  ChevronLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function MasterDataGovernancePage() {
  const [intel, setIntel] = useState<CountryIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    masterDataService.getCountryIntelligence()
      .then(setIntel)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Master Registries...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.OVERSIGHT_PLATFORM_ADMIN)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary transition-all">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Master Control
          </Button>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Master Data Registry</h2>
            <p className="text-muted-foreground font-medium italic">Authoritative management of jurisdictional intelligence, trade taxonomies, and operational schemas.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <Database className="h-4 w-4" />
              Integrity Status: OPTIMAL
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Zap className="mr-2 h-4 w-4" /> Audit All Registries
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { title: 'Country Profiles', val: intel.length, sub: 'Verified Jurisdictions', icon: Globe, color: 'text-blue-600' },
          { title: 'Registry Integrity', val: '99.98%', sub: 'Zero duplicate drift', icon: ShieldCheck, color: 'text-emerald-600' },
          { title: 'Taxonomy Depth', val: '4,240', sub: 'Classification Nodes', icon: Box, color: 'text-orange-600' },
          { title: 'Sync Finality', val: '450ms', sub: 'Propogation Latency', icon: Activity, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.title}</CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tighter tabular-nums">{stat.val}</div>
                  <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60 italic">{stat.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Jurisdictional Knowledge Matrix</CardTitle>
                  <CardDescription className="text-xs font-medium">Sovereign trade profiles and regulatory complexity benchmarks.</CardDescription>
                </div>
                <Globe className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y-2">
                   {intel.map((country) => (
                      <div key={country.id} className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                         <div className="flex items-center gap-8">
                            <div className="h-14 w-14 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner text-2xl group-hover:scale-105 transition-transform">
                               {country.country === 'United States' ? '🇺🇸' : '🇨🇳'}
                            </div>
                            <div className="space-y-1.5">
                               <p className="font-black text-lg uppercase tracking-tighter leading-none">{country.country}</p>
                               <div className="flex items-center gap-4">
                                  <Badge variant="outline" className={cn(
                                     "text-[8px] font-black uppercase h-5 px-2 border-2 rounded-full",
                                     country.complexityIndex === 'Low' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                  )}>
                                     Complexity: {country.complexityIndex}
                                  </Badge>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Audit Score: {country.complianceScore}%</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="hidden sm:block text-right space-y-1">
                               <p className="text-[9px] font-black uppercase text-muted-foreground opacity-40 tracking-widest">Active Constraints</p>
                               <p className="text-xs font-black">{country.restrictions.length} Items</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-20 group-hover:opacity-100 transition-opacity">
                               <ArrowRight className="h-5 w-5" />
                            </Button>
                         </div>
                      </div>
                   ))}
                </div>
              </CardContent>
           </Card>

           <div className="grid sm:grid-cols-2 gap-8">
              <Card className="shadow-none border-2 bg-background p-8 space-y-6 rounded-2xl">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Port Master Coverage</h4>
                    <MapPin className="h-4 w-4 text-primary opacity-40" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-end justify-between">
                       <span className="text-3xl font-black tabular-nums tracking-tighter">1,240</span>
                       <span className="text-[9px] font-black text-emerald-600 uppercase">+12 new nodes</span>
                    </div>
                    <Progress value={92} className="h-1.5 bg-muted" />
                    <p className="text-[9px] font-medium italic text-muted-foreground opacity-60 leading-relaxed">
                       "92% of active global trade hubs are now verified and mapped with terminal-specific metadata."
                    </p>
                 </div>
              </Card>

              <Card className="shadow-none border-2 bg-background p-8 space-y-6 rounded-2xl">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">HS Code Mapping</h4>
                    <FileCheck className="h-4 w-4 text-primary opacity-40" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-end justify-between">
                       <span className="text-3xl font-black tabular-nums tracking-tighter">98.4%</span>
                       <Badge className="bg-emerald-100 text-emerald-950 text-[8px] font-black border-none uppercase tracking-tighter h-5">Verified</Badge>
                    </div>
                    <Progress value={98.4} className="h-1.5 bg-muted" />
                    <p className="text-[9px] font-medium italic text-muted-foreground opacity-60 leading-relaxed">
                       "Systematic mapping of WCO 2024 nomenclature is reaching finality. Zero critical mismatches detected."
                    </p>
                 </div>
              </Card>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Settings2 className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                    Stewardship Pulse
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Pending Validations</span>
                       <span className="text-xl font-black text-orange-300">14 REQUESTS</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Duplicate Probabilty</span>
                       <span className="text-xl font-black text-emerald-300">0.02%</span>
                    </div>
                 </div>
                 <p className="text-base font-bold italic leading-relaxed opacity-90 text-center text-white">
                    "Data integrity algorithms are currently validating 12,400+ operational nodes. Master record consistency is at Tier-1 Institutional standard."
                 </p>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none">
                    CONFIGURE TAXONOMY RULES
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Registry Audit Log</CardTitle>
                 <History className="h-4 w-4 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { action: 'HS_CODE_VERSION_SYNC', actor: 'Customs Oracle', time: '12m ago', status: 'success' },
                   { action: 'NEW_PORT_REGISTERED', actor: 'Logistics Steward', time: '4h ago', status: 'success' },
                   { action: 'TAXONOMY_OVERRIDE', actor: 'Compliance Admin', time: '1d ago', status: 'warning' }
                 ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/10 group hover:border-primary/40 transition-all cursor-pointer">
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight text-foreground">{log.action}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">{log.actor} • {log.time}</p>
                       </div>
                       <Badge variant="outline" className={cn(
                          "text-[8px] font-black uppercase h-5 px-1.5 border-2",
                          log.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                       )}>{log.status}</Badge>
                    </div>
                 ))}
                 <Button variant="ghost" className="w-full h-14 text-[10px] font-black uppercase text-primary hover:bg-primary/5 mt-4 tracking-widest border-2 border-dashed border-primary/20 rounded-2xl">Expand Registry Audit</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
