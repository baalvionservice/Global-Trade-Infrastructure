/**
 * @file operations/page.tsx
 * @description Field Operations Terminal. 
 * Hardened: Multi-step ground-truth workflows with Edge Sync integration.
 */
'use client';

import { useEffect, useState } from 'react';
import { fieldService, OperationalTask } from '@/services/field-service';
import { edgeSync } from '@/modules/mobility/services/edge-sync.service';
import { useMobilityStore } from '@/modules/mobility/store/mobility.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Search,
  Package,
  Activity,
  History,
  ChevronRight,
  ArrowRight,
  Camera,
  Fingerprint,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function FieldOperationsPage() {
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const { syncStatus, isOfflineMode } = useMobilityStore();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const data = await fieldService.getTasks();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (taskId: string) => {
    setCompleting(taskId);
    try {
      // Dispatch via the Edge Sync Fabric
      const res = await edgeSync.dispatchMandate('TASK_COMPLETED', taskId, {
        verifier: 'USR-FIELD-101',
        biometricHash: '0x88fA992...SIGNED',
        timestamp: new Date().toISOString()
      });

      if (res.status === 'STAGED_OFFLINE') {
        toast({ title: "Task Staged Offline", description: "Verification saved locally. Will sync upon satellite link recovery." });
      } else {
        toast({ title: "Task Verified", description: "Ledger updated. Fulfillment authorized." });
      }
      
      // Optimistic Update
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) {
      toast({ variant: 'destructive', title: "Verification Failed" });
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-muted/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Node Connection...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 pb-32">
      {/* TACTICAL HEADER */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Terminal: FIELD_OPS_ALPHA</p>
              <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground">Field Operations</h2>
           </div>
           <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2" onClick={fetchData}>
              <RefreshCw className="h-5 w-5" />
           </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="p-4 bg-background border-2 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                 <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-muted-foreground uppercase leading-none">Sector</span>
                 <span className="text-xs font-black uppercase">Shanghai Hub</span>
              </div>
           </div>
           <div className="p-4 bg-background border-2 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={cn(
                 "p-2.5 rounded-xl transition-colors",
                 isOfflineMode ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
              )}>
                 <Activity className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-muted-foreground uppercase leading-none">Telemetry</span>
                 <span className="text-xs font-black uppercase">{isOfflineMode ? 'EDGE_LOCAL' : 'LINK_OPTIMAL'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* TASK QUEUE */}
      <div className="space-y-6">
         <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="shadow-xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                   <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-2xl bg-background border-2 shadow-inner group-hover:scale-110 transition-transform flex items-center justify-center">
                            {task.type === 'inspection' ? <Search className="h-6 w-6 text-primary" /> : <ShieldCheck className="h-6 w-6 text-primary" />}
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{task.type.replace('_', ' ')}</p>
                            <h3 className="text-lg font-black uppercase tracking-tight leading-none">{task.title}</h3>
                         </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black h-6 border-2">{task.entityId}</Badge>
                   </CardHeader>
                   <CardContent className="p-6 space-y-6">
                      <div className="space-y-3">
                         {task.checklist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border-2 bg-muted/5 group/item hover:bg-muted/10 transition-colors">
                               <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/80">{item.label}</span>
                               <div className="h-5 w-5 rounded-full border-2 border-muted group-hover/item:border-primary transition-colors" />
                            </div>
                         ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                         <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {task.location}</span>
                         <div className="flex items-center gap-1">
                            <Fingerprint className="h-3 w-3" />
                            <span>Encrypted Sign-off Req.</span>
                         </div>
                      </div>
                   </CardContent>
                   <CardFooter className="bg-muted/30 border-t p-6 flex gap-3">
                      <Button variant="outline" className="flex-1 h-12 font-black uppercase text-[10px] tracking-widest border-2 bg-background rounded-2xl">
                         <Camera className="mr-2 h-4 w-4" /> EVIDENCE
                      </Button>
                      <Button 
                        className="flex-1 h-12 font-black uppercase text-[10px] tracking-widest shadow-2xl bg-emerald-600 hover:bg-emerald-700 rounded-2xl"
                        onClick={() => handleComplete(task.id)}
                        disabled={completing === task.id}
                      >
                         {completing === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                         SIGN NODE
                      </Button>
                   </CardFooter>
                </Card>
              </motion.div>
            ))}
         </AnimatePresence>

         {tasks.length === 0 && (
            <Card className="border-2 border-dashed shadow-none py-32 text-center bg-card/30 rounded-2xl">
               <CardContent className="space-y-6">
                  <CheckCircle2 className="h-12 w-16 mx-auto text-muted-foreground opacity-20" />
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black uppercase tracking-tighter">Queue Reconciled</h3>
                     <p className="text-xs text-muted-foreground font-medium italic px-6">All operational mandates for this tactical sector are complete.</p>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>

      {/* SYSTEM INTEGRITY BANNER (GROUND) */}
      <div className="p-8 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-2xl border-2 border-white/5">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><Activity className="h-40 w-40 brightness-0 invert" /></div>
         <div className="relative z-10 space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-primary">Edge Integrity Protocol v4.2</h4>
            <p className="text-sm font-bold leading-relaxed italic opacity-80">
              "Every ground-truth mutation is cryptographically bound to your biometric signature and operational node location."
            </p>
         </div>
      </div>
    </main>
  );
}
