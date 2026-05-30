
'use client';

/**
 * @file governance/disputes/[id]/page.tsx
 * @description Institutional Arbitration Workspace.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { disputeService } from '@/services/dispute-service';
import { evidenceService } from '@/services/evidence-service';
import { DisputeCase, EvidenceRecord } from '@/types/institutional';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Loader2, 
  Gavel, 
  Scale, 
  FileText, 
  ShieldCheck, 
  Lock, 
  History, 
  Activity, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  MessageSquare,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/lib/paths';
import { InstitutionalTimeline } from '@/components/shared/institutional-timeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ArbitrationWorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [dispute, setDispute] = useState<DisputeCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolutionText, setResolutionLogic] = useState('');

  const fetchData = async () => {
    if (typeof id !== 'string') return;
    const [caseData, evidenceData] = await Promise.all([
      disputeService.getDisputeById(id),
      evidenceService.getEvidenceForCase(id)
    ]);
    setDispute(caseData);
    setEvidence(evidenceData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleResolve = async (outcome: string) => {
    if (!dispute) return;
    setResolving(true);
    try {
      await disputeService.resolveCase(dispute.id, 'ARBITER-001', outcome, resolutionText);
      toast({ title: "Resolution Issued", description: "Binding decision has been broadcast to all parties and recorded on the ledger." });
      fetchData();
    } catch (e) {
      toast({ variant: 'destructive', title: "Resolution Failed" });
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!dispute) {
    return <div className="h-[80vh] flex flex-col items-center justify-center p-8">Case not found.</div>;
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.OVERSIGHT_DISPUTES)} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary transition-all">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Registry
          </Button>
          <div className="flex items-center gap-5">
             <h2 className="text-3xl font-black tracking-tight uppercase tracking-tighter text-foreground">Arbitration Workspace</h2>
             <Badge variant="outline" className="uppercase font-black text-[10px] px-4 py-1.5 border-2 bg-primary/5 text-primary border-primary/20 rounded-full">
                {dispute.id} • {dispute.status.toUpperCase()}
             </Badge>
          </div>
          <p className="text-muted-foreground font-medium italic">Legal Mandate: <span className="font-bold underline underline-offset-4">{dispute.title}</span></p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           {dispute.status !== 'RESOLVED' && (
             <Dialog>
                <DialogTrigger asChild>
                   <Button className="bg-emerald-600 hover:bg-emerald-700 font-black h-12 px-6 text-[10px] uppercase tracking-widest shadow-2xl rounded-2xl">
                      <Gavel className="mr-2 h-4 w-4" /> ISSUE RULING
                   </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                   <DialogHeader>
                      <DialogTitle>Issue Binding Resolution</DialogTitle>
                   </DialogHeader>
                   <div className="py-6 space-y-4">
                      <div className="space-y-2">
                         <Label>Arbiter Logic & Reasoning</Label>
                         <Textarea 
                           placeholder="Provide forensic justification for this ruling..." 
                           rows={6}
                           value={resolutionText}
                           onChange={(e) => setResolutionLogic(e.target.value)}
                         />
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs italic">
                         "Rules of Procedure: Rulings are final, binding, and immediately trigger state changes across logistics and treasury nodes."
                      </div>
                   </div>
                   <DialogFooter className="flex-col sm:flex-col gap-2">
                      <Button onClick={() => handleResolve('CLAIM_AUTHORIZED')} disabled={resolving || !resolutionText} className="w-full">Authorize Claim Payment</Button>
                      <Button variant="outline" onClick={() => handleResolve('DISPUTE_DISMISSED')} disabled={resolving || !resolutionText} className="w-full">Dismiss & Release Funds</Button>
                   </DialogFooter>
                </DialogContent>
             </Dialog>
           )}
           <Button variant="outline" className="font-black h-12 px-8 text-[10px] uppercase tracking-widest border-2 shadow-sm bg-background rounded-2xl">
              <FileText className="mr-2 h-4 w-4" /> EXPORT CASE DOSSIER
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* EVIDENCE DOSSIER */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-sm font-black uppercase tracking-wide">Forensic Evidence Dossier</CardTitle>
                    <CardDescription className="text-xs">Immutable evidence records submitted by participants for case review.</CardDescription>
                 </div>
                 <Badge variant="outline" className="text-[9px] font-black border-2 h-6 uppercase px-3 rounded-full">{evidence.length} ASSETS</Badge>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="grid sm:grid-cols-2 gap-6">
                    {evidence.map(item => (
                       <div key={item.id} className="p-6 rounded-3xl border-2 bg-muted/5 group hover:border-primary/40 transition-all cursor-default">
                          <div className="flex items-center justify-between mb-4">
                             <div className="p-3 rounded-2xl bg-background border-2 shadow-inner group-hover:scale-105 transition-transform">
                                <FileText className="h-5 w-5 text-primary opacity-60" />
                             </div>
                             <Badge variant="outline" className="text-[8px] font-black uppercase h-5 px-2 border-2 bg-background">{item.type}</Badge>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-black uppercase tracking-tight truncate">{item.title}</p>
                             <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 tracking-widest">Submitted By: {item.submittedBy}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-muted/50 flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                                {item.isVerified ? (
                                   <div className="flex items-center gap-1 text-emerald-600 text-[8px] font-black uppercase tracking-tighter">
                                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                                   </div>
                                ) : (
                                   <span className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter opacity-40">PENDING AUDIT</span>
                                )}
                             </div>
                             <ExternalLink className="h-3 w-3 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                          </div>
                       </div>
                    ))}
                    <div className="p-8 border-2 border-dashed rounded-3xl text-center space-y-4 hover:bg-muted/30 transition-all cursor-pointer group">
                       <Plus className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submit Legal Evidence</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* OPERATIONAL REPLAY (TIMELINE) */}
           <Card className="shadow-none border-2 bg-background p-6 rounded-2xl">
              <InstitutionalTimeline events={[]} />
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* ARBITER NODE */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Scale className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <Scale className="h-5 w-5 text-white" />
                    Adjudication Authority
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "This case is being mediated by the <span className="font-bold underline text-white">Baalvion Adjudication Hub</span>. Neutral Arbiter assigned for independent forensic review."
                 </p>
                 <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Neutral Arbiter</span>
                       <span className="text-[11px] font-black uppercase">{dispute.arbitratorId || 'NOT ASSIGNED'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Settlement Hold</span>
                       <Badge className="bg-orange-400 text-orange-950 text-[9px] font-black px-2 uppercase tracking-tighter h-5 rounded-full border-none">ACTIVE</Badge>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none">
                    INITIATE HEARING
                 </Button>
              </CardContent>
           </Card>

           {/* CASE PARTICIPANTS */}
           <Card className="shadow-none border-2 bg-background rounded-2xl">
              <CardHeader className="border-b bg-muted/10 py-6 px-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Case Participants</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { role: 'Initiator', name: 'Beacon Tech Solutions', id: dispute.initiatorId },
                   { role: 'Respondent', name: 'Global Power Systems', id: dispute.respondentId }
                 ].map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/10 group hover:border-primary/40 transition-all cursor-pointer">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest">{p.role}</p>
                          <p className="text-xs font-black uppercase tracking-tight leading-none text-foreground">{p.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">{p.id}</p>
                       </div>
                       <MessageSquare className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                 ))}
                 <Button variant="ghost" className="w-full h-12 text-[10px] font-black uppercase text-primary hover:bg-primary/5 mt-4 tracking-widest border-2 border-dashed border-primary/20 rounded-2xl">Create Collaboration Room</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
