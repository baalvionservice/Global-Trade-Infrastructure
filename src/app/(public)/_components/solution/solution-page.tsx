"use client";
/**
 * @file solution-page.tsx
 * @description Shared rendering system for every public "solution" page
 * (banks, enterprises, governments, logistics). One visual language, dark
 * institutional aesthetic matching the header + home. Each audience supplies
 * its own copy and a department "product peek" — this file owns layout so the
 * pages stay DRY and consistent. Show, don't tell: every page answers
 * what it is, why it matters, and how it helps.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Cta = { label: string; href: string };
type Capability = { icon: LucideIcon; title: string; how: string };
type ProofStat = { value: string; label: string };
type FlowStep = { title: string; desc: string };

export type SolutionConfig = {
  /** Small eyebrow, e.g. "For Banks & Financial Institutions" */
  audience: string;
  /** The pain the visitor recognizes — one short line above the headline */
  problem: string;
  /** Big headline. May embed <span className="text-primary"> for emphasis. */
  headline: ReactNode;
  /** Plain-language value: what it is + how it actually helps */
  subhead: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  /** Department product mock shown beside the hero */
  peek: ReactNode;
  proof: ProofStat[];
  capabilitiesTitle: string;
  capabilitiesLede: string;
  capabilities: Capability[];
  stepsTitle: string;
  steps: FlowStep[];
  closingTitle: string;
  closingDesc: string;
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
} as const;

/** Mac-style window chrome used to frame every department peek. */
export function BrowserFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/60 shadow-3xl backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/50" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
          <span className="h-3 w-3 rounded-full bg-green-500/50" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</span>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

export function SolutionPage({ config }: { config: SolutionConfig }) {
  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* HERO — problem hook + plain value + live product peek */}
      <section className="relative px-4 md:px-10 pt-24 pb-28 md:pt-32 md:pb-36 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,_var(--tw-gradient-stops))] from-primary/15 to-transparent opacity-70" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center relative z-10">
          <motion.div {...fadeUp} className="lg:col-span-6 space-y-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{config.audience}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{config.problem}</p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
              {config.headline}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">{config.subhead}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button className="h-14 px-9 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform group" asChild>
                <Link href={config.primaryCta.href}>
                  {config.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              {config.secondaryCta && (
                <Button variant="outline" className="h-14 px-9 border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10" asChild>
                  <Link href={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="lg:col-span-6">
            {config.peek}
          </motion.div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="px-4 md:px-10 py-14 border-b border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {config.proof.map((stat) => (
            <div key={stat.label} className="space-y-2 text-center lg:text-left">
              <p className="text-3xl md:text-4xl font-black tabular-nums text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CAPABILITIES — outcome-led, each says how it helps */}
      <section className="px-4 md:px-10 py-28">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-3xl space-y-5">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">{config.capabilitiesTitle}</h2>
            <p className="text-lg text-slate-400 leading-relaxed">{config.capabilitiesLede}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {config.capabilities.map((cap, i) => (
              <motion.div key={cap.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="group p-8 rounded-[28px] border border-white/5 bg-slate-900/40 hover:border-primary/40 hover:bg-slate-900/70 transition-all flex gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 h-fit group-hover:bg-primary/20 transition-colors">
                  <cap.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">{cap.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{cap.how}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3-step flow */}
      <section className="px-4 md:px-10 py-28 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none max-w-2xl">{config.stepsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {config.steps.map((step, i) => (
              <motion.div key={step.title} {...fadeUp} transition={{ delay: i * 0.1 }} className="p-8 rounded-[28px] border border-white/5 bg-slate-950 space-y-5">
                <span className="block text-5xl font-black text-primary/30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-4 md:px-10 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">{config.closingTitle}</h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">{config.closingDesc}</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button className="h-14 px-10 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200" asChild>
              <Link href={config.primaryCta.href}>{config.primaryCta.label}</Link>
            </Button>
            {config.secondaryCta && (
              <Button variant="outline" className="h-14 px-10 border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/5" asChild>
                <Link href={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Small labelled row used inside peeks. */
export function PeekRow({ icon: Icon, label, value, valueClass }: { icon?: LucideIcon; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="h-4 w-4 text-slate-500 shrink-0" />}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</span>
      </div>
      <span className={cn('text-sm font-black tabular-nums text-white shrink-0', valueClass)}>{value}</span>
    </div>
  );
}

/** Status pill used inside peeks. */
export function PeekBadge({ children, tone = 'emerald' }: { children: ReactNode; tone?: 'emerald' | 'amber' | 'sky' | 'slate' }) {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    slate: 'bg-white/5 text-slate-400 border-white/10',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest', tones[tone])}>
      {children}
    </span>
  );
}
