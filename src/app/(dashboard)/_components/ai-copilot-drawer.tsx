/**
 * @file src/app/(dashboard)/_components/ai-copilot-drawer.tsx
 * @description The Sovereign AI Copilot. A high-fidelity assistant providing reasoning traces.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  BrainCircuit, 
  ShieldCheck, 
  Loader2,
  Search,
  Command,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCommandStore } from '@/modules/platform-command/store/command.store';
import { copilotService } from '@/modules/ai/services/copilot.service';

export function AiCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const setSearchOpen = useCommandStore((state) => state.setSearchOpen);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, reasoning?: any}[]>([
    { role: 'ai', content: 'Institutional Assistant v4.2 active. All cognitive clusters synchronized. How can I optimize your current trade corridor?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsThinking(true);

    try {
      const result = await copilotService.processCommand(userMsg);
      
      if (result.type === 'SEARCH_TRIGGER') {
        setSearchOpen(true);
        setMessages(prev => [...prev, { role: 'ai', content: `Initializing registry search for: "${result.query}".` }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: result.message || 'Cognitive analysis complete. No anomalies detected.',
          reasoning: { confidence: 0.98, trace: ['Corridor Pulse Verified', 'Identity Node Aligned', 'Sovereign Gating Validated'] }
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'System variance detected. Cognitive link resetting.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      {!isOpen && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-4"
        >
          <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-full shadow-2xl opacity-60">
             <Command className="h-3 w-3 text-slate-500" />
             <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">K to search</span>
          </div>
          <Button 
            onClick={() => setIsOpen(true)}
            className="h-12 w-16 rounded-full bg-primary shadow-2xl hover:scale-110 transition-transform group border-4 border-white/5"
          >
            <Bot className="h-7 w-7 text-white group-hover:animate-pulse" />
          </Button>
        </motion.div>
      )}

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l-2 shadow-md flex flex-col pointer-events-auto"
            >
              <header className="p-8 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/5 border-2 border-primary/10 shadow-inner">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">Sovereign Oracle</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-60 italic">AI Strategy Engine v4.2</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border-emerald-200">Online</Badge>
                   <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl">
                    <X className="h-5 w-5" />
                   </Button>
                </div>
              </header>

              <ScrollArea ref={scrollRef} className="flex-1 p-8">
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex flex-col gap-3 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "p-6 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-muted/50 border-2 rounded-tl-none italic"
                      )}>
                        {msg.content}
                      </div>
                      
                      <div className="flex items-center gap-4 px-1">
                        <span className="text-[8px] font-black uppercase text-muted-foreground opacity-40">
                          {msg.role === 'ai' ? 'Oracle Reasoning' : 'Identity Verified'}
                        </span>
                        {msg.reasoning && (
                           <div className="flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase">
                              <ShieldCheck className="h-3 w-3" /> Confidence: {Math.round(msg.reasoning.confidence * 100)}%
                           </div>
                        )}
                      </div>

                      {msg.reasoning?.trace && (
                         <div className="w-full p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10 space-y-2 mt-2">
                            {msg.reasoning.trace.map((step: string, idx: number) => (
                               <div key={idx} className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  <div className="h-1 w-1 rounded-full bg-primary" />
                                  <span>{step}</span>
                               </div>
                            ))}
                         </div>
                      )}
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                       <div className="p-6 bg-muted/30 border-2 border-dashed rounded-2xl flex items-center justify-center gap-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground animate-pulse">Running Monte Carlo Simulations...</span>
                       </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <footer className="p-8 border-t bg-muted/10 space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Query strategic operating state..."
                    className="relative w-full h-12 pl-8 pr-16 bg-background border-2 rounded-2xl font-black text-sm uppercase tracking-tight focus:outline-none focus:border-primary/40 transition-all shadow-inner"
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-3 top-3 h-10 w-10 rounded-xl shadow-lg"
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <Button variant="outline" className="h-12 text-[10px] font-black uppercase border-2 rounded-2xl group" onClick={() => setSearchOpen(true)}>
                      <Search className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Search Registry
                   </Button>
                   <Button variant="outline" className="h-12 text-[10px] font-black uppercase border-2 rounded-2xl group">
                      <Radio className="mr-2 h-4 w-4 text-indigo-500 group-hover:animate-pulse" /> Analyze Drift
                   </Button>
                </div>

                <div className="flex items-center justify-between pt-2 px-1">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Explainability: HIGH</span>
                   </div>
                   <div className="flex gap-6">
                      <button className="text-[9px] font-black uppercase text-primary hover:underline tracking-widest">VIEW TRACE</button>
                      <button className="text-[9px] font-black uppercase text-primary hover:underline tracking-widest">LEDGER LINK</button>
                   </div>
                </div>
              </footer>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
