/**
 * @file identity/page.tsx
 * @description THE GLOBAL IDENTITY & TRUST OBSERVATORY.
 * High-authority command console for the Sovereign Identity Fabric and Planetary Trust Graph.
 */
'use client';

import { useEffect, useState } from 'react';
import { identityTrustEngine } from '@/services/identity-trust-engine';
import { reputationLedger, ReputationEntry } from '@/services/reputation-ledger-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  Network, 
  History, 
  Fingerprint, 
  AlertTriangle,
  Search,
  Lock,
  Landmark,
  Compass,
  ArrowRight,
  TrendingUp,
  Dna,
  Shield
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function IdentityTrustObservatory() {
  const [history, setHistory] = useState<ReputationEntry[]>([]);
  const [globalPulse, setGlobalPulse] = useState<number>(99.4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reputationLedger.getEntityHistory('GLOBAL_SYSTEM')
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Identity Fabric...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen selection:bg-primary">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign Identity Layer</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-white leading-none">Identity Observatory</h2>
          <p className="text-slate-400 font-medium italic max-w-2xl">High-authority oversight of institutional identity resolution, real-time trust life-cycling, and relational behavior mapping.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end gap-1 px-6 border-r border-white/10">
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">Fabric Integrity</span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">{globalPulse}%</span>
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90">
              <Fingerprint className="mr-2 h-4 w-4" /> RE-SYNC GLOBAL GRAPH
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Verified Identities', val: '14,240', sub: 'Institutional Nodes', icon: Users, color: 'text-blue-500' },
          { label: 'Handshake Finality', val: '100%', sub: 'Zero Identity Drift', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Behavioral Stability', val: '99.8%', sub: 'Pattern Consistency', icon: Activity, color: 'text-indigo-500' },
          { label: 'Graph Complexity', val: 'Lvl 4', sub: 'Relational Depth', icon: Network, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border border-white/5 bg-slate-900/40 rounded-2xl group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wide">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tighter text-slate-100">{kpi.val}</div>
                  <p className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-widest italic">{kpi.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           {/* REPUTATION LEDGER STREAM */}
           <Card className="shadow-none border-none bg-slate-900/50 rounded-2xl overflow-hidden flex flex-col h-[600px] relative group">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between z-10">
                 <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Trust Propagation Ledger</CardTitle>
                    <CardDescription className="text-slate-400 font-medium italic">Immutable record of auditable actions affecting institutional reputation across the network.</CardDescription>
                 </div>
                 <History className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0 overflow-auto custom-scrollbar z-10">
                 <div className="divide-y divide-white/5">
                    {history.map((entry, i) => (
                       <div key={entry.id} className="p-8 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className={cn(
                                "h-12 w-12 rounded-xl border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                entry.delta > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                             )}>
                                <Activity className={cn("h-6 w-6", entry.delta > 0 ? "text-emerald-400" : "text-red-400")} />
                             </div>
                             <div className="space-y-1">
                                <p className="font-black text-sm uppercase tracking-tight text-white">{entry.action.replace(/_/g, ' ')}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Node: {entry.orgId}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-slate-600 uppercase">Trust Delta</p>
                                <p className={cn("text-xl font-black tabular-nums", entry.delta > 0 ? "text-emerald-400" : "text-red-400")}>
                                   {entry.delta > 0 ? '+' : ''}{entry.delta}
                                </p>
                             </div>
                             <div className="text-[10px] font-mono text-slate-700 w-24 text-right">
                                {format(new Date(entry.createdAt), "HH:mm:ss")} UTC
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* IDENTITY ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-white relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Dna className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Identity Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter text-white">
                    "Behavioral Analysis: Institutional trust density is trending +14.2% following the federation of Tier 1 banking clusters. Zero identity collisions detected."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    RE-MAP TRUST GRAPH
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border border-white/5 bg-slate-900/50 p-6 space-y-8 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Health</h4>
              <div className="space-y-6">
                 {[
                   { label: 'ABAC Finality', val: '100%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Identity Drift', val: '0.001%', icon: Activity, color: 'text-blue-500' },
                   { label: 'Admin Latency', val: '450ms', icon: Zap, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
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

           <Card className="shadow-none border border-white/5 bg-slate-900/30 p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Shield className="h-12 w-16 mx-auto text-slate-700 opacity-20 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-45" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-slate-400">Institutional Privacy</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-40 text-slate-500">
                    "Baalvion uses Zero-Knowledge Identity proofs to verify partner eligibility without exposing commercially sensitive counterparty data."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-white/10 font-black uppercase text-[9px] tracking-wide bg-slate-900/50 hover:bg-slate-800 text-white">RE-KEY IDENTITY NODE</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
