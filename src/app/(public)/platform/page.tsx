import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GanttChartSquare, Landmark, ShieldCheck, Truck, Key, Eye, Share2, HardDrive } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";

/**
 * @file src/app/platform/page.tsx
 * @description The public-facing page detailing the Baalvion platform architecture and core principles.
 */

const PLATFORM_TITLE = "Baalvion Platform — Institutional Operating System for Global Trade";
const PLATFORM_DESCRIPTION = "Baalvion is an institutional-grade operating system for global trade, integrating execution, finance, compliance, and logistics into a single governed infrastructure.";

export const metadata: Metadata = pageMetadata({
    title: PLATFORM_TITLE,
    description: PLATFORM_DESCRIPTION,
    path: "/platform",
    keywords: ['trade platform', 'trade operating system', 'trade execution', 'settlement', 'compliance', 'logistics infrastructure', 'institutional trade'],
});

export default function PlatformPage() {
    const functionalLayers: { title: string, description: string, icon: LucideIcon, details: string[] }[] = [
        {
            title: "Trade Execution Layer",
            description: "Ensures that trade execution follows consistent, auditable processes for contracts, orders, and documentation, reducing disputes and operational uncertainty.",
            icon: GanttChartSquare,
            details: ["Creation and management of trade contracts", "Order processing and documentation workflows", "Standardized data models for invoices and agreements", "Controlled collaboration between all parties"]
        },
        {
            title: "Finance & Settlement Layer",
            description: "Integrates finance directly with trade execution for coordination, orchestration, and visibility, reducing settlement risk and improving capital efficiency.",
            icon: Landmark,
            details: ["Trade finance coordination across multiple institutions", "Settlement orchestration aligned with trade milestones", "Cross-border payment visibility and routing", "Risk and exposure visibility throughout the transaction"]
        },
        {
            title: "Compliance & Regulation Layer",
            description: "Delivers continuous, real-time compliance with automated screening, jurisdiction-specific rule enforcement, and comprehensive audit trails for proactive regulatory oversight.",
            icon: ShieldCheck,
            details: ["Automated screening against regulatory requirements", "Jurisdiction-specific rule enforcement", "Continuous monitoring, not point-in-time checks", "Comprehensive audit trails for regulatory reporting"]
        },
        {
            title: "Logistics & Movement Layer",
            description: "Connects physical trade movement with digital records through shipment tracking and milestone verification, increasing transparency and reducing delays.",
            icon: Truck,
            details: ["Shipment tracking and milestone verification", "Event-based updates from logistics partners", "Alignment of logistics data with trade workflows", "Increased visibility across borders and transport networks"]
        }
    ];

    const governancePillars = [
        {
            title: "Governance & Access Control",
            description: "Enforces granular, role-based access control with jurisdiction-aware permissions and controlled data visibility, ensuring participants act only on data they are authorized to access.",
            icon: Key
        },
        {
            title: "Audit & Oversight",
            description: "Records every significant action in an immutable, timestamped audit log, providing full traceability and verifiable records for auditors and regulators.",
            icon: Eye
        },
        {
            title: "Integration & API Infrastructure",
            description: "Integrates with existing systems via secure, standardized APIs, allowing banks, governments, and enterprises to connect without replacing their core infrastructure.",
            icon: Share2
        },
         {
            title: "Data & Security",
            description: "Employs institutional-grade encryption for data at rest and in transit, with secure storage aligned to financial-sector standards to ensure data protection at all times.",
            icon: HardDrive
        }
    ]

  return (
    <div className="flex flex-col bg-background text-foreground">
      <script {...jsonLdScriptProps(serviceJsonLd({ name: PLATFORM_TITLE, description: PLATFORM_DESCRIPTION, path: '/platform', audience: 'Enterprises, Banks & Governments' }))} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Platform', path: '/platform' }]))} />
      {/* 1. HERO SECTION */}
      <section className="py-24 md:py-32 bg-muted/50 border-b">
        <div className="container text-center px-4 md:px-6">
          <div className="mx-auto max-w-4xl flex flex-col items-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
              An Institutional-Grade Operating System for Global Trade
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
             Baalvion is a unified digital infrastructure designed to serve as the operating system for global trade. It connects trade execution, finance, compliance, and logistics within a single governed platform, enabling all participants to operate from a shared, trusted source of truth.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Unified Infrastructure */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-4">
             <p className="text-sm font-semibold uppercase tracking-wider text-primary">The Challenge</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              A Unified Infrastructure for a Fragmented Ecosystem
            </h2>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
                Global trade operates across disconnected systems. Contracts, payments, compliance checks, and shipments are managed in isolation, creating delays, risk, and inefficiency.
            </p>
            <p>
                Baalvion addresses this by providing a common institutional layer where all participants can interact under clearly defined rules and oversight, creating a shared operational framework.
            </p>
          </div>
        </div>
      </section>

      <Separator className="w-1/2 mx-auto" />

      {/* 3. CORE FUNCTIONAL LAYERS */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Platform Architecture</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-medium tracking-tight text-foreground">Core Functional Layers</h2>
            <p className="mt-4 text-lg text-muted-foreground">The Baalvion platform is architected as a set of interoperable functional layers, each addressing a critical component of global trade.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {functionalLayers.map((layer) => (
                 <Card key={layer.title} className="bg-card border shadow-none flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-4 p-6">
                        <div className="p-3 bg-primary/10 rounded-full mt-1">
                           <layer.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-medium">{layer.title}</CardTitle>
                            <p className="text-muted-foreground text-sm mt-1">{layer.description}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 flex-grow pt-0">
                       <ul className="space-y-2 text-sm text-muted-foreground list-disc list-outside pl-5">
                          {layer.details.map(detail => <li key={detail}>{detail}</li>)}
                       </ul>
                    </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </section>
      
      <Separator className="w-1/2 mx-auto" />

      {/* 4. GOVERNANCE & TRUST */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
           <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Institutional Framework</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-medium tracking-tight text-foreground">Underpinned by Governance & Trust</h2>
            <p className="mt-4 text-lg text-muted-foreground">At the core of Baalvion lies a governance and trust framework designed for institutional adoption. This foundation ensures that all activity operates within defined legal, operational, and security boundaries.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {governancePillars.map((pillar) => (
              <div key={pillar.title} className="flex gap-6">
                  <pillar.icon className="h-8 w-8 text-primary mt-1 shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-foreground">{pillar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CLOSING SECTION */}
      <section className="py-24 md:py-32 bg-muted/50 border-t">
        <div className="container text-center px-4 md:px-6">
          <div className="mx-auto max-w-4xl flex flex-col items-center space-y-6">
            <h2 className="text-3xl font-medium tracking-tight text-foreground">
              One Platform. Multiple Stakeholders. A Shared Source of Truth.
            </h2>
            <p className="text-xl font-medium text-foreground pt-4">
                The operating system behind the next era of global trade.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
