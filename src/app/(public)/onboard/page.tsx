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
import { ShoppingCart, Store, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { DEPARTMENT_CARDS } from './_lib/department-configs';

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

        <div className="space-y-8 pt-6 border-t">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Institutions &amp; Departments</p>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Onboard By Role</h2>
            <p className="text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Each path collects exactly what your department needs to verify — settlement authority, customs gateways, lane coverage — and routes to governance review.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEPARTMENT_CARDS.map((dept) => (
              <Link key={dept.slug} href={`${PATHS.ONBOARD}/${dept.slug}`} className="group">
                <Card className="h-full border-2 hover:border-primary/50 transition-all rounded-[28px] bg-background hover:shadow-xl">
                  <CardContent className="p-7 space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 border-2 flex items-center justify-center group-hover:bg-primary transition-all">
                      <dept.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black uppercase tracking-tight leading-tight">{dept.title}</h3>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{dept.desc}</p>
                    </div>
                    <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Begin <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center space-y-2 pt-2">
            <p className="text-xs text-muted-foreground font-medium">
              Another institution type? <Link href={PATHS.ACCESS_REQUEST} className="text-primary font-black hover:underline inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Request institutional access</Link>
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Already verified? <Link href={PATHS.LOGIN} className="text-primary font-black hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
