/**
 * @file mobile-command-surface.tsx
 * @description The Sovereign Mobile Command Interface. 
 * Optimized for one-handed executive intervention and critical trade oversight.
 */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Radio, 
  Fingerprint, 
  Lock, 
  Activity, 
  ChevronUp,
  AlertTriangle,
  Gavel,
  CheckCircle2,
  XCircle,
  Menu,
  Box,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useMobilityStore } from '@/modules/mobility/store/mobility.store';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mobilityGovernance } from '@/modules/mobility/services/mobility-governance.service';

export function MobileCommandSurface() {
  const { syncStatus, isOfflineMode } = useMobilityStore();
  const { role } = useAppState();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAuthorize = async () => {
     await mobilityGovernance.executeBiometricHandshake('AUTH_001');
     setIsExpanded(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 px-4 pointer-events-none lg:hidden">
       {/* COMMAND STATUS TIER */}
       <div className="flex justify-between items-center mb-3 pointer-events-auto">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
          >
             <div className={cn(
               "h-1.5 w-1.5 rounded-full animate-pulse",
               syncStatus === 'SYNCHRONIZED' ? "bg-emerald-500" : "bg-orange-50"
             )} />
             <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">{syncStatus}</span>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl transition-colors duration-500",
              isOfflineMode ? "bg-red-500/10 border-red-500 text-red-500" : "bg-slate-950/90 border-white/10 text-emerald-400"
            )}
          >
             {isOfflineMode ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
             <span className="text-[9px] font-black uppercase tracking-widest">{isOfflineMode ? 'EDGE_LOCAL' : 'SATELLITE_LINK'}</span>
          </motion.div>
       </div>

       {/* INTERVENTION DRAWER */}
       <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-background border-2 border-primary/20 rounded-2xl p-8 shadow-lg mb-4 pointer-events-auto"
            >
               <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node</p>
                     <h3 className="text-2xl font-black uppercase tracking-tighter">{role} COMMAND</h3>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase h-5 border-2">Lvl 4 AUTH</Badge>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <Button variant="outline" className="h-14 flex flex-col gap-2 rounded-2xl border-2 bg-muted/30">
                     <Activity className="h-5 w-5 text-indigo-500" />
                     <span className="text-[9px] font-black uppercase">Analyze Drift</span>
                  </Button>
                  <Button variant="outline" className="h-14 flex flex-col gap-2 rounded-2xl border-2 bg-muted/30">
                     <Lock className="h-5 w-5 text-orange-500" />
                     <span className="text-[9px] font-black uppercase">Freeze Node</span>
                  </Button>
               </div>

               <div className="p-6 rounded-2xl bg-red-600 text-white space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><AlertTriangle className="h-12 w-16" /></div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase opacity-60">Pending Escalation</p>
                     <p className="text-lg font-bold leading-tight uppercase">Customs Block: SGN_NODE_04</p>
                  </div>
                  <Button 
                    className="w-full h-12 bg-white text-red-600 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95 transition-all"
                    onClick={handleAuthorize}
                  >
                    <Fingerprint className="mr-2 h-5 w-5" /> AUTHORIZE OVERRIDE
                  </Button>
               </div>
            </motion.div>
          )}
       </AnimatePresence>

       {/* MAIN TOGGLE BUTTON */}
       <div className="flex justify-center pointer-events-auto">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "h-14 w-20 rounded-2xl shadow-lg flex items-center justify-center border-4 transition-all duration-500",
              isExpanded ? "bg-background border-primary/40 rotate-180" : "bg-primary border-white/5"
            )}
          >
             {isExpanded ? <ChevronUp className="h-8 w-8 text-primary" /> : <Zap className="h-8 w-8 text-white fill-current" />}
          </motion.button>
       </div>
    </div>
  );
}
