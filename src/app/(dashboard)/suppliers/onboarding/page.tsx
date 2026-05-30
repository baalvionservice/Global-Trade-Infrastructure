/**
 * @file onboarding/page.tsx
 * @description Institutional Onboarding Command Center.
 * High-authority gating for prospective institutional trade nodes.
 */
'use client';

import { useEffect, useState } from 'react';
import { supplierService } from '@/modules/suppliers/services/supplier.service';
import { SupplierProfile, SupplierLifecycleStatus } from '@/modules/suppliers/types/supplier.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  UserPlus, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Loader2, 
  ArrowRight, 
  History, 
  Scale, 
  Building,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function SupplierOnboardingCommandPage() {
  const [queue, setQueue] = useState<SupplierProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const data = await supplierService.getSuppliers({ status: 'ONBOARDING' });
    // Simulate some seed data for the command center demo
    setQueue(data.length > 0 ? data : [
        { 
          id: 'PEND-001', 
          name: 'Apex Semiconductor Node', 
          jurisdiction: 'Singapore', 
          status: 'ONBOARDING', 
          trustScore: 450, 
          verificationLevel: 1,
          industry: 'Electronics',
          metrics: { fulfillmentRate: 0, avgLeadTime: '-', qualityScore: 0, disputeRate: 0, esgScore: 0, settlementFinality: 0 },
          certifications: [],
          activeContracts: 0,
          totalTradeVolume: 0,
          updatedAt: new Date().toISOString()
        } as any
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, action: SupplierLifecycleStatus) => {
    setProcessingId(id);
    try {
      await supplierService.transitionStatus(id, action, 'ADMIN-ALPHA');
      toast({ title: "Node Transition Finalized", description: `Institution state updated to ${action}.` });
      fetchData();
    } catch (e) {
      toast({ variant: 'destructive', title: "Authority Denial" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Authenticating Identity Nodes...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority node: IDENTITY_ONBOARD_01</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Onboarding <br />Command.</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-indigo-700">
              <ShieldCheck className="h-4 w-4" />
              Sovereign Gating: ACTIVE
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           <div className="grid gap-8">
              <AnimatePresence mode="popLayout">
                 {queue.map((node, i) => (
                    <motion.div 
                      key={node.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                       <Card className="shadow-2xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                          <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className="h-12 w-16 rounded-2xl bg-background border-2 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform">
                                   <Building className="h-8 w-8 text-primary opacity-60" />
                                </div>
                                <div>
                                   <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{node.name}</h3>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">ID: {node.id} • {node.jurisdiction} Node</p>
                                </div>
                             </div>
                             <Badge variant="outline" className="text-[9px] font-black uppercase px-3 h-6 border-2 rounded-full shadow-sm bg-background">{node.status}</Badge>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {[
                                  { label: 'Identity Depth', val: `Lvl ${node.verificationLevel}`, icon: Fingerprint },
                                  { label: 'Risk Profile', val: node.riskLevel, icon: Activity },
                                  { label: 'Trust Anchor', val: node.trustScore, icon: ShieldCheck },
                                  { label: 'Audit Stage', val: 'LEGAL_REVIEW', icon: Scale }
                                ].map(stat => (
                                   <div key={stat.label} className="space-y-1 group/stat">
                                      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-muted-foreground opacity-60 group-hover/stat:opacity-100 transition-opacity">
                                         <stat.icon className="h-3 w-3" /> {stat.label}
                                      </div>
                                      <p className="text-sm font-black uppercase tracking-tight text-foreground">{stat.val}</p>
                                   </div>
                                ))}
                             </div>

                             <div className="space-y-4">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                   <span>Adoption Maturity</span>
                                   <span>45% Complete</span>
                                </div>
                                <Progress value={45} className="h-1.5 bg-muted rounded-full" />
                             </div>
                          </CardContent>
                          <CardFooter className="p-8 pt-0 flex gap-4">
                             <Button 
                                variant="outline" 
                                className="flex-1 h-12 border-2 border-red-100 text-red-600 font-black uppercase text-[11px] tracking-widest hover:bg-red-50 rounded-2xl"
                                onClick={() => handleAction(node.id, 'TERMINATED')}
                                disabled={processingId === node.id}
                             >
                                <XCircle className="mr-3 h-4 w-4" /> DENY ACCESS
                             </Button>
                             <Button 
                                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[11px] tracking-widest shadow-2xl rounded-2xl"
                                onClick={() => handleAction(node.id, 'APPROVED')}
                                disabled={processingId === node.id}
                             >
                                {processingId === node.id ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-3 h-5 w-5" />}
                                AUTHORIZE IDENTITY
                             </Button>
                          </CardFooter>
                       </Card>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <UserPlus className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Onboarding Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Ecosystem Mapping: Systemic adoption from the Singapore banking cluster is trending +24%. Recommend accelerating the KYC audit for the pending 'Apex' node to capitalize on high-velocity liquidity pulses."
                 </p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE BATCH AUTHORIZATION
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Pipeline</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'KYC Completion', val: '92.4%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Technical Sync', val: '88.2%', icon: Activity, color: 'text-blue-500' },
                   { label: 'Avg. Decision Latency', val: '4.2 Days', icon: History, color: 'text-indigo-500' }
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
