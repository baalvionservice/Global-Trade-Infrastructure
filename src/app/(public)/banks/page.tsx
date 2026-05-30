import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowRight, GanttChartSquare, Landmark, ShieldCheck, AreaChart, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PATHS } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: 'Trade Finance Solutions for Banks',
  description: 'Modernize your trade finance rails with Baalvion. Real-time LC processing, FX transparency, and sovereign-grade risk intelligence for global banking.',
  path: '/banks',
  keywords: ['trade finance for banks', 'letter of credit processing', 'cross-border settlement', 'FX transparency', 'correspondent banking', 'bank trade infrastructure'],
});

export default function BankRolePage() {
  const capabilities = [
    {
      title: "Trade Finance Infrastructure",
      description: "API-based trade finance enablement, LC, BG, invoice finance visibility, and exposure tracking across jurisdictions.",
      icon: GanttChartSquare
    },
    {
      title: "FX & Cross-Border Settlement",
      description: "Smart settlement routing, FX transparency across corridors, and reduced settlement friction and delays.",
      icon: Landmark
    },
    {
      title: "Counterparty & Vendor Intelligence",
      description: "Global vendor trust scoring, transactional behavior analysis, and fraud and anomaly detection.",
      icon: ShieldCheck
    },
    {
      title: "Compliance & Regulatory Readiness",
      description: "KYC / KYB / AML orchestration, sanctions and risk screening, and regulator-ready audit trails.",
      icon: AreaChart
    }
  ];

  return (
    <div className="flex flex-col bg-background text-foreground">
      <section className="py-24 md:py-32 bg-muted/50 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="mx-auto max-w-5xl text-center flex flex-col items-center space-y-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">For Banks & Financial Institutions</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
              Trade Infrastructure Built for Banks, Not Marketplaces
            </h1>
            <p className="max-w-4xl mx-auto text-lg text-muted-foreground leading-relaxed">
              Baalvion enables banks to operate compliant, real-time, and intelligence-driven global trade finance — without disrupting existing core systems.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                  <Link href={PATHS.ACCESS_REQUEST}>Request Bank Access <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 mx-auto">
           <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">What Baalvion Enables for Banks</h2>
            <p className="text-lg text-muted-foreground">Modernize trade finance operations, enhance compliance, and gain real-time visibility into risk and exposure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {capabilities.map((capability) => (
              <Card key={capability.title} className="bg-card border shadow-none flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <capability.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-medium mt-2">{capability.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
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
                <Share2 className="h-8 w-8 text-primary" />
              </div>
             <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Designed to Integrate, Not Replace
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Baalvion does not replace a bank’s core systems. It integrates securely via API with core banking platforms, trade finance engines, compliance systems, and treasury/FX platforms.
            </p>
             <p className="mt-4 text-lg text-muted-foreground leading-relaxed font-medium">
              Banks retain control. Baalvion provides visibility, intelligence, and orchestration.
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-24 md:py-32">
        <div className="container text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
            Explore Bank-Grade Trade Infrastructure
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Engage with our institutional team to understand how Baalvion can provide your bank with the modern infrastructure for global trade.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" asChild>
                <Link href={PATHS.ACCESS_REQUEST}>Request Institutional Access</Link>
            </Button>
            <Button size="lg" variant="outline">Schedule Technical Evaluation</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
