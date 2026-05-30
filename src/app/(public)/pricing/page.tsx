
'use client';

import { Check, ArrowRight, ShieldCheck, Zap, Globe, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PATHS } from "@/lib/paths";
import { cn } from "@/lib/utils";

const pricingTiers = [
  {
    name: "SME Starter",
    price: "$499",
    period: "/month",
    description: "Ideal for growing exporters and importers requiring verified trade execution.",
    features: ["Up to 10 active RFQs", "Integrated Escrow (Standard)", "Basic Logistics Tracking", "KYC/KYB Verification"],
    cta: "Start Scaling",
    highlight: false,
    icon: Zap
  },
  {
    name: "Institutional Pro",
    price: "$1,999",
    period: "/month",
    description: "Advanced capabilities for high-volume traders and mid-market enterprises.",
    features: ["Unlimited RFQs & Orders", "Multi-Currency Finance Cloud", "Advanced IoT Telemetry", "Priority Customs Clearance", "AI Intelligence Insights"],
    cta: "Go Institutional",
    highlight: true,
    icon: Globe
  },
  {
    name: "Enterprise Global",
    price: "Custom",
    period: "",
    description: "Mission-critical infrastructure for multinational corporations and banks.",
    features: ["Private Cloud Option", "SWIFT / ERP Native Connectors", "Sovereign Data Residency", "Dedicated TAM Support", "Full Forensic Audit Access"],
    cta: "Contact Enterprise Sales",
    highlight: false,
    icon: Landmark
  },
  {
    name: "Sovereign Edition",
    price: "Custom",
    period: "",
    description: "The digital trade backbone for national governments and regulators.",
    features: ["Jurisdictional Control Node", "Regulatory Oversight Portal", "HS Code Policy Management", "National Trade Heatmaps", "Crisis Response Command"],
    cta: "Inquire Governance Access",
    highlight: false,
    icon: ShieldCheck
  }
];

export default function PricingPage() {
  return (
    <div className="bg-muted/30 min-h-screen">
      <section className="py-24 text-center">
        <div className="container px-4">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 uppercase font-black tracking-widest border-primary/20 text-primary bg-primary/5">
             Commercialization v4.2
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
            Institutional <br />Pricing Matrix
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground font-medium italic">
            Baalvion provides the digital trade infrastructure to scale global operations with security, compliance, and finality.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={cn(
                "relative overflow-hidden border-2 transition-all hover:shadow-2xl flex flex-col",
                tier.highlight ? "border-primary shadow-xl scale-105 z-10" : "border-border shadow-md"
              )}>
                {tier.highlight && (
                   <div className="absolute top-0 right-0 p-3">
                      <Badge className="bg-primary text-white font-black uppercase text-[8px] tracking-widest border-none">MOST ADOPTED</Badge>
                   </div>
                )}
                <CardHeader className="p-8 pb-4">
                  <div className="p-3 w-fit rounded-xl bg-primary/5 mb-4">
                    <tier.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">{tier.name}</CardTitle>
                  <CardDescription className="font-medium text-xs mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1">
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                    <span className="text-sm font-bold text-muted-foreground uppercase">{tier.period}</span>
                  </div>
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-xs font-semibold text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 border-t bg-muted/20">
                  <Button className="w-full h-12 font-black uppercase tracking-widest text-[10px]" variant={tier.highlight ? "default" : "outline"}>
                    {tier.cta} <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-20 p-12 rounded-[40px] bg-primary text-primary-foreground relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-125">
                <Globe className="h-64 w-64 brightness-0 invert" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Usage-Based Finality</h3>
                   <p className="text-lg opacity-80 font-medium italic">
                      "Scale your costs with your trade volume. All tiers include per-transaction fees that ensure your infrastructure spend matches your commercial execution."
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-8 shrink-0">
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">RFQ Fee</p>
                      <p className="text-2xl font-black">$5.00</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">Settlement</p>
                      <p className="text-2xl font-black">0.1%</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
