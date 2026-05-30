/**
 * @file onboarding/page.tsx
 * @description THE GLOBAL INSTITUTIONAL ONBOARDING COMMAND. 
 * Orchestrates the phased adoption of global enterprise tenants from Lead to Live Node.
 */
'use client';

import { useEffect, useState } from 'react';
import { onboardingService, OnboardingStatus, OnboardingPhase } from '@/services/onboarding-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  History, 
  ChevronRight,
  Zap,
  Building,
  Landmark,
  Globe,
  Search,
  Dna,
  Shield,
  Activity,
  Scaling,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function InstitutionalOnboardingPage() {
  const [queue, setQueue] = useState<OnboardingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const data = await onboardingService.getOnboardingQueue();
    setQueue(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdvance = async (id: string, currentPhase: OnboardingPhase) => {
    setProcessingId(id);
    try {
      await onboardingService.advancePhase(id, 'GOVERNANCE_REVIEW');
      toast({ title: "Tenant Advanced", description: "Institution moved to Governance Review phase." });
      fetchData();
    } catch (e) {
      toast({ variant: 'destructive', title: "Transition Failed" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Adoption Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-12 p-4 md:p-12 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Adoption Node: ADOPTION_COORD_ALPHA</p>
          </div>
          <h2 className="text-6xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Onboarding <br />Command.</h2>
          <p className="text-xl text-muted-foreground font-medium italic max-w-2xl leading-relaxed">
            "Authoritative planetary oversight of institutional tenant onboarding and sovereign identity resolution."
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-indigo-700">
              <Users className="h-4 w-4" />
              Active Pipeline: {queue.length} Institutions
           </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-10">
           {/* ONBOARDING QUEUE */}
           <div className="grid gap-8">
              <AnimatePresence mode="popLayout">
                 {queue.map((tenant, i) => (
                    <motion.div 
                      key={tenant.companyId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                       <Card className="shadow-2xl border-2 hover:border-primary/40 transition-all rounded-[40px] overflow-hidden bg-background group">
                          <CardHeader className="bg-muted/10 border-b p-10 flex flex-row items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className={cn(
                                   "h-16 w-16 rounded-[24px] bg-background border-2 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform",
                                   tenant.tenantType === 'bank' ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
                                )}>
                                   {tenant.tenantType === 'bank' ? <Landmark className="h-8 w-8 text-emerald-600" /> : <Building className="h-8 w-8 text-blue-600" />}
                                </div>
                                <div>
                                   <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{tenant.institutionName}</h3>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">ID: {tenant.companyId} • {tenant.tenantType.toUpperCase()} Node</p>
                                </div>
                             </div>
                             <Badge variant="outline" className="text-[9px] font-black uppercase px-3 h-6 border-2 rounded-full shadow-sm bg-background">{tenant.phase.replace(/_/g, ' ')}</Badge>
                          </CardHeader>
                          <CardContent className="p-10 space-y-8">
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                      <span>Node Readiness</span>
                                      <span>{tenant.progress}%</span>
                                   </div>
                                   <Progress value={tenant.progress} className="h-1.5 bg-muted rounded-full" />
                                </div>
                                <div className="space-y-1 border-l pl-8 border-muted">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Verification Depth</p>
                                   <p className="text-sm font-black uppercase">Level 4 Sovereign</p>
                                </div>
                                <div className="space-y-1 border-l pl-8 border-muted">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Wait Intensity</p>
                                   <Badge variant="secondary" className="bg-orange-600 text-white text-[8px] font-black h-5 px-2 border-none">HIGH_PRIORITY</Badge>
                                </div>
                             </div>
                             
                             <div className="flex justify-between items-center pt-2">
                                <div className="flex gap-4">
                                   <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-[10px] tracking-widest bg-background rounded-2xl">
                                      AUDIT LEGAL DOSSIER
                                   </Button>
                                </div>
                                <Button 
                                  className="h-14 px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-2xl rounded-2xl"
                                  onClick={() => handleAdvance(tenant.companyId, tenant.phase)}
                                  disabled={processingId === tenant.companyId}
                                >
                                   {processingId === tenant.companyId ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Zap className="mr-3 h-4 w-4" />}
                                   ADVANCE TO GOVERNANCE
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
           {/* ADOPTION KPI PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-[48px]">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-10 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Adoption Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 relative space-y-12">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Ecosystem Mapping: Systemic adoption from the Singapore banking cluster is trending +24%. Recommend accelerating the KYC audit for the pending 'Apex' node to capitalize on high-velocity liquidity pulses."
                 </p>
                 <Button variant="secondary" className="w-full h-20 font-black uppercase text-[12px] tracking-[0.4em] shadow-3xl bg-white text-primary border-none rounded-[20px] hover:scale-[1.02] transition-transform">
                    EXECUTE BATCH AUTHORIZATION
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-10 space-y-12 rounded-[48px]">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">Pipeline Health</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-10">
                 {[
                   { label: 'KYC Sync Rate', val: '92.4%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Decision Latency', val: '4.2 Days', icon: Activity, color: 'text-blue-500' },
                   { label: 'Node Finality', val: '99.98%', icon: Scaling, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
