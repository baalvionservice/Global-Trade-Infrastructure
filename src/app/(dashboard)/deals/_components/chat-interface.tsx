/**
 * @file ChatInterface
 * @description The high-fidelity messaging component for Deal Rooms and Thread views.
 * Supports autoscrolling, encryption indicators, and context-aware messaging.
 */
'use client';

import { Message } from '@/services/deal-service';
import { MessageItem } from './message-item';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Lock, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  messages: Message[];
  currentRole: 'buyer' | 'seller';
  onOfferAction: (messageId: string, action: 'accept' | 'reject') => void;
  isFinalized: boolean;
}

export function ChatInterface({ messages, currentRole, onOfferAction, isFinalized }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Encryption Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-5 flex justify-center pointer-events-none">
         <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="px-6 py-2 bg-background/80 backdrop-blur-xl rounded-full border-2 shadow-2xl flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-wide ring-1 ring-primary/5"
         >
            <Lock className="h-3.5 w-3.5 text-primary" /> End-to-End Encrypted Tunnel
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
         </motion.div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="p-6 md:p-6 pt-20 max-w-5xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-[60vh] flex-col items-center justify-center text-muted-foreground gap-8"
              >
                <div className="p-6 rounded-2xl bg-muted/30 border-4 border-dashed border-primary/10 shadow-inner group">
                   <ShieldCheck className="h-12 w-16 text-primary opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-sm font-black uppercase tracking-wide text-foreground">Secure Channel Established</p>
                  <p className="text-xs font-medium max-w-sm leading-relaxed opacity-60 italic">Initiate negotiation by proposing counter-offer terms or sending an authenticated message to your trade partner.</p>
                </div>
              </motion.div>
            ) : (
              <div className="pb-8">
                {messages.map((msg, i) => (
                  <MessageItem 
                    key={msg.id} 
                    message={msg} 
                    isMe={msg.sender === currentRole} 
                    onOfferAction={onOfferAction}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
          
          {isFinalized && (
             <div className="flex justify-center my-10 animate-in zoom-in duration-700">
                <div className="px-8 py-4 bg-emerald-600 text-white rounded-3xl shadow-2xl flex items-center gap-4 border-4 border-emerald-500/20">
                   <ShieldCheck className="h-6 w-6" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Deal Finalized</span>
                      <span className="text-xs font-bold opacity-90 mt-1">Institutional terms locked & signed.</span>
                   </div>
                </div>
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Connection Indicator */}
      <div className="absolute bottom-4 right-8 flex items-center gap-3 opacity-30 text-[9px] font-black uppercase tracking-widest pointer-events-none">
         <Activity className="h-3 w-3 animate-pulse" />
         Stream: 48kbps
      </div>
    </div>
  );
}
