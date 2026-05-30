
'use client';

import { OfferData } from '@/services/deal-service';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, ShieldCheck, Zap } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface OfferCardProps {
  offer: OfferData;
  isMe: boolean;
  onAction: (action: 'accept' | 'reject') => void;
}

export function OfferCard({ offer, isMe, onAction }: OfferCardProps) {
  const statusColors = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-200",
    accepted: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    rejected: "bg-rose-500/10 text-rose-700 border-rose-200",
  };

  return (
    <Card className={cn(
      "w-full max-w-[340px] shadow-lg border-2 transition-all",
      offer.status === 'accepted' ? "border-emerald-500/30 scale-[1.02]" : "border-primary/10",
      offer.status === 'rejected' && "opacity-60 grayscale-[0.5]"
    )}>
      <CardHeader className="p-4 flex flex-row items-center justify-between pb-3 space-y-0 border-b bg-muted/10">
        <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary fill-primary" />
          Proposed Terms
        </CardTitle>
        <Badge variant="outline" className={cn("text-[8px] font-black h-5 uppercase tracking-tighter border-2 px-2", (statusColors as any)[offer.status || 'pending'])}>
          {offer.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Unit Price</p>
              <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(offer.price || 0)}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Volume</p>
              <p className="text-xl font-black">{offer.quantity.toLocaleString()}</p>
           </div>
        </div>
        <div className="pt-3 border-t">
           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60 mb-1.5">Commercial Mandate</p>
           <p className="text-xs text-foreground font-semibold italic leading-relaxed">"{offer.terms}"</p>
        </div>
      </CardContent>
      {offer.status === 'pending' && !isMe && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-10 text-[10px] font-black border-2 border-rose-100 text-rose-600 hover:bg-rose-50 uppercase tracking-widest"
            onClick={() => onAction('reject')}
          >
            <X className="mr-1.5 h-3.5 w-3.5" /> REJECT
          </Button>
          <Button 
            size="sm" 
            className="flex-1 h-10 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 uppercase tracking-widest shadow-md"
            onClick={() => onAction('accept')}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" /> ACCEPT
          </Button>
        </CardFooter>
      )}
      {offer.status === 'accepted' && (
         <div className="px-5 pb-4 flex items-center gap-2 text-[9px] font-black text-emerald-700 uppercase tracking-tighter">
            <ShieldCheck className="h-3 w-3" /> Agreement reached on this version.
         </div>
      )}
    </Card>
  );
}
