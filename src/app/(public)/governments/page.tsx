import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scale, ShieldCheck, Eye, FileText, ArrowRight, GanttChartSquare, Landmark, Network } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PATHS } from "@/lib/paths";

export const metadata: Metadata = {
  title: 'Sovereign Trade Oversight Solutions',
  description: 'Empower your regulatory authorities with real-time trade visibility, automated customs enforcement, and systemic risk analytics on the Baalvion OS.',
};

export default function GovernmentsPage() {

  const capabilities: { title: string, description: string, icon: LucideIcon, features: string[] }[] = [
    {
      title: "Real-Time Trade Visibility",
      description: "Gain macro-level, anonymized visibility into national trade flows, corridors, and commodity movements without accessing commercially sensitive data.",
      icon: Eye,
      features: [
        "Macro-level visibility into national trade flows",
        "Commodity movement tracking for policy assessment",
        "Secure, read-only dashboards for central banks"
      ]
    },
    {
      title: "Automated Regulatory & Customs Compliance",
      description: "Embed customs declarations, tariff codes, and regulatory checks directly into trade workflows, ensuring compliance at the point of execution.",
      icon: ShieldCheck,
      features: [
        "Automated customs and tariff validation",
        "Real-time regulatory alerts and enforcement",
        "Immutable, audit-ready logs for all trade activities"
      ]
    },
    {
      title: "Economic & Risk Analytics",
      description: "Access aggregated and verified trade data to make informed policy decisions, perform risk analysis, and forecast economic trends.",
      icon: FileText,
      features: [
        "Trade volume trends and corridor performance analysis",
        "Commodity-level risk and exposure assessments",
        "Regulatory impact simulations and forecasting"
      ]
    },
    {
      title: "Sovereign Oversight & Control",
      description: "Utilize a read-only oversight portal designed for central banks and trade authorities to monitor systemic risk and ensure financial stability.",
      icon: Scale,
       features: [
        "Role-based access for sensitive oversight functions",
        "Real-time alerts for anomalies or compliance breaches",
        "Immutable, timestamped logs for all trade actions"
      ]
    }
  ];

  return (
    <div className="flex flex-col bg-background text-foreground">
      <section className="py-24 md:py-32 bg-muted/50 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="mx-auto max-w-4xl text-center flex flex-col items-center space-y-6">
             <p className="text-sm font-semibold uppercase tracking-wider text-primary">For Governments & Regulators</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
              Infrastructure for Sovereign Trade Oversight
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
             Baalvion provides governments and regulators with a unified platform to balance economic growth, national security, and regulatory integrity across the global trade ecosystem.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                  <Link href={PATHS.ACCESS_REQUEST}>Request Sovereign Access <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 mx-auto">
           <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">A Unified View for National Trade</h2>
            <p className="text-lg text-muted-foreground">Move from fragmented, lagging trade indicators to real-time, structured intelligence. Our platform consolidates trade data across borders, sectors, and commodities without exposing commercially sensitive information.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {capabilities.map((capability) => (
               <Card key={capability.title} className="bg-card border-0 shadow-none flex flex-col">
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
                <Network className="h-8 w-8 text-primary" />
              </div>
             <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Enable Data-Driven Governance
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Engage with our institutional team to understand how Baalvion can provide your nation with the infrastructure for modern trade oversight. Our architecture supports hierarchical access control, full auditability, and API-first integration with existing government systems.
            </p>
             <div className="flex justify-start gap-4 pt-2">
                <Button size="lg" variant="outline" asChild>
                    <Link href={PATHS.PLATFORM}>View Governance Architecture</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
            Transform Trade Governance with Baalvion
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Enable your government to monitor trade in real-time, enforce compliance, and make data-driven policy decisions with confidence.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" asChild>
                <Link href={PATHS.ACCESS_REQUEST}>Request Institutional Access</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
