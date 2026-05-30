'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgentById, hireAgent, Agent } from '@/services/agent-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, Loader2, Star, ShieldCheck, CheckCircle2, 
  MapPin, Award, Building2, Briefcase, Send, MessageSquare 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/lib/paths';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AgentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') return;
    getAgentById(id)
      .then(setAgent)
      .finally(() => setLoading(false));
  }, [id]);

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    setHiring(true);
    try {
      await hireAgent({
        agentId: agent.id,
        type: "Customs Support Request",
        shipmentId: "SHP-4421" // Mock
      });
      setIsHireModalOpen(false);
      toast({ title: "Request Sent", description: `${agent.name} has been notified of your service request.` });
      router.push(PATHS.AGENT_REQUESTS);
    } catch (e) {
      toast({ variant: "destructive", title: "Hiring Failed" });
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold">Agent Not Found</h2>
        <Button onClick={() => router.push(PATHS.AGENTS)} className="mt-4">Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Marketplace
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="h-14 w-20 rounded-2xl bg-background border-2 border-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-sm">
                 {agent.logo}
              </div>
              <div>
                 <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
                 <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center text-yellow-500">
                       <Star className="h-4 w-4 fill-current" />
                       <span className="text-sm font-bold ml-1">{agent.rating} / 5.0</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">ID: {agent.id}</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-2">
              <Dialog open={isHireModalOpen} onOpenChange={setIsHireModalOpen}>
                <DialogTrigger asChild>
                  <Button className="font-bold"><Briefcase className="mr-2 h-4 w-4" /> Hire Agent</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                   <form onSubmit={handleHire}>
                      <DialogHeader>
                         <DialogTitle>Hire {agent.name}</DialogTitle>
                         <DialogDescription>Submit a formal service request for your trade operations.</DialogDescription>
                      </DialogHeader>
                      <div className="py-6 space-y-4">
                         <div className="space-y-2">
                            <Label>Service Type</Label>
                            <Select required>
                               <SelectTrigger>
                                  <SelectValue placeholder="Select service..." />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="clearance">Customs Clearance Support</SelectItem>
                                  <SelectItem value="inspection">Pre-Shipment Inspection</SelectItem>
                                  <SelectItem value="logistics">Local Logistics Facilitation</SelectItem>
                                  <SelectItem value="advisory">Trade Compliance Advisory</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label>Linked Shipment / Order</Label>
                            <Select required>
                               <SelectTrigger>
                                  <SelectValue placeholder="Select active trade..." />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="SHP-4421">SHP-4421 (Solar PV Modules)</SelectItem>
                                  <SelectItem value="ORD-8812">ORD-8812 (Steel Coils)</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label>Operational Notes</Label>
                            <Textarea placeholder="Provide specific instructions or deadlines..." rows={3} />
                         </div>
                      </div>
                      <DialogFooter>
                         <Button type="button" variant="outline" onClick={() => setIsHireModalOpen(false)}>Cancel</Button>
                         <Button type="submit" disabled={hiring}>
                            {hiring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Hire Request
                         </Button>
                      </DialogFooter>
                   </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="font-bold"><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-none border">
              <CardHeader>
                 <CardTitle className="text-lg">Professional Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
                 <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t">
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-primary" /> Strategic Regions
                       </h4>
                       <p className="font-bold text-sm">{agent.region}</p>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Award className="h-3 w-3 text-primary" /> Verified Certifications
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {agent.certifications.map(cert => (
                             <Badge key={cert} variant="secondary" className="text-[10px] bg-muted/50">{cert}</Badge>
                          ))}
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border">
              <CardHeader>
                 <CardTitle className="text-lg">Operational History</CardTitle>
                 <CardDescription>Recent service completions on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    {[1, 2].map(i => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {i === 1 ? 'EC' : 'VA'}
                             </div>
                             <div>
                                <p className="text-xs font-bold">{i === 1 ? 'Energy Corp International' : 'Vietnam Auto Parts'}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">Service: Customs Brokerage • Feb 2024</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                             <Star className="h-3 w-3 fill-current" />
                             <span className="text-xs font-bold">5.0</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="shadow-none border bg-primary text-primary-foreground border-none">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Security Clearance
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs leading-relaxed opacity-90">
                    This agent is a Tier-1 platform partner with a cryptographically verified audit history. All communications and documents exchanged are stored in the Baalvion Immutable Vault.
                 </p>
                 <div className="p-2 rounded bg-white/10 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-300" />
                    <span className="text-[10px] font-bold">Background Check Completed</span>
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border">
              <CardHeader className="pb-3">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest">Pricing Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Standard Service Fee</span>
                    <span className="font-bold">USD 450.00</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Priority Processing</span>
                    <span className="font-bold">+ USD 150.00</span>
                 </div>
                 <Separator />
                 <p className="text-[10px] italic text-muted-foreground">
                    *Final pricing is determined by agent quote following service request evaluation.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
