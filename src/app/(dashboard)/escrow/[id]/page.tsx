
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { History } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getEscrowById, updateEscrowStatus, releaseEscrow, EscrowAccount } from '@/services/escrow-service';
import { EscrowStatusTimeline } from '../_components/escrow-status-timeline';
import { PaymentModal } from '../_components/payment-modal';
import { InstitutionalTimeline } from '@/components/shared/institutional-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2, ShieldAlert, Wallet, Gavel, CheckCircle2, ExternalLink, Calendar, AlertOctagon, ShieldCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { PATHS } from '@/lib/paths';
import { cn, formatCurrency } from '@/lib/utils';

export default function EscrowDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchData = async () => {
    if (typeof id !== 'string') return;
    const data = await getEscrowById(id);
    setEscrow(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRelease = async () => {
    if (!escrow) return;
    setUpdating(true);
    try {
      await releaseEscrow(escrow.id);
      toast({ title: "Funds Released", description: "Ledger synchronized. Transaction settled to institutional node." });
      fetchData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Release Failed", description: e.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDispute = async () => {
    if (!escrow) return;
    setUpdating(true);
    try {
      await updateEscrowStatus(escrow.id, 'disputed');
      toast({ title: "Dispute Opened", description: "Liquidity locked pending arbiter investigation." });
      fetchData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Dispute Failed" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Record Not Found</h2>
        <Button onClick={() => router.push(PATHS.ESCROW)} className="mt-6 font-black uppercase tracking-widest text-[10px] h-12 px-8">Return to Control Center</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.ESCROW)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary transition-all">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
             <h2 className="text-3xl font-black tracking-tight uppercase tracking-tighter text-foreground">Escrow Account</h2>
             <Badge variant="outline" className={cn(
               "uppercase font-black text-[10px] px-3 py-1 border-2 shadow-sm",
               escrow.status === 'disputed' ? "bg-red-50 text-red-700 border-red-200 animate-pulse" : "bg-primary/5 text-primary border-primary/20"
             )}>
                {escrow.id} • {escrow.status.toUpperCase()}
             </Badge>
          </div>
          <p className="text-muted-foreground font-medium italic">Provisioned for Trade Execution: <span className="font-bold underline underline-offset-4">{escrow.orderId}</span></p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           {escrow.status === 'created' && (
             <Button onClick={() => setIsPaymentModalOpen(true)} disabled={updating} className="font-black h-12 px-8 text-[10px] uppercase tracking-widest shadow-2xl">
                <Wallet className="mr-2 h-4 w-4" /> AUTHORIZE FUNDING
             </Button>
           )}
           {escrow.status === 'delivered' && (
             <Button onClick={handleRelease} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 font-black h-12 px-8 text-[10px] uppercase tracking-widest shadow-2xl">
                <CheckCircle2 className="mr-2 h-4 w-4" /> RELEASE FINAL SETTLEMENT
             </Button>
           )}
           {['funded', 'in_transit', 'delivered'].includes(escrow.status) && (
             <Button variant="outline" onClick={handleDispute} disabled={updating} className="text-red-600 border-red-200 hover:bg-red-50 font-black h-12 px-8 text-[10px] uppercase tracking-widest border-2 bg-background">
                <ShieldAlert className="mr-2 h-4 w-4" /> INITIATE DISPUTE
             </Button>
           )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-none border-2 bg-background p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <ShieldCheck className="h-48 w-48" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground mb-12 text-center">Institutional Settlement Timeline</h3>
              <EscrowStatusTimeline status={escrow.status} />
           </Card>

           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/10 border-b pb-8 px-6">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Mandate Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 text-center space-y-4 shadow-inner relative group">
                    <div className="absolute top-4 right-6 flex items-center gap-2 text-[9px] font-black uppercase text-primary/40">
                       <ShieldCheck className="h-3 w-3" /> Ledger Signed
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide opacity-60">Locked Transaction Value</p>
                    <p className="text-4xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform duration-500">{formatCurrency(escrow.amount, escrow.currency)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic pt-2">Includes Multi-Node Gas & Protection Fees</p>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-16 px-6">
                    <div className="space-y-6">
                       <div className="flex gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border-2 shadow-inner"><Calendar className="h-6 w-6 text-muted-foreground" /></div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Node Provisioned</p>
                             <p className="font-black text-sm uppercase tracking-tight mt-1">{format(new Date(escrow.createdAt), "MMMM d, yyyy")}</p>
                          </div>
                       </div>
                       <div className="flex gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20"><ExternalLink className="h-6 w-6 text-primary" /></div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Ledger Link</p>
                             <Button variant="link" className="p-0 h-auto font-black text-primary uppercase text-xs mt-1 hover:no-underline" onClick={() => router.push(`/orders/${escrow.orderId}`)}>
                                {escrow.orderId} <ArrowRight className="h-2 w-2 ml-1" />
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 border-l pl-12 border-muted/30">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Institutional Beneficiary</p>
                          <p className="font-black text-base uppercase tracking-tighter">{escrow.sellerName}</p>
                          <p className="text-[10px] font-medium italic opacity-70 leading-relaxed mt-1">Funds released upon cryptographically verified port milestone.</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Provisioning Entity</p>
                          <p className="font-black text-base uppercase tracking-tighter">{escrow.buyerName}</p>
                          <p className="text-[10px] font-medium italic opacity-70 leading-relaxed mt-1">Capital currently secured in Baalvion Encrypted Vault.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* ARBITER NODE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <History className="h-48 w-48 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-8 py-8">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-3">
                    <History className="h-5 w-5" />
                    Ledger Verification
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-base font-bold leading-relaxed opacity-90 italic">
                    "This escrow mandate is cryptographically signed and verified by the Baalvion Institutional Oracle Network. Zero variance detected."
                 </p>
                 <div className="p-5 rounded-3xl bg-white/10 border border-white/5 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Audit Signature</span>
                       <span className="text-[9px] font-mono opacity-80 select-all">0x88f...12a99</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Finality State</span>
                       <Badge className="bg-emerald-400 text-emerald-950 text-[9px] font-black px-2 uppercase tracking-tighter h-5 rounded-full border-none">CONFIRMED</Badge>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02]">
                    DOWNLOAD LEDGER PROOF
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6">
              <InstitutionalTimeline events={[]} />
           </Card>

           <Card className="shadow-none border-2 border-dashed bg-muted/20 p-6 text-center space-y-6">
              <Gavel className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <div className="space-y-2">
                 <p className="text-xs font-black uppercase tracking-widest">Governance Desk</p>
                 <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                    "Arbiters may authorize emergency releases for restricted corridors following formal jurisdictional review."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[10px] tracking-widest bg-background">CONTACT ARBITER</Button>
           </Card>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={async () => fetchData()}
        amount={escrow.amount}
        currency={escrow.currency}
        escrowId={escrow.id}
        orderId={escrow.orderId}
      />
    </main>
  );
}
