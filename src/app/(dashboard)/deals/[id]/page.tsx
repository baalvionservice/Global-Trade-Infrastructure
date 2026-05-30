
'use client';

/**
 * @file deal-room/page.tsx
 * @description THE BAALVION ENCRYPTED DEAL ROOM.
 * High-fidelity multi-party negotiation space with AI Strategy and Legal Finality integration.
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  dealService, 
  Deal, 
  Message 
} from '@/services/deal-service';
import { useRoom } from '@/hooks/use-realtime';
import { ChatInterface } from '../_components/chat-interface';
import { SummaryPanel } from '../_components/summary-panel';
import { NegotiationBar } from '../_components/negotiation-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Activity, 
  BrainCircuit, 
  ArrowRight,
  Shield,
  Scale,
  Fingerprint,
  FileSignature
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DealRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [deal, setDeal] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  
  const currentRole = useRef<'buyer' | 'seller'>('seller');

  // Live deal-room updates via WebSocket (append new messages, dedup by id).
  useRoom(typeof id === 'string' ? `deal:${id}` : null, (evt) => {
    if (evt.event === 'message' && evt.data) {
      setMessages((prev) => (prev.some((m) => m.id === evt.data.id) ? prev : [...prev, evt.data]));
    }
  });

  const fetchData = async () => {
    if (typeof id !== 'string') return;
    const [dealData, msgData] = await Promise.all([
      dealService.getDealById(id), 
      dealService.getMessages(id)
    ]);
    setDeal(dealData);
    setMessages(msgData);
  };

  useEffect(() => {
    fetchData().then(() => setLoading(false));
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async (content: string) => {
    if (!deal) return;
    const msg = await dealService.sendMessage(deal.id, currentRole.current, content);
    setMessages(prev => [...prev, msg]);
  };

  const handleAIStrategy = async () => {
    if (!deal) return;
    setAiAnalyzing(true);
    try {
      const msg = await dealService.getAIStrategy(deal.id);
      setMessages(prev => [...prev, msg]);
      toast({ title: "Strategy Oracle Synced", description: "AI analysis injected into coordination stream." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Oracle Timeout" });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSendOffer = async (price: number, quantity: number, terms: string) => {
    if (!deal) return;
    const msg = await dealService.sendOffer(deal.id, currentRole.current, { price, quantity, terms });
    setMessages(prev => [...prev, msg]);
    toast({ title: "Proposal Synchronized", description: "Structured offer broadcasted to counterparty ledger." });
  };

  const handleFinalize = async () => {
    if (!deal) return;
    setFinalizing(true);
    try {
      const result = await dealService.finalizeDeal(deal.id);
      toast({ title: "Deal Locked", description: "Commercial terms sealed. Provisioning order node." });
      router.push(`${PATHS.ORDERS}/${result.orderId}`);
    } catch (e) {
      toast({ variant: "destructive", title: "Handshake Failed", description: "Could not seal commercial terms." });
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Secure Tunnel...</p>
      </div>
    );
  }

  if (!deal) return null;

  const isFinalized = deal.status === 'FINALIZED' || deal.status === 'finalized';

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-muted/20 overflow-hidden">
      {/* COMMAND HEADER */}
      <div className="h-24 border-b bg-background px-6 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted/50 border-2" onClick={() => router.push(PATHS.DEALS)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="space-y-1.5">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{deal.productName}</h2>
               <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-2 py-1 px-3 bg-muted/50">
                 ID: {deal.id}
               </Badge>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
               <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Channel: SEC_TUNNEL_A92</span>
               <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> Partner: {deal.buyerName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleAIStrategy} 
            disabled={isFinalized || aiAnalyzing}
            className="h-14 px-8 border-2 font-black text-[10px] uppercase tracking-widest group bg-background rounded-2xl shadow-sm"
          >
             {aiAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />}
             AI Strategy
          </Button>
          <Button 
            variant="outline"
            className="h-14 px-8 border-2 font-black text-[10px] uppercase tracking-widest bg-background rounded-2xl shadow-sm"
            onClick={() => router.push(PATHS.CONTRACT_WORKSPACE)}
          >
             <FileSignature className="mr-2 h-4 w-4 text-indigo-500" />
             Draft Contract
          </Button>
          <Button 
            size="lg" 
            disabled={isFinalized || finalizing}
            onClick={handleFinalize}
            className={cn(
               "font-black text-[11px] uppercase tracking-wide h-14 px-6 shadow-2xl rounded-2xl transition-all",
               !isFinalized ? "bg-primary hover:scale-[1.02] shadow-primary/20" : "bg-emerald-600 border-none"
            )}
          >
            {finalizing ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : isFinalized ? <ShieldCheck className="mr-3 h-5 w-5" /> : <Zap className="mr-3 h-5 w-5" />}
            {isFinalized ? 'HANDSHAKE FINALIZED' : 'FINALIZE DEAL'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* NEGOTIATION WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 border-r relative shadow-inner">
          <div className="absolute top-0 left-0 right-0 z-10 px-6 py-3 flex justify-center pointer-events-none">
             <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-5 py-1.5 bg-background/80 backdrop-blur-md rounded-full border-2 shadow-2xl flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-indigo-100">
                <Scale className="h-3 w-3 text-indigo-500" /> 
                Authority Gating: ACTIVE
             </motion.div>
          </div>

          <ChatInterface 
            messages={messages} 
            currentRole={currentRole.current} 
            onOfferAction={() => {}}
            isFinalized={isFinalized}
          />
          
          <div className="p-8 bg-background border-t shadow-2xl relative z-20">
             <NegotiationBar 
               onSendMessage={handleSendMessage} 
               onSendOffer={handleSendOffer}
               disabled={isFinalized}
             />
             <div className="max-w-4xl mx-auto flex items-center justify-between mt-4 px-1 opacity-40 text-[8px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Fingerprint className="h-3 w-3" /> Identity Signature: SELLER_NODE_GPS</span>
                <span className="flex items-center gap-2"><Activity className="h-3 w-3" /> Latency: 140ms</span>
             </div>
          </div>
        </div>

        {/* ANALYTICS SIDEBAR */}
        <div className="hidden xl:block w-[420px] shrink-0 bg-background overflow-auto custom-scrollbar border-l shadow-2xl">
          <SummaryPanel deal={deal} />
        </div>
      </div>
    </main>
  );
}
