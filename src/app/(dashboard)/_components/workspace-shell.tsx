/**
 * @file workspace-shell.tsx
 * @description THE SUPREME TACTICAL SHELL. 
 * Orchestrates multi-pane finality, resizable workspaces, and intelligence overlays.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/modules/workspace/store/workspace-store';
import { WorkspaceTabs } from './workspace-tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  BrainCircuit, 
  Activity, 
  Lock,
  Workflow,
  Command,
  ShieldCheck
} from 'lucide-react';
import { InsightsPanel } from './insights-panel';

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { 
    rightPanelOpen, 
    toggleRightPanel, 
    rightPanelWidth, 
    setRightPanelWidth,
    mode
  } = useWorkspaceStore();
  
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 320 && newWidth < 800) {
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setRightPanelWidth]);

  return (
    <div className={cn(
      "flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden",
      (mode as any) === 'compact' ? "density-compact" : "density-standard"
    )}>
      {/* SESSION MANAGEMENT BAR */}
      <WorkspaceTabs />

      <div className="flex-1 flex overflow-hidden">
        {/* PRIMARY EXECUTION PLANE */}
        <div className="flex-1 min-w-0 flex flex-col relative h-full">
           <div className="flex-1 overflow-y-auto terminal-scroll p-6 md:p-6">
              {children}
           </div>
           
           {/* TACTICAL FEED OVERLAY (Bottom) */}
           <div className="h-10 border-t bg-slate-950/80 backdrop-blur-md flex items-center px-6 justify-between text-[9px] font-black uppercase tracking-wide text-slate-500 z-30">
              <div className="flex items-center gap-6">
                 <span className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                    NODE_SYNC: OPTIMAL
                 </span>
                 <span className="flex items-center gap-2 border-l border-white/5 pl-6">
                    <Activity className="h-3 w-3" /> LATENCY: 140ms
                 </span>
                 <span className="flex items-center gap-2 border-l border-white/5 pl-6">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> IDENTITY_LOCKED
                 </span>
              </div>
              <div className="flex items-center gap-6">
                 <span className="flex items-center gap-2"><Lock className="h-3 w-3 text-indigo-500" /> E2E_AUTH_V4_SECURE</span>
                 <span className="opacity-40">OS_KERNEL_v4.2.0_STABLE</span>
              </div>
           </div>
        </div>

        {/* TACTICAL RESIZER */}
        {rightPanelOpen && (
          <div 
            className={cn(
              "w-1 group cursor-col-resize relative z-30 bg-white/5 hover:bg-primary/40 transition-colors",
              isResizing && "bg-primary"
            )}
            onMouseDown={() => setIsResizing(true)}
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-4 bg-background border border-white/10 rounded-full shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-4 w-0.5 bg-primary/40 rounded-full" />
             </div>
          </div>
        )}

        {/* STRATEGIC INTELLIGENCE SIDEBAR (Sovereign Oracle) */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.aside
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: rightPanelWidth }}
              className="hidden xl:flex flex-col bg-slate-900/60 border-l border-white/5 backdrop-blur-3xl shrink-0 overflow-hidden relative shadow-lg"
            >
               <header className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-8 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                     </div>
                     <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wide text-white">Sovereign Oracle</span>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">REASONING_CORE: ACTIVE</p>
                     </div>
                  </div>
                  <button className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors" onClick={() => toggleRightPanel(false)}>
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  </button>
               </header>
               <div className="flex-1 overflow-y-auto terminal-scroll">
                  <InsightsPanel />
               </div>
               <footer className="p-6 border-t border-white/5 bg-white/5">
                  <button className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 group hover:bg-white/10 transition-all">
                     <Command className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Launch Strategy Lab</span>
                  </button>
               </footer>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* FLOATING COGNITION TRIGGER */}
        {!rightPanelOpen && (
           <motion.button 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="absolute right-10 bottom-20 h-12 w-16 rounded-2xl shadow-lg z-40 bg-primary flex items-center justify-center border-4 border-background transition-transform hover:scale-110 active:scale-95 shadow-primary/20"
             onClick={() => toggleRightPanel(true)}
           >
              <BrainCircuit className="h-8 w-8 text-white fill-white/10" />
           </motion.button>
        )}
      </div>
    </div>
  );
}
