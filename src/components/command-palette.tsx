"use client";

/**
 * @file src/components/command-palette.tsx
 * @description The Universal Operating Layer Launcher.
 * Features fuzzy search across institutional registries and quick action workflows.
 */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Command, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  Zap,
  Globe,
  History,
  Activity,
  Plus,
  Rocket,
  ChevronRight,
  Loader2,
  Box,
  Fingerprint,
  Radio
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent 
} from '@/components/ui/dialog';
import { PATHS } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommandStore } from '@/modules/platform-command/store/command.store';
import { searchService } from '@/modules/platform-command/services/search.service';
import { GlobalSearchResult } from '@/modules/platform-command/types';

export function CommandPalette() {
  const router = useRouter();
  const { isSearchOpen: open, setSearchOpen: setOpen, searchResults, setSearchResults } = useCommandStore();
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  // KEYBOARD TRIGGER: CMD+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [open, setOpen]);

  // LIVE SEARCH HANDLER
  React.useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchService.search(query);
      setSearchResults(results);
      setIsSearching(false);
    };

    const timer = setTimeout(handleSearch, 150);
    return () => clearTimeout(timer);
  }, [query, setSearchResults]);

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(path);
  };

  const actions = [
    { label: 'Initiate Sourcing', icon: Plus, path: `${PATHS.BUYER_RFQS}/new`, category: 'SOURCING' },
    { label: 'Issue Letters of Credit', icon: Zap, path: PATHS.CREDIT_LINES, category: 'FINANCIAL' },
    { label: 'Track Global Assets', icon: Truck, path: PATHS.LOGISTICS_SHIPMENT, category: 'EXECUTION' },
    { label: 'Governance War Rooms', icon: ShieldCheck, path: PATHS.GOVERNANCE_DISPUTES, category: 'GOVERNANCE' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[750px] p-0 border-none bg-slate-900/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden rounded-[40px] ring-1 ring-white/10">
        <div className="flex flex-col h-full max-h-[85vh]">
           {/* SEARCH INPUT AREA */}
           <div className="p-8 border-b border-white/5 flex items-center gap-6 relative">
              <Search className={cn(
                "h-7 w-7 text-primary transition-all duration-300",
                isSearching ? "opacity-20 scale-75" : "opacity-40"
              )} />
              {isSearching && (
                 <div className="absolute left-[34px] top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                 </div>
              )}
              <input 
                autoFocus
                placeholder="Resolve Node ID, Contract Hash, or Supplier Identity..." 
                className="w-full bg-transparent border-none outline-none font-black text-2xl uppercase tracking-tighter placeholder:text-slate-700 text-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-white/5 text-[10px] font-black text-slate-500 uppercase">
                 ESC TO EXIT
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-10 pb-12">
              <AnimatePresence mode="wait">
                 {query.length > 0 ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                       <div className="px-4 flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Registry Search Results</h4>
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{searchResults.length} NODES MATCHED</span>
                       </div>
                       
                       <div className="grid gap-2">
                          {searchResults.map((result) => (
                             <button 
                               key={result.id}
                               onClick={() => handleSelect(result.path)}
                               className="flex items-center justify-between w-full p-6 rounded-[24px] transition-all hover:bg-primary group text-left border border-transparent hover:border-white/10 hover:shadow-2xl"
                             >
                                <div className="flex items-center gap-6">
                                   <div className="h-14 w-14 rounded-[18px] bg-slate-800 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">
                                      {result.category === 'SOURCING' && <FileText className="h-6 w-6 text-blue-400" />}
                                      {result.category === 'IDENTITY' && <Fingerprint className="h-6 w-6 text-emerald-400" />}
                                      {result.category === 'EXECUTION' && <Truck className="h-6 w-6 text-orange-400" />}
                                      {result.category === 'FINANCIAL' && <Zap className="h-6 w-6 text-indigo-400" />}
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-black text-lg uppercase tracking-tight text-white leading-none">{result.title}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white/60 transition-colors">{result.subtitle}</p>
                                   </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                             </button>
                          ))}
                          {searchResults.length === 0 && (
                             <div className="py-20 text-center space-y-6 opacity-20">
                                <Activity className="h-16 w-16 mx-auto" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Zero Matching Registry Nodes</p>
                             </div>
                          )}
                       </div>
                    </motion.div>
                 ) : (
                    <motion.div 
                      key="shortcuts"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-12"
                    >
                       {/* QUICK ACTIONS GRID */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4">Authoritative Workflows</h4>
                          <div className="grid grid-cols-2 gap-4">
                             {actions.map((item) => (
                                <button 
                                  key={item.label}
                                  onClick={() => handleSelect(item.path)}
                                  className="flex flex-col gap-6 p-8 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group relative overflow-hidden"
                                >
                                   <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                      <item.icon className="h-24 w-24" />
                                   </div>
                                   <div className="p-3 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                                      <item.icon className="h-6 w-6 text-primary" />
                                   </div>
                                   <div className="space-y-1">
                                      <span className="text-sm font-black uppercase tracking-tight text-white">{item.label}</span>
                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.category} Domain</p>
                                   </div>
                                </button>
                             ))}
                          </div>
                       </div>

                       {/* SYSTEM HEALTH SHORTCUTS */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4">Operating Environment</h4>
                          <div className="grid gap-2">
                             {[
                               { label: 'View Operational Singularity', icon: Activity, path: PATHS.EXECUTIVE_COMMAND },
                               { label: 'Access Audit Ledger', icon: History, path: PATHS.GOVERNANCE_AUDIT },
                               { label: 'Inspect Infrastructure Pulse', icon: Radio, path: PATHS.GOVERNANCE_RESILIENCE }
                             ].map((item) => (
                                <button 
                                  key={item.label}
                                  onClick={() => handleSelect(item.path)}
                                  className="flex items-center gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all text-left group"
                                >
                                   <item.icon className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                                   <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                                </button>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}