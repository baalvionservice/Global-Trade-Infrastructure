import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  PackageSearch,
  GitPullRequest,
  ShieldAlert,
  AreaChart,
  Check,
  Ship
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PATHS } from "@/lib/paths";

/**
 * @file src/app/(public)/logistics/page.tsx
 * @description The authoritative Logistics Marketing page.
 * Resolved parallel route collision by centralizing marketing logic here.
 */

export default function LogisticsMarketingPage() {
  const capabilities = [
    {
      title: "Real-Time Corridor Visibility",
      description: "Monitor shipments from origin to destination with live IoT updates, port milestones, and systemic alerts.",
      icon: PackageSearch,
      features: [
        "Interactive maps with real-time vessel location",
        "Milestone tracking for all transport modes",
        "Automated notifications for delay vectors"
      ],
    },
    {
      title: "Optimized Logistics Workflows",
      description: "Streamline operations with automated workflows for carrier assignment and digital documentation.",
      icon: GitPullRequest,
      features: [
        "Automated route planning based on risk scores",
        "Digital Bill of Lading generation",
        "Integration with port authority gateways"
      ],
    },
    {
      title: "Proactive Risk Mitigation",
      description: "Identify and neutralize risks in logistics operations with AI-powered predictive insights.",
      icon: ShieldAlert,
      features: [
        "AI-based early warning for corridor congestion",
        "Automated escalation for high-risk cargo",
        "Scenario-based contingency orchestration"
      ],
    },
    {
      title: "Performance Analytics",
      description: "Measure corridor health, optimize routes, and improve carrier finality with actionable analytics.",
      icon: AreaChart,
      features: [
        "On-time delivery benchmarks per corridor",
        "Cost-per-unit efficiency metrics",
        "Audit-ready jurisdictional reports"
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <section className="py-24 md:py-32 bg-muted/30 border-b">
          <div className="container text-center px-4 md:px-6 mx-auto">
            <div className="mx-auto max-w-4xl flex flex-col items-center space-y-8">
              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                <Ship className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                Physical Movement.<br />Digital Finality.
              </h1>
              <p className="max-w-2xl text-xl text-muted-foreground font-medium italic">
                Baalvion connects global logistics providers with the digital trade ledger, enabling millisecond-accurate milestone tracking and automated customs orchestration.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button size="lg" className="h-16 px-10 font-black uppercase tracking-widest text-sm shadow-2xl" asChild>
                  <Link href={PATHS.ACCESS_REQUEST}>
                    Request Logistics Access <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Unified Intelligence</h2>
              <p className="text-lg text-muted-foreground font-medium italic">Synchronize your logistics milestones with financial and compliance events in real time.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {capabilities.map((capability) => (
                <Card key={capability.title} className="bg-card border-2 shadow-sm rounded-[32px] overflow-hidden flex flex-col hover:border-primary/40 transition-all">
                  <CardHeader className="flex flex-row items-start gap-6 p-10 bg-muted/5 border-b">
                    <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 mt-1">
                      <capability.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight">{capability.title}</CardTitle>
                      <p className="text-muted-foreground font-medium text-sm mt-2 italic leading-relaxed">{capability.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 flex-grow">
                    <ul className="space-y-4">
                      {capability.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-tight">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}