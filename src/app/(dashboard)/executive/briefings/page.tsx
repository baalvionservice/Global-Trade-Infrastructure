
/**
 * @file briefings/page.tsx
 * @description Strategic Briefings Archive for Executive Board.
 */
'use client';

import { useEffect, useState } from 'react';
import { briefingService, StrategicBriefing } from '@/services/briefing-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileKey, 
  Search, 
  Filter, 
  ArrowRight, 
  Loader2, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  Download,
  Eye,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function BriefingsPage() {
  const [briefs, setBriefs] = useState<StrategicBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    briefingService.getBriefings().then(setBriefs).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground">Strategic Memos</h2>
             <p className="text-muted-foreground font-medium italic">Authoritative briefings on platform health, market dynamics, and governance updates.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="px-5 py-2.5 rounded-full border-2 bg-background font-black text-[10px] uppercase tracking-widest text-primary">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Boardroom-Grade Privacy
           </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {briefs.map((brief) => (
          <Card key={brief.id} className="shadow-lg border-2 hover:border-primary/40 transition-all group overflow-hidden bg-background rounded-2xl">
             <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                   <div className={cn(
                      "w-2 transition-all duration-500",
                      brief.priority === 'strategic' ? "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "bg-primary/40"
                   )} />
                   <div className="flex-1 p-8 flex flex-col md:flex-row items-start justify-between gap-8">
                      <div className="space-y-4 flex-1">
                         <div className="flex items-center gap-4">
                            <Badge className="text-[9px] uppercase font-black tracking-widest px-2.5 h-5 bg-indigo-600 border-none shadow-sm">{brief.category}</Badge>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wide opacity-40">Priority: {brief.priority}</span>
                         </div>
                         <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-tight group-hover:text-primary transition-colors">{brief.title}</h3>
                         <p className="text-sm font-medium leading-relaxed italic opacity-80 max-w-2xl">"{brief.summary}"</p>
                         <div className="flex items-center gap-6 pt-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-wide">
                            <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> Issued {format(new Date(brief.createdAt), "MMM dd, yyyy")}</span>
                            <span className="flex items-center gap-1.5">Signatory: {brief.author}</span>
                         </div>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0 self-stretch justify-center md:border-l md:pl-10 border-muted">
                         <Button variant="outline" className="h-12 border-2 px-8 font-black uppercase text-[10px] tracking-widest bg-background">
                            <Eye className="mr-2 h-4 w-4" /> REVIEW BRIEF
                         </Button>
                         <Button variant="outline" className="h-12 border-2 px-8 font-black uppercase text-[10px] tracking-widest bg-background">
                            <Download className="mr-2 h-4 w-4" /> EXPORT PDF
                         </Button>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
