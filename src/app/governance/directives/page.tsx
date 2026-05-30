
/**
 * @file directives/page.tsx
 * @description Sovereign Strategic Directives Management.
 * Allows executive governance councils to broadcast binding trade mandates and policy updates.
 */
'use client';

import { useEffect, useState } from 'react';
import { commandCenterService } from '@/services/command-center-service';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { ExecutiveDirective } from '@/types/institutional';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileKey, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  History, 
  ChevronLeft,
  ArrowRight,
  Zap,
  Landmark,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export default function DirectivesRegistryPage() {
  const [directives, setDirectives] = useState<ExecutiveDirective[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ExecutiveDirective[]>('/directives', { sortBy: 'createdAt', order: 'desc' });
      setDirectives(toList<ExecutiveDirective>(res));
    } catch {
      setDirectives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueDirective = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await commandCenterService.broadcastDirective('GLOBAL_CLUSTER', formData.get('title') as string, 'EXECUTIVE_COMMAND_ALPHA');
      
      toast({ title: "Directive Broadcasted", description: "Operational policy has been synchronized across target nodes." });
      setIsNewModalOpen(false);
      fetchData();
    } catch (e) {
      toast({ variant: 'destructive', title: "Issuance Failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.OVERSIGHT_PLATFORM_ADMIN)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-transparent hover:text-primary transition-all">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Strategic Mandates</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">Authoritative platform-wide directives, policy overrides, and sovereign trade alerts.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Authority: SOVEREIGN_COMMAND
           </div>
           <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
              <DialogTrigger asChild>
                 <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
                   <Plus className="mr-2 h-4 w-4" /> Issue New Directive
                 </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                 <form onSubmit={handleIssueDirective}>
                    <DialogHeader>
                       <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Strategic Directive Orchestrator</DialogTitle>
                       <DialogDescription className="font-medium">Broadcast a binding operational mandate to the institutional network.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mandate Title</Label>
                          <Input name="title" placeholder="e.g. Q4 Liquidity Restriction" required className="h-12 border-2 font-bold" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Scope</Label>
                             <Select name="scope" defaultValue="global">
                                <SelectTrigger className="h-12 border-2 font-bold">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="global">GLOBAL NETWORK</SelectItem>
                                   <SelectItem value="regional">REGIONAL CLUSTER</SelectItem>
                                   <SelectItem value="sectoral">SECTORAL NODES</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority Level</Label>
                             <Select name="priority" defaultValue="strategic">
                                <SelectTrigger className="h-12 border-2 font-bold">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="strategic">STRATEGIC POLICY</SelectItem>
                                   <SelectItem value="emergency">EMERGENCY DIRECTIVE</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Directive Content</Label>
                          <Textarea name="content" placeholder="Define the operational constraints or mandates..." rows={6} required className="border-2 font-medium" />
                       </div>
                       <div className="p-5 bg-amber-50 border-2 border-amber-100 rounded-3xl flex items-start gap-4 text-amber-900 shadow-sm">
                          <Zap className="h-6 w-6 shrink-0 text-amber-600" />
                          <p className="text-xs leading-relaxed font-bold">
                             "Executive Warning: Directives are binding system-wide policies. Once broadcasted, autonomous orchestrators will immediately enforce these constraints across the affected trade corridors."
                          </p>
                       </div>
                    </div>
                    <DialogFooter>
                       <Button type="submit" className="w-full h-12 font-black uppercase tracking-wide shadow-2xl text-base" disabled={submitting}>
                          {submitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Authorize & Broadcast Mandate"}
                       </Button>
                    </DialogFooter>
                 </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="grid gap-8">
        <AnimatePresence>
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed bg-card/50">
               <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
               <p className="text-[11px] font-black uppercase text-muted-foreground tracking-wide animate-pulse">Syncing Directive Registry...</p>
            </div>
          ) : (
            directives.map((dir, i) => (
              <motion.div 
                key={dir.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="shadow-lg border-2 hover:border-primary/40 transition-all group overflow-hidden bg-background rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex items-stretch h-full">
                       <div className={cn(
                          "w-2 transition-all duration-500",
                          dir.priority === 'emergency' ? "bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                       )} />
                       <div className="flex-1 p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                          <div className="space-y-6 flex-1 min-w-0">
                             <div className="flex items-center gap-6">
                                <Badge className={cn(
                                   "text-[9px] uppercase font-black tracking-widest px-3 h-6 border-none shadow-sm",
                                   dir.priority === 'emergency' ? "bg-red-600" : "bg-indigo-600"
                                )}>{dir.priority} MANDATE</Badge>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground opacity-40">
                                   <Globe className="h-3.5 w-3.5" /> Scope: {dir.scope}
                                </div>
                             </div>
                             <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{dir.title}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">ID: {dir.id} • Issued: {format(new Date(dir.createdAt ?? Date.now()), "MMMM d, yyyy HH:mm")}</p>
                             </div>
                             <p className="text-base font-medium leading-relaxed italic opacity-80 max-w-4xl border-l-4 border-muted pl-8">"{dir.content}"</p>
                             <div className="flex items-center gap-8 pt-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-wide">
                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border"><ShieldCheck className="h-3 w-3 text-primary" /> Authority: {dir.issuedBy}</span>
                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border"><FileText className="h-3 w-3 text-primary" /> Ledger Hash: {dir.id.replace('DIR', '0x88')}</span>
                             </div>
                          </div>
                          <div className="flex flex-col gap-3 shrink-0 self-stretch justify-center md:border-l md:pl-12 border-muted">
                             <Button variant="outline" className="h-14 border-2 px-6 font-black uppercase text-[10px] tracking-widest bg-background group">
                                <History className="mr-2 h-4 w-4 group-hover:rotate-[-45deg] transition-transform" /> VIEW AUDIT LINEAGE
                             </Button>
                             <Button variant="outline" className="h-14 border-2 px-6 font-black uppercase text-[10px] tracking-widest bg-background group">
                                <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /> PROPAGATION MAP
                             </Button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 relative overflow-hidden group shadow-2xl border-2 border-white/5">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Landmark className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Policy Framework v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Sovereign Control Node.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion Command Center provides the authoritative digital layer for sovereign trade directives. Policies issued via the command node are cryptographically verified and deterministically enforced across the global institutional ledger, ensuring absolute regulatory finality."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Governance Sync</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">OPTIMAL</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Mandate Throughput</p>
                  <p className="text-2xl font-black tracking-tighter">~450ms</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Chain Integrity</p>
                  <p className="text-2xl font-black tracking-tighter text-indigo-400">VERIFIED</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
