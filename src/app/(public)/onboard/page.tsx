'use client';

/**
 * @file onboard/page.tsx
 * @description Onboarding entry — every participant is verified before they can trade.
 * Routes buyers and sellers into their respective KYC wizards (PDF Module 4).
 */

import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store, ArrowRight, ShieldCheck, Landmark, Building2, Users } from 'lucide-react';

const INSTITUTIONAL = [
  { label: 'Bank / Financier', icon: Landmark },
  { label: 'Government', icon: Building2 },
  { label: 'Agent / Reseller', icon: Users },
];

export default function OnboardEntryPage() {
  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container max-w-5xl py-16 md:py-24 space-y-14">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <ShieldCheck className="h-4 w-4" /> Verified Trade Network
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
            Join Baalvion
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            No anonymous buyers. No unverified sellers. KYC is the foundation of trust that enables
            billion-dollar trades between strangers. Choose how you trade to begin verification.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            { role: 'buyer', title: 'I am a Buyer', desc: 'Source verified suppliers, send RFQs, finance and receive goods.', steps: '5-step verification', icon: ShoppingCart, href: PATHS.ONBOARD_BUYER },
            { role: 'seller', title: 'I am a Seller', desc: 'Reach global buyers, respond to RFQs, get paid reliably and fast.', steps: '6-step verification', icon: Store, href: PATHS.ONBOARD_SELLER },
          ].map((opt) => (
            <Card key={opt.role} className="group border-2 hover:border-primary/50 transition-all rounded-[32px] overflow-hidden bg-background shadow-xl hover:shadow-2xl">
              <CardContent className="p-10 space-y-8">
                <div className="h-16 w-16 rounded-[24px] bg-primary/5 border-2 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                  <opt.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">{opt.title}</h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{opt.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{opt.steps}</span>
                  <Button asChild className="h-12 px-8 font-black uppercase text-[11px] tracking-widest rounded-2xl group-hover:scale-[1.02] transition-transform">
                    <Link href={opt.href}>Begin <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-6 pt-6 border-t">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Banks, governments &amp; agents onboard via institutional review
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {INSTITUTIONAL.map((inst) => (
              <Button key={inst.label} variant="outline" asChild className="h-12 px-6 border-2 font-black uppercase text-[10px] tracking-widest rounded-2xl bg-background">
                <Link href={PATHS.ACCESS_REQUEST}><inst.icon className="mr-2 h-4 w-4" /> {inst.label}</Link>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Already verified? <Link href={PATHS.LOGIN} className="text-primary font-black hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
