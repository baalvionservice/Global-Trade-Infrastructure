/**
 * @file seller-responses.tsx
 * @description Enhanced bid evaluation system with weighted scoring and competitive intelligence.
 */
'use client';

import { RFQResponse, acceptQuote, RFQ } from "@/services/rfq-service";
import { Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, MessageSquare, Info, Loader2, Star, TrendingUp, Trophy, Zap, ShieldCheck, ArrowRight, LayoutGrid, LayoutList, Scale, Dna } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PATHS } from "@/lib/paths";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

interface SellerResponsesProps {
  responses: RFQResponse[];
  rfq: RFQ;
}

export function SellerResponses({ responses, rfq }: SellerResponsesProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleAccept = async (quote: RFQResponse) => {
    setProcessingId(quote.id);
    try {
      const dealId = await acceptQuote(quote, rfq);
      toast({ title: "Mandate Synchronized", description: "Initializing sovereign deal room..." });
      router.push(`${PATHS.DEALS}/${dealId}`);
    } catch (e) {
      toast({ variant: "destructive", title: "Finalization Failure", description: "Could not establish execution node." });
    } finally {
      setProcessingId(null);
    }
  };

  const getBadgeColor = (badge?: string) => {
    if (badge === 'Best Price') return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm";
    if (badge === 'Fastest Delivery') return "bg-blue-50 text-blue-700 border-blue-200 shadow-sm";
    if (badge === 'Most Trusted') return "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-8">
         <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Evaluation Hub</p>
            <h3 className="font-black uppercase tracking-tighter text-4xl">Quotation Ledger</h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 flex items-center gap-2">
               <Trophy className="h-4 w-4 text-primary" /> Multi-Factor Ranking Engine Active
            </p>
         </div>
         <div className="flex gap-3 p-2 bg-background border-2 rounded-2xl shadow-xl">
            <Button 
               variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
               size="icon" 
               className="h-12 w-12 rounded-xl transition-all"
               onClick={() => setViewMode('list')}
            >
               <LayoutList className="h-5 w-5" />
            </Button>
            <Button 
               variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
               size="icon" 
               className="h-12 w-12 rounded-xl transition-all"
               onClick={() => setViewMode('grid')}
            >
               <LayoutGrid className="h-5 w-5" />
            </Button>
         </div>
      </div>
      
      <div className={cn(
         "grid gap-6",
         viewMode === 'grid' ? "md:grid-cols-2" : "grid-cols-1"
      )}>
        <AnimatePresence>
           {responses.map((res, i) => (
             <motion.div 
               key={res.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
             >
               <Card className={cn(
                 "shadow-2xl border-2 transition-all hover:border-primary relative overflow-hidden group rounded-2xl bg-background",
                 res.evaluationScore && res.evaluationScore > 80 ? "border-primary/20 ring-1 ring-primary/5" : ""
               )}>
                 {/* SCORE OVERLAY */}
                 <div className="absolute top-0 right-0 p-8 text-right space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Evaluation Score</p>
                    <p className="text-4xl font-black text-primary tracking-tighter leading-none">{res.evaluationScore || 0}</p>
                 </div>

                 <CardContent className="p-6">
                   <div className="flex flex-col gap-6">
                     <div className="flex items-start gap-6 min-w-0">
                       <div className="h-24 w-24 rounded-2xl border-2 bg-muted/20 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                          <span className="text-3xl font-black text-primary">{res.sellerName.substring(0, 2).toUpperCase()}</span>
                       </div>
                       
                       <div className="space-y-6 flex-1 min-w-0 pt-2">
                         <div className="space-y-2">
                           <div className="flex items-center gap-4">
                              <h4 className="font-black text-2xl uppercase tracking-tighter truncate text-foreground leading-none">{res.sellerName}</h4>
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border-2 border-yellow-100 text-yellow-700 shadow-sm">
                                 <Star className="h-3.5 w-3.5 fill-current" />
                                 <span className="text-xs font-black">{res.supplier?.rating || '4.8'}</span>
                              </div>
                           </div>
                           <p className="text-sm font-medium text-muted-foreground leading-relaxed italic max-w-xl">"{res.message}"</p>
                         </div>

                         <div className="flex flex-wrap gap-8 pt-4">
                            {[
                               { label: 'Delivery Time', val: res.deliveryTime, icon: Clock },
                               { label: 'Trust Level', val: `${res.supplier?.trustScore}/1000`, icon: ShieldCheck },
                               { label: 'Experience', val: `${res.supplier?.experience_years} YRS`, icon: Award }
                            ].map(feat => (
                               <div key={feat.label} className="space-y-1.5 group/feat">
                                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover/feat:text-primary transition-colors">
                                     <feat.icon className="h-3.5 w-3.5" /> {feat.label}
                                  </div>
                                  <p className="text-sm font-black uppercase tracking-tight text-foreground/80">{feat.val}</p>
                               </div>
                            ))}
                         </div>
                       </div>
                     </div>

                     <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t-2 border-muted/50">
                       <div className="space-y-2">
                         <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Proposed Finality</p>
                         <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-primary tracking-tighter leading-none">{formatCurrency(res.price)}</span>
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{rfq.pricing?.currency || rfq.currency || 'USD'} / UNIT</span>
                         </div>
                       </div>
                       
                       <div className="flex gap-4">
                          <Button variant="outline" className="h-12 px-6 border-2 border-red-100 text-red-600 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl" disabled={!!processingId}>
                             <X className="mr-3 h-4 w-4" /> DECLINE
                          </Button>
                          <Button 
                            className="h-12 px-6 bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-md rounded-2xl hover:scale-[1.02] transition-all" 
                            onClick={() => handleAccept(res)}
                            disabled={!!processingId}
                          >
                            {processingId === res.id ? (
                              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : (
                              <Check className="mr-3 h-5 w-5" />
                            )}
                            AWARD MANDATE
                          </Button>
                       </div>
                     </div>
                   </div>
                 </CardContent>
                 
                 <div className="bg-muted/10 p-5 border-t-2 flex items-center justify-center group-hover:bg-primary/[0.02] transition-all cursor-pointer">
                    <Button variant="link" className="p-0 h-auto font-black text-[10px] text-muted-foreground group-hover:text-primary uppercase tracking-widest transition-all hover:no-underline flex items-center gap-3">
                       <Scale className="h-4 w-4" /> 
                       OPEN FORENSIC COMPARISON 
                       <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                 </div>
               </Card>
             </motion.div>
           ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
