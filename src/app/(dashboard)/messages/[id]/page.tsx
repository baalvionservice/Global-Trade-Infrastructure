/**
 * @file src/app/(dashboard)/messages/[id]/page.tsx
 * @description High-fidelity thread view for Institutional Coordination.
 * Features contextual headers, security protocols, and operational war-room UI.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getConversationById, 
  getConversationMessages, 
  postMessage, 
  Conversation, 
  ChatMessage 
} from '@/services/communication-service';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Loader2, 
  Info, 
  ExternalLink, 
  ShieldCheck, 
  Lock,
  Box,
  Zap,
  Package,
  Activity,
  Siren,
  History,
  MoreVertical,
  Fingerprint
} from 'lucide-react';
import { ChatInterface } from '../../deals/_components/chat-interface';
import { NegotiationBar } from '../../deals/_components/negotiation-bar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConversationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (typeof id !== 'string') return;
    
    const [c, m] = await Promise.all([getConversationById(id), getConversationMessages(id)]);
    setConv(c);
    
    // Map service messages to UI message format
    setMessages(m.map(msg => ({
      id: msg.id,
      dealId: msg.conversationId,
      sender: msg.sender === 'SYSTEM' ? 'system' : (msg.sender === 'Alexander Chen' ? 'buyer' : 'seller'),
      type: msg.type,
      content: msg.content,
      createdAt: msg.createdAt,
      senderRole: msg.senderRole
    })));
  };

  useEffect(() => {
    fetchData().then(() => setLoading(false));
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async (content: string) => {
    if (!conv) return;
    const newMessage = await postMessage(conv.id, 'Alexander Chen', content);
    setMessages(prev => [...prev, {
      id: newMessage.id,
      sender: 'buyer',
      content: newMessage.content,
      type: 'text',
      createdAt: newMessage.createdAt,
      senderRole: newMessage.senderRole
    }]);
  };

  const contextIcons = {
    rfq: Box,
    deal: Zap,
    order: Package,
    general: Activity,
    incident: Siren,
    compliance: ShieldCheck
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Authenticating Coordination Node...</p>
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Dialogue Node Not Found</h2>
        <p className="text-muted-foreground mb-10 font-medium italic">The requested coordination thread could not be establishment in this session.</p>
        <Button onClick={() => router.push('/messages')} className="h-14 px-6 font-black uppercase tracking-widest shadow-xl">Return to Inbox</Button>
      </div>
    );
  }

  const Icon = contextIcons[conv.contextType as keyof typeof contextIcons] || Activity;
  const isWarRoom = conv.isWarRoom;

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-muted/20 overflow-hidden">
      {/* AUTHORITATIVE CONTEXT HEADER */}
      <div className={cn(
        "h-24 border-b bg-background px-4 md:px-6 flex items-center justify-between shrink-0 shadow-md z-20 relative transition-colors duration-500",
        isWarRoom ? "border-red-500/30" : ""
      )}>
        <div className="flex items-center gap-8">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted/50 border-2" onClick={() => router.push('/messages')}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-black uppercase tracking-tight leading-none truncate max-w-[400px] sm:max-w-xl">
                  {conv.participants.join(' ↔ ')}
               </h2>
               {isWarRoom && (
                 <Badge className="bg-red-600 text-white text-[9px] font-black px-3 h-6 border-none shadow-xl animate-pulse tracking-widest">
                    CRITICAL WAR ROOM
                 </Badge>
               )}
            </div>
            <div className="flex items-center gap-6">
               <div className={cn(
                 "flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-colors",
                 isWarRoom ? "bg-red-50 text-red-700 border-red-200" : "bg-primary/5 text-primary border-primary/10"
               )}>
                  <Icon className="h-3.5 w-3.5" /> {conv.contextType}
               </div>
               <span className="text-[11px] text-muted-foreground truncate max-w-[300px] uppercase font-bold tracking-tighter opacity-60">
                 REF: {conv.contextId} • {conv.contextTitle}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden xl:flex flex-col items-end gap-1 px-6 border-r">
              <span className="text-[9px] font-black uppercase tracking-wide text-muted-foreground opacity-40 leading-none">Security Node</span>
              <div className="flex items-center gap-2">
                 <Lock className="h-3 w-3 text-indigo-500" />
                 <span className="text-xs font-black tracking-tight">{conv.securityProtocol}</span>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" className="hidden lg:flex font-black text-[10px] h-12 px-8 uppercase tracking-widest border-2 shadow-sm bg-background hover:bg-muted transition-all">
                <History className="mr-2 h-4 w-4" /> Operational Replay
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 hover:bg-muted">
                 <MoreVertical className="h-5 w-5" />
              </Button>
           </div>
        </div>
      </div>

      {/* SECURITY PROTOCOL BANNER */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "border-b px-4 py-3 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-wide relative z-10 shadow-inner",
            isWarRoom ? "bg-red-600 text-white border-red-500" : "bg-indigo-600/5 text-indigo-700 border-indigo-100"
          )}
        >
           {isWarRoom ? <Siren className="h-4 w-4 animate-pulse" /> : <ShieldCheck className="h-4 w-4" />}
           {isWarRoom ? "Systemic Disruption War Room • Full Escalation Protocol Active" : "Institutional Handshake Protocol • E2E Encrypted Coordination"}
           <div className="absolute right-10 flex items-center gap-3 opacity-60 hidden md:flex">
              <Fingerprint className="h-4 w-4" />
              <span className="tracking-widest">Oracle Node: {isWarRoom ? 'WAR_COMMAND_01' : 'SYNC_A_002'}</span>
           </div>
        </motion.div>
      </AnimatePresence>

      {/* COORDINATION INTERFACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative shadow-inner">
        <ChatInterface 
          messages={messages} 
          currentRole="buyer" 
          onOfferAction={() => {}} 
          isFinalized={false}
        />
        <div className="p-6 bg-background border-t shadow-2xl relative z-20">
           <NegotiationBar 
             onSendMessage={handleSendMessage}
             onSendOffer={() => {}} 
             disabled={false}
           />
           <div className="max-w-4xl mx-auto flex items-center justify-between mt-4 px-1">
              <div className="flex items-center gap-4 opacity-40 text-[9px] font-black uppercase tracking-wide transition-opacity hover:opacity-100">
                 <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node Connection</span>
                 <span className="flex items-center gap-1.5 border-l pl-4"><Activity className="h-3 w-3" /> Throughput: 48kbps</span>
              </div>
              <div className="flex items-center gap-6">
                 <Button variant="link" className="p-0 h-auto text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary hover:no-underline opacity-60">Attach Evidence</Button>
                 <Button variant="link" className="p-0 h-auto text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary hover:no-underline opacity-60">External Invitation</Button>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
