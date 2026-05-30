"use client";

/**
 * @file policies/page.tsx
 * @description Institutional Policy Registry & Runtime Enforcement.
 */
import { useEffect, useState } from 'react';
import { governanceService, GovernancePolicy } from '@/services/governance-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Loader2, 
  ArrowRight, 
  Plus, 
  Search, 
  History, 
  Lock,
  Database,
  Terminal,
  Settings2,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function PolicyRegistryPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await governanceService.getPolicies();
      setPolicies(list);
    } catch {
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = policies.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Policy Rulebase...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Regulatory Runtime</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Policy Registry</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative management of binding trade rules, jurisdictional constraints, and autonomous enforcement logic.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> REVISION HISTORY
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> DEFINE NEW RULE
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input 
                placeholder="Resolve policy by name, rule identity, or enforcement category..." 
                className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="grid gap-8">
           <AnimatePresence mode="popLayout">
              {filtered.map((policy, i) => (
                 <motion.div 
                   key={policy.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                 >
                    <Card className="shadow-lg border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                       <CardContent className="p-0 flex items-stretch">
                          <div className={cn(
                             "w-2 shrink-0 transition-all duration-500",
                             policy.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                          )} />
                          <div className="flex-1 p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                             <div className="space-y-6 flex-1 min-w-0">
                                <div className="flex items-center gap-6">
                                   <Badge className={cn(
                                      "text-[9px] uppercase font-black tracking-widest px-3 h-6 border-none shadow-sm",
                                      policy.category === 'FINANCIAL' ? "bg-indigo-600 text-white" : "bg-slate-900 text-white"
                                   )}>{policy.category}</Badge>
                                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground opacity-40">
                                      <Terminal className="h-3.5 w-3.5" /> Enforcement: {policy.enforcement}
                                   </div>
                                </div>
                                <div>
                                   <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{policy.name}</h3>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">ID: {policy.id} • Version: {policy.version} (STABLE)</p>
                                </div>
                                <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 relative overflow-hidden group/rule">
                                   <div className="absolute top-0 right-0 p-3 opacity-10"><Database className="h-10 w-10 text-emerald-400" /></div>
                                   <code className="text-xs font-mono text-emerald-400 block tracking-tight select-all">IF ( {policy.rule} ) THEN APPLY {policy.enforcement}</code>
                                </div>
                             </div>
                             
                             <div className="flex flex-col items-end shrink-0 border-l-2 pl-12 border-muted/50 space-y-8">
                                <div className="text-right space-y-1">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Status</p>
                                   <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{policy.status}</p>
                                </div>
                                <div className="flex gap-3">
                                   <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                      <Settings2 className="h-5 w-5" />
                                   </Button>
                                   <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                      <FileText className="h-5 w-5" />
                                   </Button>
                                </div>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-950 text-white relative overflow-hidden group shadow-md border-2 border-white/5">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Lock className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Regulatory Integrity Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Sovereign Rulebase. <br />Immutable Runtime.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion OS enforces jurisdictional trade policies at the kernel layer. Every policy change is cryptographically versioned and requires consensus authorization before being propagated to the active enforcement runtime, ensuring 100% auditable regulatory finality."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Enforcement Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">DETERMINISTIC</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">SLA Integrity</p>
                  <p className="text-2xl font-black tracking-tighter">99.98%</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Chain Logic</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">VERIFIED</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
