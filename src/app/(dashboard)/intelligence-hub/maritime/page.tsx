/**
 * @file maritime/page.tsx
 * @description Operational Maritime Intelligence terminal.
 */
'use client';

import { useEffect, useState } from 'react';
import { maritimeService } from '@/modules/intelligence/services/maritime.service';
import { MaritimeEvent } from '@/modules/intelligence/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Ship, 
  Anchor, 
  Waves, 
  Activity, 
  Loader2, 
  ArrowRight, 
  History, 
  MapPin,
  Compass,
  Zap,
  Search,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function MaritimeIntelligencePage() {
  const [events, setEvents] = useState<MaritimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    maritimeService.getRecentEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.INTELLIGENCE_HUB)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Command Hub
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Maritime SIGINT</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Autonomous vessel tracking, port load telemetry, and shipping lane finality.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Zap className="mr-2 h-4 w-4" /> RE-SCAN ASSETS
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LIVE VESSEL STREAM */}
        <div className="lg:col-span-8 space-y-8">
           {events.map((ev, i) => (
              <Card key={ev.id} className="shadow-xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                 <CardContent className="p-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-8 flex-1 min-w-0">
                       <div className={cn(
                          "h-12 w-16 rounded-2xl border-2 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform",
                          ev.severity === 'high' ? "bg-red-50 border-red-200" : "bg-muted border-primary/5"
                       )}>
                          <Ship className={cn("h-8 w-8", ev.severity === 'high' ? 'text-red-600' : 'text-primary opacity-60')} />
                       </div>
                       <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-4">
                             <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground truncate">{ev.vesselName}</h3>
                             <Badge variant="outline" className="text-[8px] font-black h-5 uppercase px-2 border-2 rounded-full">{ev.vesselId}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                             <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {ev.location}</span>
                             <span className="flex items-center gap-1.5"><Anchor className="h-3 w-3" /> Corridor: {ev.corridorId}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4 shrink-0">
                       <Badge className={cn(
                          "uppercase text-[9px] font-black h-6 px-3 border-none shadow-sm",
                          ev.type === 'LOITERING_DETECTED' ? "bg-orange-500 text-white" : "bg-primary text-white"
                       )}>{ev.type.replace(/_/g, ' ')}</Badge>
                       <span className="text-[10px] font-mono font-bold text-muted-foreground opacity-40">{new Date(ev.timestamp).toLocaleTimeString()} UTC</span>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        {/* MARITIME SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Lane Equilibrium</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Throughput', val: '92.4%', icon: Activity },
                   { label: 'Port Sync', val: 'LOCKED', icon: ShieldCheck },
                   { label: 'Vessel Finality', val: '99.8%', icon: Ship }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className="h-5 w-5 text-primary" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Waves className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Ais Mirror Protocol</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Baalvion Maritime nodes ingest dual-source satellite AIS telemetry to provide millisecond-accurate course validation. Zero course-drift variance detected."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
