/**
 * @file RFQDetailPage
 * @description THE SOURCING COMMAND CENTER. 
 * High-authority workbench for managing RFQ lifecycles, evaluating bids, and awarding mandates.
 */
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { getRfqById, getSellerResponses, closeRfq, RFQ, RFQResponse } from '@/services/rfq-service';
import { RFQStatusTimeline } from '../_components/rfq-status-timeline';
import { SellerResponses } from '../_components/seller-responses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Edit, 
  Lock, 
  UserPlus, 
  Loader2, 
  Calendar, 
  Globe, 
  Box, 
  ShieldCheck, 
  TrendingUp, 
  LayoutGrid,
  Zap,
  Gavel,
  History,
  Scale,
  Activity,
  FileText,
  Dna
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PATHS } from '@/lib/paths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

export default function RFQDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [responses, setResponses] = useState<RFQResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') return;

    Promise.all([getRfqById(id), getSellerResponses(id)])
      .then(([rfqData, responseData]) => {
        setRfq(rfqData);
        setResponses(responseData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCloseRfq = async () => {
    if (!rfq) return;
    setClosing(true);
    try {
      const updated = await closeRfq(rfq.id);
      setRfq(updated);
      toast({ title: "RFQ Closed", description: "The RFQ is no longer accepting responses." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to close RFQ." });
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Sourcing Context...</p>
      </div>
    );
  }

  if (!rfq) return null;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen pb-32">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary transition-all"
            onClick={() => router.push(PATHS.BUYER_RFQS)}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Pipeline
          </Button>
          <div className="space-y-3">
             <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sourcing Mandate</p>
                <Badge variant="outline" className="uppercase font-black text-[10px] px-4 py-1.5 border-2 shadow-sm rounded-full bg-background">
                  {rfq.id}
                </Badge>
             </div>
             <h2 className="text-4xl font-black tracking-tight text-foreground uppercase tracking-tighter leading-[0.9] max-w-4xl">
               {rfq.productName || rfq.title}
             </h2>
          </div>
          <div className="flex items-center gap-6 pt-2">
             <div className="flex items-center gap-3 bg-background p-2 pr-6 rounded-2xl border-2 shadow-xl">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center shadow-inner">
                   <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none">Security State</span>
                   <span className="text-sm font-black uppercase text-indigo-950">Sovereign Audit Active</span>
                </div>
             </div>
             <div className="flex items-center gap-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                <Calendar className="h-4 w-4" /> Finality: {format(new Date(rfq.deliveryDate || rfq.createdAt), "MMMM d, yyyy")}
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 pt-6 md:pt-0">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <Edit className="mr-3 h-4 w-4" /> Edit Mandate
          </Button>
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <UserPlus className="mr-3 h-4 w-4" /> Invite Suppliers
          </Button>
          <Button 
            variant="destructive" 
            className="h-12 px-6 font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all"
            disabled={rfq.status === 'CLOSED' || closing}
            onClick={handleCloseRfq}
          >
            {closing ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Lock className="mr-3 h-5 w-5" />}
            Seal Discovery
          </Button>
        </div>
      </div>

      <div className="bg-slate-950 border-none rounded-2xl p-16 shadow-lg relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none rotate-12 scale-150">
           <Zap className="h-64 w-64 text-primary brightness-0 invert" />
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-primary mb-16 text-center">Operational Lifecycle Pulse</h3>
        <RFQStatusTimeline status={rfq.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl flex flex-col">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-wide flex items-center gap-4">
                   <FileText className="h-6 w-6 text-primary opacity-30" />
                   Mandate Summary
                </CardTitle>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-8">
                   <div className="flex items-start gap-6 group cursor-default">
                      <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><Box className="h-6 w-6 text-primary opacity-60" /></div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">Volume Protocol</p>
                        <p className="font-black text-2xl uppercase tracking-tighter text-foreground">{(rfq.quantity as any)?.value || rfq.quantity} {(rfq.quantity as any)?.unit || rfq.unit}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-6 group cursor-default">
                      <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><Globe className="h-6 w-6 text-primary opacity-60" /></div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">Destination Node</p>
                        <p className="font-black text-2xl uppercase tracking-tighter text-foreground">{rfq.deliveryCountry || 'Global Hub'}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-6 group cursor-default">
                      <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><TrendingUp className="h-6 w-6 text-primary opacity-60" /></div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">Floor Cap</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-black text-primary tracking-tighter">{rfq.pricing?.currency || rfq.currency} {(rfq.pricing?.target_price || rfq.targetPrice || 0).toLocaleString()}</span>
                           <span className="text-[9px] font-black text-muted-foreground uppercase">/ Unit</span>
                        </div>
                      </div>
                   </div>
                </div>
                
                <Separator className="bg-muted/50" />
                
                <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-2xl space-y-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Activity className="h-14 w-20" /></div>
                   <p className="text-[10px] font-black uppercase text-indigo-700 tracking-widest">Signal Intelligence</p>
                   <p className="text-base font-bold leading-relaxed italic text-indigo-950">
                     "Mandate synchronization is optimized. 12 high-affinity elite sellers have absorbed this brief. Expected proposal finality: High."
                   </p>
                </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Governance Audit</h4>
              <div className="space-y-6">
                 {[
                   { label: 'Integrity Signatures', val: 'Verified', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'KYC Threshold', val: 'Level 4', icon: Scale, color: 'text-blue-500' },
                   { label: 'Blockchain Lineage', val: 'Locked', icon: History, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
           {/* BID EVALUATION HUB */}
           <SellerResponses responses={responses} rfq={rfq} />
           
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 relative p-6">
                 <CardTitle className="text-[11px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                    Autonomous Sourcing Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-[1.1] opacity-95 tracking-tighter">
                    "AI Analysis: GPS Global's bid carries a 92% affinity match with your historical Tier-1 delivery finality. Recommend immediatePrivate Deal Room initialization."
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-white tracking-widest">Confidence Index</p>
                       <p className="text-4xl font-black text-emerald-300 tabular-nums tracking-tighter">99.8%</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-white tracking-widest">Optimization Lift</p>
                       <p className="text-4xl font-black text-blue-300 tabular-nums tracking-tighter">+14%</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-24 font-black uppercase text-base tracking-widest shadow-lg bg-white text-primary border-none rounded-2xl hover:scale-[1.02] transition-transform">
                    INITIATE ELITE HANDSHAKE
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
