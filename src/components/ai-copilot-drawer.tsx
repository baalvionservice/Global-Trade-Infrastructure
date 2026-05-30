
/**
 * @file src/components/ai-copilot-drawer.tsx
 * @description The Sovereign AI Copilot. A persistent assistant providing reasoning traces and operational foresight.
 * Hardened: Integrated with the Command Store to allow search triggers from AI.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  BarChart3,
  Loader2,
  Search,
  Command
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCommandStore } from '@/modules/platform-command/store/command.store';

export function AiCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const setSearchOpen = useCommandStore((state) => state.setSearchOpen);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Institutional Assistant v4.2 active. How can I optimize your current trade corridor?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsThinking(true);

    // Simulate AI Reasoning
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'I have analyzed the current liquidity pulse. Recommend rebalancing the APAC nodes to reduce settlement latency by 14%.' 
      }]);
      setIsThinking(false);
    }, 1500);
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
          <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-full shadow-2xl opacity-60 animate-in fade-in slide-in-from-bottom-2">
             <Command className="h-3 w-3 text-slate-500" />
             <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">K to search</span>
          </div>
          <Button 
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full bg-primary shadow-2xl hover:scale-110 transition-transform group border-4 border-white/5"
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
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l-2 shadow-3xl flex flex-col pointer-events-auto"
            >
              <header className="p-8 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/5 border-2 border-primary/10 shadow-inner">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">Sovereign Oracle</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-60 italic">AI Strategy Engine v4.2</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl">
                  <X className="h-5 w-5" />
                </Button>
              </header>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex flex-col gap-2 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-muted/50 border-2 rounded-tl-none italic"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-black uppercase text-muted-foreground opacity-40 px-1">
                        {msg.role === 'ai' ? 'Oracle Logic' : 'Authorized User'}
                      </span>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex items-center gap-3 text-muted-foreground px-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Running Monte Carlo Simulations...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <footer className="p-6 border-t bg-muted/10 space-y-6">
                <div className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Query system intelligence..."
                    className="w-full h-14 pl-6 pr-16 bg-background border-2 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary/40 transition-all shadow-inner"
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 top-2 h-10 w-10 rounded-xl"
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <Button variant="outline" className="h-10 text-[9px] font-black uppercase border-2 rounded-xl" onClick={() => setSearchOpen(true)}>
                      <Search className="mr-2 h-3.5 w-3.5" /> Search Registry
                   </Button>
                   <Button variant="outline" className="h-10 text-[9px] font-black uppercase border-2 rounded-xl">
                      <BarChart3 className="mr-2 h-3.5 w-3.5" /> Analyze Drift
                   </Button>
                </div>

                <div className="flex items-center justify-between pt-2 px-1">
                   <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span className="text-[8px] font-black uppercase text-muted-foreground opacity-60">Explainability: High</span>
                   </div>
                   <div className="flex gap-4">
                      <button className="text-[8px] font-black uppercase text-primary hover:underline">View Trace</button>
                      <button className="text-[8px] font-black uppercase text-primary hover:underline">Ledger Link</button>
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
