import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Scale, ShieldCheck, Globe, Milestone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/**
 * @file src/app/about/page.tsx
 * @description The public-facing page detailing Baalvion's mission, governance, and role as neutral infrastructure.
 */
export default function AboutPage() {

    const principles: { title: string, description: string, icon: LucideIcon }[] = [
        {
            title: "Neutral Infrastructure",
            description: "We provide a fair, open, and unbiased operating layer. We do not participate in trades, take positions, or favor any institution.",
            icon: Scale
        },
        {
            title: "Governed by Design",
            description: "The platform is built on a foundation of role-based access, immutable audit trails, and jurisdictional controls.",
            icon: ShieldCheck
        },
        {
            title: "Global Interoperability",
            description: "Our architecture is designed to connect disparate systems and create a common language for global trade without replacing them.",
            icon: Globe
        },
        {
            title: "Long-Term Stability",
            description: "We are built as permanent infrastructure, designed to evolve with global regulatory and financial systems for decades to come.",
            icon: Milestone
        }
    ];

  return (
    <div className="flex flex-col bg-background text-foreground">

      {/* 1. HERO SECTION */}
      <section className="py-24 md:py-32 bg-muted/50 border-b">
        <div className="container text-center px-4 md:px-6">
          <div className="mx-auto max-w-4xl flex flex-col items-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
              Enabling Global Trade with Trust
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
              Baalvion is the neutral infrastructure layer connecting the world's financial, regulatory, and commercial institutions to enable more secure, transparent, and efficient global trade.
            </p>
          </div>
        </div>
      </section>

      {/* 2. OUR MISSION */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Foundational Infrastructure for the Global Economy
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-xl text-foreground leading-relaxed">
              To build and maintain the foundational infrastructure for global trade—a single, governed system that empowers institutions, reduces systemic risk, and fosters economic stability.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              We believe that global trade, the engine of the world economy, requires infrastructure that is as reliable and regulated as the financial systems it supports. Baalvion was created to be that infrastructure.
            </p>
          </div>
        </div>
      </section>
      
      <Separator className="w-1/2 mx-auto" />

      {/* 3. GUIDING PRINCIPLES */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6">
           <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Principles</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-medium tracking-tight text-foreground">The Architecture of Trust</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 max-w-5xl mx-auto">
            {principles.map((principle) => (
              <div key={principle.title} className="flex gap-6">
                  <principle.icon className="h-8 w-8 text-primary mt-1 shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-foreground">{principle.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
