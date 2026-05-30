/**
 * @file escrow/page.tsx
 * @description Sovereign Escrow Governance Hub.
 */
'use client';

import { useEffect, useState } from 'react';
import { escrowService } from '@/modules/financials/services/escrow.service';
import { EscrowMandate } from '@/modules/financials/types/financial.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  ShieldCheck, 
  Activity, 
  Gavel, 
  ArrowRight, 
  History, 
  Loader2, 
  AlertTriangle,
  Landmark,
  Zap,
  Boxes,
  Compass
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function EscrowGovernanceHub() {
  const [escrows, setEscrows] = useState<EscrowMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    escrowService.getEscrows().then(setEscrows).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Governance Vaults...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: ESCROW_GATE_PROB_V4</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Escrow <br />Governance.</h2>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
            <Gavel className="mr-3 h-4 w-4" /> Arbitration Queue
          </Button>
          <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
            <Lock className="mr-3 h-5 w-5 fill-current" /> Provision Vault
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ESCROW LEDGER */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid gap-8">
              {escrows.map((escrow, i) => (
                <motion.div 
                  key={escrow.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                       <div className={cn(
                          "md:w-3 border-r-2 transition-all duration-700",
                          escrow.status === 'LOCKED' ? "bg-indigo-600" : "bg-emerald-500"
                       )} />
                       <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="space-y-6 flex-1 min-w-0">
                             <div className="flex items-center gap-4">
                                <Badge className="bg-primary text-white text-[9px] font-black h-6 px-3 border-none shadow-sm uppercase tracking-widest">{escrow.status}</Badge>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Mandate ID: {escrow.id}</span>
                             </div>
                             <div className="space-y-2">
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-foreground group-hover:text-primary transition-colors">
                                   {escrow.amount.toLocaleString()} <span className="text-muted-foreground opacity-30">{escrow.currency}</span>
                                </h3>
                                <p className="text-base text-muted-foreground font-medium italic leading-relaxed max-w-xl">"Provisioned for Order {escrow.orderId}. Counterparty: {escrow.sellerId}."</p>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 border-l-2 pl-12 border-muted/50 space-y-6">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Release Trigger</p>
                                <p className="text-sm font-black text-primary uppercase tracking-tight">{(escrow.releaseCondition ?? 'delivery_confirmation').replace(/_/g, ' ')}</p>
                             </div>
                             <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-primary border-2 border-transparent group-hover:border-primary/20 h-12 px-6 rounded-2xl transition-all">
                                AUDIT VAULT <ArrowRight className="ml-2 h-3 w-3" />
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </div>
        </div>

        {/* GOVERNANCE SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Governance Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: 4 high-value escrows are reaching maturity. Recommend automated release for Tier 1 verified sellers to optimize capital velocity."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Audit Pass</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">100%</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Finality</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">SECURE</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE BATCH RELEASE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Settlement Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Network Finality', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Settlement Depth', val: '$482M', icon: Landmark, color: 'text-blue-500' },
                   { label: 'Decision Latency', val: '12.4s', icon: Activity, color: 'text-indigo-500' }
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
