'use client';

/**
 * @file booking/page.tsx
 * @description Institutional Logistics Booking Wizard. 
 * Orchestrates the transition from Commercial Order to Logistics Mandate.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { getCarriers, Carrier } from '@/services/carrier-service';
import { Badge } from '@/components/ui/badge';
import { logisticsAdapterFactory } from '@/services/logistics/adapter-factory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Anchor, 
  Globe, 
  ShieldCheck, 
  Activity,
  Zap,
  CheckCircle2,
  Box,
  MapPin
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogisticsBookingWizard() {
  const [step, setStep] = useState(1);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    targetArrival: '',
    carrierId: '',
    cost: 0,
    containerType: '40ft_STANDARD'
  });
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    getCarriers().then(setCarriers);
  }, []);

  const selectedCarrier = carriers.find(c => c.id === formData.carrierId);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinalize = async () => {
    setProcessing(true);
    try {
      // 1. Resolve Carrier Adapter
      const adapter = logisticsAdapterFactory.getAdapter(formData.carrierId);
      
      // 2. Dispatch Booking Mandate
      const response = await adapter.bookShipment({
        origin: formData.origin,
        destination: formData.destination,
        carrierId: formData.carrierId,
        carrierName: selectedCarrier?.name || 'Carrier Node'
      } as any);

      if (response.success) {
        // 3. Persist Shipment Node in Platform Registry (snake_case trade-service model)
        const shipRes = await apiClient.post('/shipments', {
          tracking_number: response.trackingNumber,
          carrier_id: formData.carrierId,
          carrier_name: selectedCarrier?.name,
          origin: formData.origin,
          destination: formData.destination,
          estimated_arrival: response.estimatedDelivery,
          status: 'booked',
          value: 1250000, // Mocked from linked order
          currency: 'USD',
          milestones: []
        });

        toast({ title: "Booking Finalized", description: "Logistics mandate synchronized on the global ledger." });
        router.push(`/logistics-shipment/${(shipRes.data as any)?.id}`);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: "Orchestration Failure", description: "Could not establish carrier handshake." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Provisioning node: FREIGHT_WIZARD_V4</p>
           </div>
           <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-none text-foreground">Logistics Booking.</h2>
           <p className="text-muted-foreground font-medium italic text-lg">"Standardized multi-step flow for institutional cargo procurement and corridor activation."</p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center justify-between px-6 relative">
           <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />
           <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700" style={{ width: `${(step-1) / 2 * 100}%` }} />
           
           {[1, 2, 3].map((s) => (
             <div key={s} className="relative z-10 flex flex-col items-center gap-4 bg-muted/20 p-2 rounded-full">
                <div className={cn(
                  "h-12 w-12 rounded-full border-4 flex items-center justify-center font-black transition-all duration-500",
                  step >= s ? "bg-primary border-background text-white shadow-xl scale-110" : "bg-muted border-muted text-muted-foreground"
                )}>
                  {s}
                </div>
                <span className={cn(
                  "absolute top-full mt-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                  step >= s ? "text-primary" : "text-muted-foreground opacity-40"
                )}>
                   {s === 1 ? 'ROUTE_CONTEXT' : s === 2 ? 'CARRIER_DISCOVERY' : 'MANDATE_FINALITY'}
                </span>
             </div>
           ))}
        </div>

        <div className="pt-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <Card className="shadow-2xl border-2 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b p-6">
                       <CardTitle className="text-xl font-black uppercase tracking-tighter">1. Route Definition</CardTitle>
                       <CardDescription className="font-medium italic">Define origin and destination nodes for the global discovery grid.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Origin Hub (Port/Terminal)</Label>
                          <div className="relative group">
                             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                             <Input 
                                placeholder="e.g. Port of Shanghai (CNSHA)" 
                                className="h-14 pl-12 border-2 font-bold rounded-2xl"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                             />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destination Hub (Port/Terminal)</Label>
                          <div className="relative group">
                             <Anchor className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                             <Input 
                                placeholder="e.g. Port of Long Beach (USLGB)" 
                                className="h-14 pl-12 border-2 font-bold rounded-2xl"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                             />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Arrival Window</Label>
                          <Input 
                             type="date" 
                             className="h-14 border-2 font-bold rounded-2xl"
                             value={formData.targetArrival}
                             onChange={(e) => setFormData({ ...formData, targetArrival: e.target.value })}
                          />
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Configuration</Label>
                          <Select defaultValue={formData.containerType}>
                             <SelectTrigger className="h-14 border-2 font-bold rounded-2xl">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="40ft_STANDARD">40FT STANDARD CONTAINER</SelectItem>
                                <SelectItem value="20ft_STANDARD">20FT STANDARD CONTAINER</SelectItem>
                                <SelectItem value="REEFER">COLD-CHAIN REEFER</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-6 flex justify-end">
                       <Button onClick={handleNext} disabled={!formData.origin || !formData.destination} className="h-14 px-6 font-black uppercase tracking-widest text-xs shadow-xl">
                          DISCOVER CARRIERS <ChevronRight className="ml-2 h-4 w-4" />
                       </Button>
                    </CardFooter>
                 </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <Card className="shadow-2xl border-2 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b p-6">
                       <CardTitle className="text-xl font-black uppercase tracking-tighter">2. Carrier Marketplace</CardTitle>
                       <CardDescription className="font-medium italic">Select a verified institutional logistics provider for this corridor.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                       {carriers.map((carrier) => (
                          <div 
                             key={carrier.id} 
                             className={cn(
                                "flex flex-col md:flex-row items-center justify-between p-8 rounded-2xl border-2 transition-all cursor-pointer group",
                                formData.carrierId === carrier.id ? "bg-primary text-white border-primary shadow-2xl scale-[1.02]" : "bg-muted/5 border-primary/5 hover:border-primary/20"
                             )}
                             onClick={() => setFormData({ ...formData, carrierId: carrier.id })}
                          >
                             <div className="flex items-center gap-8">
                                <div className="h-12 w-16 rounded-2xl bg-background border-2 flex items-center justify-center font-black text-2xl text-primary shadow-inner">
                                   {carrier.logo}
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-2xl font-black uppercase tracking-tighter">{carrier.name}</h4>
                                   <div className="flex items-center gap-4">
                                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-2", formData.carrierId === carrier.id ? 'text-white border-white/20' : 'text-primary')}>{carrier.avgDeliveryTime} AVG</Badge>
                                      <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                                         <ShieldCheck className="h-3 w-3" /> VERIFIED PROVIDER
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-2 mt-6 md:mt-0 border-l-2 pl-12 border-muted/20">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sovereign Quote</p>
                                <p className="text-3xl font-black tracking-tighter tabular-nums">${carrier.startingPrice.toLocaleString()}</p>
                                <p className="text-[8px] font-bold uppercase opacity-40">All-Inclusive Finality</p>
                             </div>
                          </div>
                       ))}
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t p-6 flex justify-between">
                       <Button variant="ghost" onClick={handleBack} className="font-black uppercase tracking-widest text-xs"><ChevronLeft className="mr-2 h-4 w-4" /> RE-ALIGN ROUTE</Button>
                       <Button onClick={handleNext} disabled={!formData.carrierId} className="h-14 px-6 font-black uppercase tracking-widest text-xs shadow-xl">
                          REVIEW MANDATE <ChevronRight className="ml-2 h-4 w-4" />
                       </Button>
                    </CardFooter>
                 </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <Card className="shadow-2xl border-none bg-primary text-white rounded-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
                       <Zap className="h-64 w-64 brightness-0 invert" />
                    </div>
                    <CardHeader className="bg-white/5 border-b border-white/10 p-6 relative z-10">
                       <CardTitle className="text-3xl font-black uppercase tracking-tighter">3. Execution Mandate</CardTitle>
                       <p className="text-white/60 font-medium italic mt-2 uppercase text-xs tracking-widest">Final Authorization & Ledger Finality</p>
                    </CardHeader>
                    <CardContent className="p-6 relative z-10 space-y-8">
                       <div className="grid md:grid-cols-2 gap-16">
                          <div className="space-y-6">
                             <div className="flex gap-6">
                                <div className="p-4 rounded-2xl bg-white/10 border border-white/20"><Globe className="h-8 w-8 text-emerald-400" /></div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Corridor Definition</p>
                                   <p className="text-2xl font-black uppercase tracking-tight">{formData.origin} ↔ {formData.destination}</p>
                                </div>
                             </div>
                             <div className="flex gap-6">
                                <div className="p-4 rounded-2xl bg-white/10 border border-white/20"><Ship className="h-8 w-8 text-blue-400" /></div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Authorized Carrier</p>
                                   <p className="text-2xl font-black uppercase tracking-tight">{selectedCarrier?.name}</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Settlement Value</p>
                                <p className="text-4xl font-black tracking-tighter text-emerald-400">${(selectedCarrier?.startingPrice || 0).toLocaleString()}</p>
                                <p className="text-[8px] font-bold uppercase text-white/20">Includes Jurisdictional Node Fees</p>
                             </div>
                             <div className="w-full h-px bg-white/10" />
                             <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/60">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" /> DETERMINISTIC FINALITY
                             </div>
                          </div>
                       </div>

                       <div className="p-8 bg-white/10 border border-white/20 rounded-2xl flex gap-6 items-start">
                          <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0 mt-1" />
                          <p className="text-base font-bold italic leading-relaxed opacity-90 leading-tight">
                            "By finalizing this booking, you authorize the sovereign kernel to provision a dedicated logistics node and lock the commercial terms on the global ledger. This action is irreversible once the carrier handshake is signed."
                          </p>
                       </div>
                    </CardContent>
                    <CardFooter className="bg-white/5 border-t border-white/10 p-6 flex justify-between relative z-10">
                       <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs">
                          <ChevronLeft className="mr-2 h-4 w-4" /> ADJUST SELECTION
                       </Button>
                       <Button 
                          onClick={handleFinalize} 
                          disabled={processing}
                          className="h-14 px-16 bg-white text-primary font-black uppercase tracking-wide text-base shadow-lg hover:scale-105 transition-all rounded-2xl"
                       >
                          {processing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Rocket className="mr-3 h-6 w-6" />}
                          AUTHORIZE & BOOK
                       </Button>
                    </CardFooter>
                 </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function Rocket(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>
}
