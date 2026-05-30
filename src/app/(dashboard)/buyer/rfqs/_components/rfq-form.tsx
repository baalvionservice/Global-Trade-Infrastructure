'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createRfq } from "@/services/rfq-service";
import { PATHS } from "@/lib/paths";
import { useState } from "react";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, Box, DollarSign, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: 'Product Info', icon: Box },
  { id: 2, title: 'Commercials', icon: DollarSign },
  { id: 3, title: 'Logistics', icon: Truck },
];

export function RFQForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      productName: "",
      category: "",
      quantity: 0,
      unit: "Units",
      targetPrice: 0,
      currency: "USD",
      deliveryCountry: "",
      deliveryDate: "",
      description: "",
      pricingModel: "FOB"
    },
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    try {
      const newRfq = await createRfq(values);
      toast({
        title: "RFQ Published",
        description: `Order signal ${newRfq.id} broadcast to verified supplier network.`,
      });
      router.push(`${PATHS.BUYER_RFQS}/${newRfq.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kernel Error",
        description: "Could not finalize sourcing mandate.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto pb-20">
        {/* Step Indicator */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              {steps.map((step) => (
                 <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                    <div className={cn(
                       "h-12 w-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                       currentStep >= step.id ? "bg-primary border-primary text-white shadow-lg" : "bg-background border-muted text-muted-foreground"
                    )}>
                       <step.icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                       "text-[10px] font-black uppercase tracking-widest",
                       currentStep >= step.id ? "text-primary" : "text-muted-foreground opacity-40"
                    )}>{step.title}</span>
                 </div>
              ))}
              {/* Connector Lines */}
              <div className="absolute top-[24px] left-0 right-0 h-0.5 bg-muted -z-0 mx-24 hidden md:block" />
              <div 
                className="absolute top-[24px] left-0 h-0.5 bg-primary -z-0 transition-all duration-500 ease-in-out mx-24 hidden md:block" 
                style={{ width: `calc(${(currentStep - 1) / (steps.length - 1) * 100}% - 48px)` }}
              />
           </div>
           <Progress value={(currentStep / steps.length) * 100} className="h-1 bg-muted md:hidden" />
        </div>

        {currentStep === 1 && (
          <Card className="shadow-xl border-2 animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 border-b p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">1. Strategic Requirement</CardTitle>
              <CardDescription className="font-medium italic">Define the product specifications for the global ledger.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="productName"
                  rules={{ required: "Product identity is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 550W Solar PV Modules" {...field} className="h-12 border-2 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Industrial Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 rounded-xl">
                            <SelectValue placeholder="Select Sector..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Metals">Industrial Metals</SelectItem>
                          <SelectItem value="Energy">Renewable Energy</SelectItem>
                          <SelectItem value="Electronics">Subsystem Electronics</SelectItem>
                          <SelectItem value="Chemicals">Specialty Chemicals</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Forensic Specifications</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail the technical standards (ISO, CE) and material grade required." 
                        rows={6}
                        {...field} 
                        className="border-2 rounded-2xl p-6 italic font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="shadow-xl border-2 animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 border-b p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">2. Commercial Mandate</CardTitle>
              <CardDescription className="font-medium italic">Finalize volume and target settlement thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                   <div className="flex gap-2">
                     <FormField
                       control={form.control}
                       name="quantity"
                       render={({ field }) => (
                         <FormItem className="flex-1">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Volume</FormLabel>
                           <FormControl>
                             <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-12 border-2 rounded-xl" />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="unit"
                       render={({ field }) => (
                         <FormItem className="w-32">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger className="h-12 border-2 rounded-xl">
                                 <SelectValue />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               <SelectItem value="Units">UNITS</SelectItem>
                               <SelectItem value="MT">MT</SelectItem>
                               <SelectItem value="KG">KG</SelectItem>
                               <SelectItem value="Sets">SETS</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex gap-2">
                     <FormField
                       control={form.control}
                       name="targetPrice"
                       render={({ field }) => (
                         <FormItem className="flex-1">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Price (Unit)</FormLabel>
                           <FormControl>
                             <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-12 border-2 rounded-xl" />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="currency"
                       render={({ field }) => (
                         <FormItem className="w-32">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Currency</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger className="h-12 border-2 rounded-xl">
                                 <SelectValue />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               <SelectItem value="USD">USD</SelectItem>
                               <SelectItem value="EUR">EUR</SelectItem>
                               <SelectItem value="SGD">SGD</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="pricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pricing Basis (Incoterm)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                        <SelectItem value="CIF">CIF (Cost, Insurance, Freight)</SelectItem>
                        <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                        <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="shadow-xl border-2 animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 border-b p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">3. Logistics Node</CardTitle>
              <CardDescription className="font-medium italic">Define jurisdictional targets and transit finality.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="deliveryCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destination Node (Country)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. United States" {...field} className="h-12 border-2 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Arrival Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-12 border-2 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex gap-4 text-primary">
                 <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                 <p className="text-xs font-bold leading-relaxed">
                   By publishing this RFQ, you authorize the platform to broadcast your requirements to verified institutional sellers in the target corridor. All responses will be recorded on the global discovery ledger.
                 </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center gap-4 bg-background/80 backdrop-blur-xl border-2 p-6 rounded-2xl shadow-2xl sticky bottom-10 z-30">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={prevStep} 
            disabled={currentStep === 1 || isSubmitting}
            className="h-12 px-8 font-black uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {currentStep < steps.length ? (
            <Button 
              type="button" 
              onClick={nextStep} 
              className="h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl"
            >
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl bg-primary"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Publish RFQ
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

