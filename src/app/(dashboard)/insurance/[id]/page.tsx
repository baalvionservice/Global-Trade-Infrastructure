'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getPolicyById, InsurancePolicy } from '@/services/insurance-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2, ShieldCheck, FileText, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { PATHS } from '@/lib/paths';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function InsuranceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') return;
    getPolicyById(id)
      .then(setPolicy)
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingClaim(true);
    // Simulation
    setTimeout(() => {
       setSubmittingClaim(false);
       setIsClaimModalOpen(false);
       toast({ title: "Claim Submitted", description: "Our review team will audit the shipment logs and respond within 48 hours." });
       router.push(PATHS.INSURANCE_CLAIMS);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">Policy Record Not Found</h2>
        <Button onClick={() => router.push(PATHS.INSURANCE)} className="mt-4">Return to Protection Center</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.INSURANCE)} className="-ml-2">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Policies
          </Button>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold tracking-tight">Policy {policy.id}</h2>
             <Badge variant="outline" className="uppercase font-bold text-[10px]">{policy.status}</Badge>
          </div>
          <p className="text-muted-foreground">Securing Shipment {policy.shipmentId}</p>
        </div>
        
        <div className="flex gap-2">
           <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="font-bold">
                   <AlertCircle className="mr-2 h-4 w-4" /> File a Claim
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleFileClaim}>
                    <DialogHeader>
                       <DialogTitle>Submit Insurance Claim</DialogTitle>
                       <DialogDescription>Report an incident related to this policy for governance review.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                       <div className="space-y-2">
                          <Label>Claim Reason</Label>
                          <Select required>
                             <SelectTrigger>
                                <SelectValue placeholder="Select reason..." />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="damage">Physical Damage to Cargo</SelectItem>
                                <SelectItem value="loss">Total Loss / Missing Shipment</SelectItem>
                                <SelectItem value="delay">Excessive Transit Delay</SelectItem>
                                <SelectItem value="tamper">Seal Tampering / Theft</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label>Incident Description</Label>
                          <Textarea placeholder="Provide detailed evidence and timestamps..." rows={4} required />
                       </div>
                       <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2 text-blue-700 text-xs">
                          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                          <p>Claims are audited against platform milestone and GPS data for validation.</p>
                       </div>
                    </div>
                    <DialogFooter>
                       <Button type="button" variant="outline" onClick={() => setIsClaimModalOpen(false)}>Cancel</Button>
                       <Button type="submit" disabled={submittingClaim}>
                          {submittingClaim ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Secure Claim"}
                       </Button>
                    </DialogFooter>
                 </form>
              </DialogContent>
           </Dialog>
           <Button variant="outline" className="font-bold">Download Certificate</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-none border">
          <CardHeader>
            <CardTitle className="text-lg">Policy Coverage Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Coverage Tier</p>
                     <p className="text-2xl font-black text-primary capitalize">{policy.coverage}</p>
                     <p className="text-[10px] text-muted-foreground mt-2">Covers loss, damage, and transit delays.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                           <p className="text-xs font-bold text-muted-foreground uppercase">Insured Value</p>
                           <p className="font-bold">${policy.insuredAmount.toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                           <p className="text-xs font-bold text-muted-foreground uppercase">Premium Amount</p>
                           <p className="font-bold">${policy.premium.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 border-l pl-8 border-muted">
                  <div className="flex gap-3">
                     <MapPin className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Risk Corridor</p>
                        <p className="text-sm font-semibold">Shanghai Port → Mumbai Port</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <FileText className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Date of Issuance</p>
                        <p className="text-sm font-semibold">{format(new Date(policy.createdAt), "PPPP")}</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
               <h4 className="text-sm font-bold uppercase">Institutional Underwriting Notes</h4>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  This policy is underwritten by Baalvion Institutional Reinsurance. Claims are subject to verification of bill of lading integrity and port clearance timestamps. Fraudulent claims trigger immediate platform account restriction and regulatory referral.
               </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="shadow-none border bg-primary text-primary-foreground border-none">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Execution Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-10 w-10 opacity-50 shrink-0" />
                    <p className="text-xs leading-relaxed opacity-90">
                       Policy is cryptographically active and linked to Order <span className="font-bold underline">ORD-9921</span>.
                    </p>
                 </div>
                 <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => router.push(`/logistics-shipment/${policy.shipmentId}`)}>
                    Track Insured Cargo
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-start gap-2 text-xs border-b pb-2">
                    <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <div>
                       <p className="font-semibold">Premium Settled</p>
                       <p className="text-muted-foreground">Processed via Institutional Wallet</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-2 text-xs">
                    <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <div>
                       <p className="font-semibold">Policy Created</p>
                       <p className="text-muted-foreground">Linked to shipment SHP-4421</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
