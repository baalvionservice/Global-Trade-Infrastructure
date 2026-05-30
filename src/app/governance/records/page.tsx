/**
 * @file src/app/governance/records/page.tsx
 * @description Operational Records Governance Center.
 * High-authority command for managing document retention, classifications, and audit pools.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  ShieldCheck, 
  Archive, 
  History, 
  Lock, 
  Globe, 
  Zap, 
  Scale, 
  FileStack,
  Loader2,
  ChevronLeft,
  Settings2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function RecordsGovernancePage() {
  const router = useRouter();

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(PATHS.OVERSIGHT_PLATFORM_ADMIN)} 
            className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-transparent hover:text-primary transition-all"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Records Governance</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Manage jurisdictional document retention, forensic audit pools, and institutional classification rulebases.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> REVISION HISTORY
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Settings2 className="mr-2 h-4 w-4" /> CONFIGURE POLICIES
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* RETENTION MATRIX */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Institutional Retention Matrix</CardTitle>
                  <CardDescription className="text-xs">Automatic lifecycle transitions enforced for high-authority records.</CardDescription>
                </div>
                <Database className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {[
                      { category: 'Commercial Contracts', window: '10 Years', status: 'LOCKED', volume: '1,240 GB' },
                      { category: 'Customs Declarations', window: '7 Years', status: 'LOCKED', volume: '450 GB' },
                      { category: 'Financial Settlements', window: '15 Years', status: 'LOCKED', volume: '2.4 TB' },
                      { category: 'Logistics Telemetry', window: '2 Years', status: 'ARCHIVING', volume: '12.8 TB' }
                    ].map((item, i) => (
                       <div key={i} className="p-6 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className="h-12 w-12 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                <Archive className="h-6 w-6 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1">
                                <p className="font-black text-xl uppercase tracking-tighter leading-none">{item.category}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Retention Window: {item.window}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right">
                                <p className="text-sm font-black text-foreground">{item.volume}</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Depth</p>
                             </div>
                             <Badge variant="outline" className={cn(
                                "text-[10px] font-black uppercase h-8 px-4 rounded-full shadow-sm border-2",
                                item.status === 'LOCKED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                             )}>{item.status}</Badge>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* GOVERNANCE ORACLE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Scale className="h-5 w-5 animate-pulse" />
                    Regulatory Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "Compliance Intelligence: Global trade dossiers are 99.98% synchronized with the 2024 Audit Standard. Zero retention variances detected across regional nodes."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Integrity Pass</span>
                       <span className="text-base font-black text-emerald-300">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Finality</span>
                       <Badge className="bg-white text-primary text-[9px] font-black px-3 py-1 uppercase tracking-tighter border-none h-6 rounded-full">LOCKED</Badge>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-3xl">
                    EXECUTE FORENSIC PURGE
                 </Button>
              </CardContent>
           </Card>

           {/* STORAGE KPIS */}
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Telemetry</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Sovereign Proofs', val: '14,240', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Sync Finality', val: '100%', icon: Globe, color: 'text-blue-500' },
                   { label: 'Archival Ratio', val: '42.4%', icon: Archive, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className={cn("h-5 w-5", stat.color)} /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all cursor-pointer">
              <History className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest">Audit Reconstruction</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Historical states are programmatically re-synchronizable for forensic audit. Digital dossiers can be reconstructed to any point in the institutional timeline."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-widest bg-background">LAUNCH FORENSIC REPLAY</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
