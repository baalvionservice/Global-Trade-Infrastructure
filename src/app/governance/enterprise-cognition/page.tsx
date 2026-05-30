/**
 * @file src/app/governance/enterprise-cognition/page.tsx
 * @description THE ENTERPRISE COGNITION & SEMANTIC MEMORY HUB.
 */
'use client';

import { useEffect, useState } from 'react';
import { memoryFederation } from '@/modules/ai/services/memory-federation.service';
import { MemoryFragment } from '@/modules/ai/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Search, 
  Filter, 
  History, 
  ShieldCheck, 
  Dna, 
  Loader2, 
  ArrowRight,
  Zap,
  Globe,
  Plus,
  Terminal,
  Cpu,
  Lock,
  Workflow,
  Sparkles,
  Fingerprint,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function EnterpriseCognitionPage() {
  const [memories, setMemories] = useState<MemoryFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    const data = await memoryFederation.retrieveContext(search, 'COMP-101');
    setMemories(data.length > 0 ? data : [
        { id: 'MEM-1', entityId: 'ORD-9921', content: 'Matched buyer profile with 14ms latency on high-value renewables corridor.', classification: 'OPERATIONAL', timestamp: new Date().toISOString(), authorId: 'TREASURY_ORACLE', vectorId: 'v-001' },
        { id: 'MEM-2', entityId: 'COMP-102', content: 'Identified recurring identity drift signature during handshake phase.', classification: 'STRATEGIC', timestamp: new Date().toISOString(), authorId: 'COMPLIANCE_GUARD', vectorId: 'v-002' }
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  if (loading && memories.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Semantic Link...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Hub: MEMORY_FABRIC_01</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Semantic <br />Memory.</h2>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            "Authoritative oversight of institutional semantic indexing, cross-agent memory synchronization, and vectorized trade intelligence."
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10">
              <History className="mr-3 h-4 w-4" /> Forensic Replay
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black shadow-lg hover:scale-105 transition-all rounded-2xl uppercase tracking-wide text-xs">
              <Sparkles className="mr-3 h-5 w-5 fill-current" /> Index New Artifact
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* MEMORY LEDGER */}
        <div className="lg:col-span-8 space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input 
                placeholder="Query institutional memory via semantic resolution..." 
                className="w-full h-14 pl-16 pr-8 bg-white/5 border-2 border-white/10 rounded-2xl text-xl font-black uppercase tracking-tight placeholder:text-slate-700 text-white focus:outline-none focus:border-primary/40 transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <div className="grid gap-8">
              <AnimatePresence mode="popLayout">
                 {memories.map((mem, i) => (
                    <motion.div 
                      key={mem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                       <Card className="shadow-2xl border-none bg-slate-900/60 rounded-2xl overflow-hidden group hover:bg-white/[0.02] transition-all">
                          <CardContent className="p-0 flex">
                             <div className={cn(
                                "w-3 shrink-0 transition-all duration-700",
                                mem.classification === 'STRATEGIC' ? "bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]" : "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                             )} />
                             <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-6 flex-1 min-w-0">
                                   <div className="flex items-center gap-6">
                                      <Badge className="bg-slate-950 text-white text-[9px] font-black h-6 px-3 border border-white/10 uppercase tracking-widest">{mem.classification}</Badge>
                                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-40">Artifact ID: {mem.id}</span>
                                   </div>
                                   <p className="text-2xl font-bold italic leading-tight text-white leading-relaxed">
                                      "{mem.content}"
                                   </p>
                                   <div className="flex items-center gap-8 pt-2 text-[10px] font-black uppercase text-slate-500 tracking-wide">
                                      <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Node: {mem.authorId}</span>
                                      <span className="flex items-center gap-2"><History className="h-4 w-4" /> {format(new Date(mem.timestamp), "MMM dd, HH:mm")} UTC</span>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end gap-6 shrink-0 border-l border-white/5 pl-12">
                                   <div className="text-right space-y-1">
                                      <p className="text-[9px] font-black text-slate-600 uppercase">Context Link</p>
                                      <p className="text-lg font-black text-primary uppercase">{mem.entityId}</p>
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border border-white/10 bg-white/5 opacity-20 group-hover:opacity-100 transition-all">
                                      <ArrowRight className="h-6 w-6 text-white" />
                                   </Button>
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

        {/* SIDEBAR: MEMORY INFRA */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-lg border-none bg-primary text-white relative overflow-hidden group rounded-2xl h-[350px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-6 text-white">
                    <Database className="h-6 w-6 text-white animate-pulse" />
                    Vector Engine Pulse
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Cognitive Hub: Vector re-indexing complete. 124,000 operational shards are perfectly synchronized with the global decision kernel."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-SCAN SEMANTIC SHARDS
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/40 p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Memory finality</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Retrieval Latency', val: '14ms', icon: Zap, color: 'text-emerald-500' },
                   { label: 'Consensus Rate', val: '100%', icon: ShieldCheck, color: 'text-blue-500' },
                   { label: 'Artifact Depth', val: 'Tier 1', icon: Lock, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-8">
                         <div className="p-4 rounded-3xl bg-slate-950 border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-white tabular-nums">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-none bg-slate-900/30 p-16 text-center space-y-6 rounded-2xl border-dashed border-white/5">
              <Link2 className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary transition-all duration-700 group-hover:rotate-45" />
              <div className="space-y-4">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">Inter-Node Sync</p>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed px-8 opacity-40 text-slate-500">
                    "Institutional memory is distributed across multi-sovereign clusters. Every cognitive artifact is version-synced every 1s across the global mesh."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-14 border-white/10 font-black uppercase text-[10px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">RECONSTRUCT GLOBAL KNOWLEDGE</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
