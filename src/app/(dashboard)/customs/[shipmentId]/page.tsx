
/**
 * @file customs/[shipmentId]/page.tsx
 * @description The National Customs Workbench. Orchestrates jurisdictional audit,Hold/Release logic, and duties assessment.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getCustomsData, 
  getCountryRules, 
  submitForClearance, 
  placeCustomsHold,
  recordInspection,
  CustomsData, 
  RegulatoryRule 
} from '@/services/customs-service';
import { getShipmentById, Shipment } from '@/services/logistics-service';
import { CustomsStatusTimeline } from './_components/customs-status-timeline';
import { CustomsDocumentList } from './_components/customs-document-list';
import { CostBreakdown } from './_components/cost-breakdown';
import { RegulatoryRulesPanel } from './_components/regulatory-rules-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, Loader2, Scale, ShieldCheck, FileText, 
  AlertTriangle, ExternalLink, Building2, CheckCircle2, 
  XCircle, Gavel, Search, Landmark, History, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CustomsDetailPage() {
  const { shipmentId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [customs, setCustoms] = useState<CustomsData | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [originRules, setOriginRules] = useState<RegulatoryRule | null>(null);
  const [destRules, setDestRules] = useState<RegulatoryRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const fetchData = async () => {
    if (typeof shipmentId !== 'string') return;
    const [cData, sData] = await Promise.all([
      getCustomsData(shipmentId),
      getShipmentById(shipmentId)
    ]);

    setCustoms(cData);
    setShipment(sData);

    if (cData) {
      const [oR, dR] = await Promise.all([
        getCountryRules(cData.originCountry),
        getCountryRules(cData.destinationCountry)
      ]);
      setOriginRules(oR);
      setDestRules(dR);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [shipmentId]);

  const handleAction = async (action: 'hold' | 'release') => {
    if (!customs) return;
    setProcessing(true);
    try {
      if (action === 'hold') {
        await placeCustomsHold(customs.id, holdReason);
        toast({ title: "Customs Hold Issued", description: "Shipment node restricted pending further audit." });
      } else {
        await recordInspection(customs.id, 'CUS-OFFICER-001', 'Verified digital dossier matches manifest.', 'cleared');
        toast({ title: "Customs Released", description: "Shipment cleared for outbound logistics." });
      }
      await fetchData();
    } catch (e) {
      toast({ variant: "destructive", title: "Action failed" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Jurisdictional Gateway...</p>
      </div>
    );
  }

  if (!customs || !shipment) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Entry Not Found</h2>
        <Button onClick={() => router.push(PATHS.LOGISTICS_SHIPMENT)} className="mt-6 font-black uppercase text-[10px] h-12 px-8">Return to Control Tower</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-primary">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Shipment
          </Button>
          <div className="flex items-center gap-5">
             <h2 className="text-3xl font-black tracking-tight uppercase tracking-tighter text-foreground">Customs Entry Node</h2>
             <Badge variant="outline" className={cn(
               "uppercase font-black text-[10px] px-4 py-1.5 border-2 shadow-sm rounded-full",
               customs.status === 'hold' ? "bg-red-50 text-red-700 border-red-200" : "bg-primary/5 text-primary border-primary/20"
             )}>
                {customs.status?.toUpperCase()}
             </Badge>
          </div>
          <p className="text-muted-foreground font-medium italic">Classification: <span className="font-mono font-black text-foreground">{customs.hts_code || 'UNCLASSIFIED'}</span></p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           {customs.status !== 'cleared' && (
             <>
               <Dialog>
                 <DialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 font-black h-12 px-8 text-[10px] uppercase tracking-widest border-2 bg-background rounded-2xl">
                      <AlertTriangle className="mr-2 h-4 w-4" /> ISSUE HOLD
                    </Button>
                 </DialogTrigger>
                 <DialogContent>
                    <DialogHeader>
                       <DialogTitle>Issue Regulatory Hold</DialogTitle>
                       <DialogDescription>Placing a hold will freeze logistics movement and trigger a platform compliance escalation.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Violation Reasoning</Label>
                       <Textarea 
                         placeholder="e.g. HS Code mismatch found during document audit..." 
                         rows={4}
                         value={holdReason}
                         onChange={(e) => setHoldReason(e.target.value)}
                         className="font-bold border-2"
                       />
                    </div>
                    <DialogFooter>
                       <Button onClick={() => handleAction('hold')} disabled={processing || !holdReason} variant="destructive" className="w-full font-black uppercase tracking-widest h-14">AUTHORIZE SYSTEMIC HOLD</Button>
                    </DialogFooter>
                 </DialogContent>
               </Dialog>

               <Button onClick={() => handleAction('release')} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 font-black h-12 px-6 text-[10px] uppercase tracking-widest shadow-2xl rounded-2xl">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> AUTHORIZE RELEASE
               </Button>
             </>
           )}
           <Button variant="outline" size="sm" className="font-black h-12 px-8 text-[10px] uppercase tracking-widest border-2 shadow-sm bg-background rounded-2xl">
              <FileText className="mr-2 h-4 w-4" /> EXPORT TARIFF REPORT
           </Button>
        </div>
      </div>

      <div className="bg-card border-2 rounded-2xl p-6 shadow-xl relative overflow-hidden ring-1 ring-black/5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-12 text-center">Jurisdictional Clearance Workflow</h3>
        <CustomsStatusTimeline status={customs.status || ''} />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           <div className="grid sm:grid-cols-2 gap-6">
              <CustomsDocumentList shipmentId={customs.shipmentId || ''} />
              <CostBreakdown data={customs} />
           </div>
           
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6">
                 <CardTitle className="text-sm font-black uppercase tracking-wide flex items-center gap-3">
                    <History className="h-5 w-5 text-primary opacity-30" />
                    Regulatory Audit Ledger
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 <div className="divide-y-2">
                    {[
                      { action: 'DECLARATION_SUBMITTED', actor: 'Automated Gateway', time: '14m ago', status: 'success' },
                      { action: 'DOC_VERIFICATION_PASS', actor: 'Validation Engine', time: '12m ago', status: 'success' },
                      { action: 'SYSTEM_AUDIT_FLAGS', actor: 'Risk Oracle', time: '5m ago', status: 'warning' },
                    ].map(log => (
                       <div key={log.action} className="py-6 first:pt-0 last:pb-0 flex items-center justify-between">
                          <div className="space-y-1">
                             <p className="text-xs font-black uppercase tracking-tight">{log.action}</p>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{log.actor} • {log.time}</p>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase h-5 px-2 border-2",
                            log.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                          )}>{log.status}</Badge>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <RegulatoryRulesPanel origin={originRules} destination={destRules} />
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Scale className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <Gavel className="h-5 w-5 text-white" />
                    Authority Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "This entry is being audited by the <span className="font-bold underline text-white">{customs.destinationCountry} Customs Authority</span>. All operational logic is recorded in the platform's immutable vault."
                 </p>
                 <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Inspector</span>
                       <span className="text-[11px] font-black uppercase">{customs.inspectedBy || 'PENDING ASSIGNMENT'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Audit Signature</span>
                       <span className="text-[9px] font-mono opacity-60">0x88f...AUDIT_READY</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none">
                    GENERATE AUDIT PACKAGE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all">
              <ShieldCheck className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-40 transition-all" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-widest">Protocol Governance</p>
                 <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic px-4">
                    "Jurisdictional overrides require two-key authority sign-off and are escalated to the National Trade Command for review."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">CONTACT COMPLIANCE DESK</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
