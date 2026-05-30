import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GanttChartSquare, Landmark, ShieldCheck, Truck, ArrowRight, AreaChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PATHS } from "@/lib/paths";

export const metadata: Metadata = {
  title: 'Global Trade OS for Enterprises',
  description: 'Consolidate your global trade operations. Baalvion provides enterprises with a shared source of truth for execution, finance, and logistics.',
};

export default function EnterprisesPage() {
  const capabilities: { title: string, description: string, icon: LucideIcon, features: string[] }[] = [
    {
      title: "Trade Execution Made Simple",
      description: "Manage contracts, purchase orders, and shipments with structured workflows that reduce errors and accelerate time-to-market.",
      icon: GanttChartSquare,
      features: [
        "Centralized contract and order management",
        "Automated document generation and tracking",
        "Integrated communication between all trade partners"
      ]
    },
    {
      title: "Integrated Finance & Settlement",
      description: "Optimize working capital and automate payments with embedded trade finance, FX management, and settlement orchestration.",
      icon: Landmark,
       features: [
        "Automated invoicing and payment reconciliation",
        "Seamless integration with your banking partners",
        "Real-time liquidity and risk monitoring"
      ]
    },
    {
      title: "Compliance & Risk Intelligence",
      description: "Stay audit-ready and compliant with regulations, while mitigating operational and counterparty risks.",
      icon: ShieldCheck,
       features: [
        "Real-time KYC/AML checks on counterparties",
        "Automated compliance alerts and workflows",
        "AI-driven supplier and partner risk scoring"
      ]
    },
    {
      title: "Smart Logistics & Shipment Tracking",
      description: "Track shipments, milestones, and delivery performance with integrated logistics intelligence.",
      icon: Truck,
      features: [
        "End-to-end shipment visibility from origin to destination",
        "Predictive alerts for potential delays or bottlenecks",
        "Integration with multiple logistics providers and carriers"
      ]
    }
  ];

  return (
    <div className="flex flex-col bg-background text-foreground">
      <section className="py-24 md:py-32 bg-muted/50 border-b">
        <div className="container text-center px-4 md:px-6 mx-auto">
          <div className="mx-auto max-w-4xl flex flex-col items-center space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">For Global Enterprises</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
              Streamlined Trade Operations for Global Enterprises
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
              Baalvion empowers enterprises to manage trade execution, finance, compliance, and logistics from a single, unified platform. Scale your operations with security, transparency, and efficiency at every step.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Button size="lg" asChild>
                  <Link href={PATHS.ACCESS_REQUEST}>Request Enterprise Access <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 mx-auto">
           <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">From Fragmentation to Integration</h2>
            <p className="text-lg text-muted-foreground">Replace siloed systems and manual processes with a single source of truth for your trade activities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
             {capabilities.map((capability) => (
              <Card key={capability.title} className="bg-card border shadow-none flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 p-6">
                    <div className="p-3 bg-primary/10 rounded-full mt-1">
                        <capability.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-medium">{capability.title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{capability.description}</p>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex-grow pt-0">
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-outside pl-5">
                        {capability.features.map(feature => <li key={feature}>{feature}</li>)}
                    </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-24 md:py-32 bg-muted/50 border-y">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-4">
             <div className="p-4 bg-primary/10 rounded-full w-fit mb-4">
                <AreaChart className="h-8 w-8 text-primary" />
              </div>
             <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Analytics & Business Intelligence
            </h2>
             <p className="text-lg text-muted-foreground leading-relaxed pt-4">
             Leverage real-time trade data to make informed strategic decisions, optimize supply chains, and forecast trends.
            </p>
          </div>
          <div className="space-y-6">
             <div className="flex items-start gap-4">
                <div>
                    <h3 className="font-medium text-foreground">Performance Dashboards</h3>
                    <p className="text-muted-foreground">Monitor KPIs for trade corridors, supplier performance, and settlement times.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div>
                    <h3 className="font-medium text-foreground">Predictive Analytics</h3>
                    <p className="text-muted-foreground">Utilize AI-powered insights to forecast potential defaults, disruptions, and supply chain risks.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div>
                    <h3 className="font-medium text-foreground">Customizable Reporting</h3>
                    <p className="text-muted-foreground">Generate tailored reports for executive-level summaries, operational reviews, and financial audits.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
            Transform Your Enterprise Trade Operations
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
             Enable your enterprise to operate efficiently, compliantly, and securely on a global scale with Baalvion.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" asChild>
                <Link href={PATHS.ACCESS_REQUEST}>Request Enterprise Access</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
