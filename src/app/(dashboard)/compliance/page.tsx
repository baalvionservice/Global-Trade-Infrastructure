'use client';

/**
 * @file compliance/page.tsx
 * @description Compliance Hub — the platform's immune system (PDF Module 5).
 * Continuous KYC/AML/sanctions/fraud oversight with links to each control surface.
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ShieldCheck, Radio, ScanFace, Gauge, AlertOctagon, FileSearch, ArrowRight,
  Activity, Ban, UserCheck,
} from 'lucide-react';

const METRICS = [
  { label: 'KYC Cases Pending', val: '14', icon: UserCheck, tone: 'text-blue-600' },
  { label: 'Sanctions Hits (24h)', val: '3', icon: Radio, tone: 'text-red-600' },
  { label: 'Open AML Alerts', val: '7', icon: AlertOctagon, tone: 'text-amber-600' },
  { label: 'Avg Trust Score', val: '842', icon: Gauge, tone: 'text-emerald-600' },
];

const TOOLS = [
  { title: 'KYC / KYB Cases', desc: 'Identity verification queue & document review.', icon: ScanFace, href: '/compliance/kyc' },
  { title: 'Sanctions Screening', desc: 'OFAC / UN / EU / UK / AU + PEP & adverse-media.', icon: Radio, href: '/compliance/sanctions' },
  { title: 'Fraud Detection', desc: 'Behavioral anomaly & collusion intelligence.', icon: AlertOctagon, href: '/compliance/fraud' },
  { title: 'Trust Score System', desc: '0–1000 composite across six trust factors.', icon: Gauge, href: '/compliance/trust-score' },
  { title: 'Regulatory & Customs', desc: 'HS codes, declarations & jurisdictional rules.', icon: FileSearch, href: '/compliance-regulatory' },
  { title: 'Blacklist Registry', desc: 'Permanently banned entities, shared platform-wide.', icon: Ban, href: '/compliance/fraud' },
];

export default function ComplianceHubPage() {
  const router = useRouter();
  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Immune System: ACTIVE</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.8]">Compliance <br />Hub.</h1>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl">Every entity is screened continuously — not once. Every trade triggers fresh sanctions screening; every dispute recalculates trust.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Integrity 99.98%
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((m) => (
          <Card key={m.label} className="border-2 rounded-2xl bg-background">
            <CardContent className="p-7 space-y-3">
              <div className={cn('flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground')}><m.icon className={cn('h-4 w-4', m.tone)} /> {m.label}</div>
              <p className="text-4xl font-black tabular-nums tracking-tighter">{m.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((t) => (
          <Card key={t.title} className="group border-2 rounded-2xl bg-background hover:border-primary/50 transition-all cursor-pointer" onClick={() => router.push(t.href)}>
            <CardContent className="p-8 space-y-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/5 border-2 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                <t.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tighter">{t.title}</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{t.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="h-3 w-3" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 rounded-2xl bg-background">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground"><Activity className="h-4 w-4 text-primary" /> Anti-Fraud Systems</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Listing fraud detection (copied images, fake specs)',
              'Identity spoofing (video selfie, device fingerprint)',
              'Shipping fraud (escrow released on carrier confirm)',
              'Collusion detection (ML pattern flags)',
              'Continuous sanctions re-screening per trade',
              'Blacklist enforcement (no re-registration)',
            ].map((s) => (
              <div key={s} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-foreground/80">{s}</span>
                <Badge variant="outline" className="ml-auto text-[8px] font-black border-2 text-emerald-600 border-emerald-200">LIVE</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
