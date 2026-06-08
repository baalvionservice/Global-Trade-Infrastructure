'use client';

/**
 * @file onboard/buyer/page.tsx
 * @description Buyer KYC onboarding wizard — 5 steps (PDF Module 4).
 * Account -> Company details -> Document upload -> AI KYC processing -> Verified Buyer.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { WizardStepper } from '../_components/wizard-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Building, FileUp, ScanFace, ShieldCheck, ArrowRight, ArrowLeft,
  Loader2, CheckCircle2, Globe, Sparkles, FileText,
} from 'lucide-react';

const STEPS = ['Account', 'Company', 'Documents', 'AI KYC', 'Verified'];

const BUYER_DOCS = [
  { key: 'companyReg', label: 'Company Registration' },
  { key: 'directorId', label: 'Director ID' },
  { key: 'bankStatement', label: 'Bank Statement' },
  { key: 'vatGst', label: 'VAT / GST Registration' },
];

const KYC_CHECKS = [
  'Verifying document authenticity',
  'Screening OFAC / UN / EU / UK / AU sanctions lists',
  'Running PEP (Politically Exposed Person) check',
  'Scanning global adverse-media databases',
  'Computing Baalvion Trade Score',
];

export default function BuyerOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [checkIndex, setCheckIndex] = useState(0);

  // Step 4 (index 3): walk through the KYC checklist, then advance to approval.
  useEffect(() => {
    if (step !== 3) return;
    setCheckIndex(0);
    const interval = setInterval(() => {
      setCheckIndex((prev) => {
        if (prev >= KYC_CHECKS.length - 1) {
          clearInterval(interval);
          setTimeout(() => setStep(4), 700);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [step]);

  const enterPlatform = () => {
    // No client-side role grant. Verification routes the user to real authentication; access is
    // granted only by a backend-issued session (httpOnly cookie + access token).
    router.push('/login');
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container max-w-3xl py-12 md:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-primary/5 border-2 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Buyer Verification</p>
            <h1 className="text-xl font-black uppercase tracking-tighter">Become a Verified Buyer</h1>
          </div>
        </div>

        <Card className="border-2 rounded-[32px] shadow-xl bg-background overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-10">
            <WizardStepper steps={STEPS} current={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="min-h-[320px]"
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <StepHeader icon={ShoppingCart} title="Create your account" sub="Your secure institutional identity." />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Work Email"><Input type="email" placeholder="procurement@company.com" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Password"><Input type="password" placeholder="••••••••••" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Country">
                        <Select>
                          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select country" /></SelectTrigger>
                          <SelectContent>
                            {['United States', 'United Arab Emirates', 'India', 'Singapore', 'Germany', 'United Kingdom', 'China', 'Brazil'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Business Type">
                        <Select>
                          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {['Importer', 'Distributor', 'Manufacturer', 'Retailer', 'Trading House', 'Procurement Agency'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <StepHeader icon={Building} title="Company details" sub="Tell us about your organization." />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Legal Company Name"><Input placeholder="Global Procurement Ltd." className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Registration Number"><Input placeholder="REG-000000" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Registered Address" full><Input placeholder="Street, City, Country" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Website"><Input placeholder="https://company.com" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Employee Count">
                        <Select>
                          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select range" /></SelectTrigger>
                          <SelectContent>{['1–10', '11–50', '51–200', '201–1000', '1000+'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Annual Purchase Volume (USD)" full>
                        <Select>
                          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select range" /></SelectTrigger>
                          <SelectContent>{['< $1M', '$1M – $10M', '$10M – $50M', '$50M – $250M', '$250M+'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <StepHeader icon={FileUp} title="Upload verification documents" sub="Encrypted at rest. Used only for compliance screening." />
                    <div className="space-y-3">
                      {BUYER_DOCS.map((doc) => (
                        <DocRow key={doc.key} label={doc.label} fileName={docs[doc.key]} onPick={(name) => setDocs((d) => ({ ...d, [doc.key]: name }))} />
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 py-4">
                    <StepHeader icon={ScanFace} title="AI compliance screening" sub="Typically completes in under 2 hours — we'll fast-track yours now." />
                    <div className="space-y-4">
                      {KYC_CHECKS.map((label, i) => (
                        <div key={label} className="flex items-center gap-4">
                          <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all',
                            i < checkIndex ? 'bg-emerald-500 text-white' : i === checkIndex ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                            {i < checkIndex ? <CheckCircle2 className="h-4 w-4" /> : i === checkIndex ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-[9px] font-black">{i + 1}</span>}
                          </div>
                          <span className={cn('text-sm font-bold', i <= checkIndex ? 'text-foreground' : 'text-muted-foreground opacity-50')}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <Progress value={((checkIndex + 1) / KYC_CHECKS.length) * 100} className="h-1.5 bg-muted rounded-full" />
                  </div>
                )}

                {step === 4 && (
                  <div className="text-center space-y-8 py-6">
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      className="h-24 w-24 rounded-[32px] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                      <ShieldCheck className="h-12 w-12 text-emerald-600" />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black uppercase tracking-tighter">You're a Verified Buyer</h2>
                      <p className="text-sm text-muted-foreground font-medium">Sanctions, PEP and adverse-media screening cleared. Your trade identity is live.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-5 max-w-md mx-auto">
                      <div className="p-6 rounded-3xl border-2 bg-muted/20 space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Trade Credit Score</p>
                        <p className="text-lg font-black text-primary tracking-tight">Pending Assessment</p>
                        <p className="text-[9px] font-bold text-muted-foreground">Issued after your first transactions</p>
                      </div>
                      <div className="p-6 rounded-3xl border-2 bg-muted/20 space-y-2 flex flex-col justify-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-600"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Welcome Bonus</span></div>
                        <p className="text-sm font-black uppercase tracking-tight">First 10 RFQs Free</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2 border-t">
              {step > 0 && step < 3 ? (
                <Button variant="ghost" onClick={back} className="font-black uppercase text-[11px] tracking-widest h-12"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              ) : <span />}

              {step < 2 && (
                <Button onClick={next} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              )}
              {step === 2 && (
                <Button onClick={next} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl bg-primary">Submit for Verification <ScanFace className="ml-2 h-4 w-4" /></Button>
              )}
              {step === 3 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Globe className="h-4 w-4 animate-pulse" /> Screening in progress…</span>
              )}
              {step === 4 && (
                <Button onClick={enterPlatform} className="ml-auto h-14 px-12 font-black uppercase text-[12px] tracking-widest rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl">Enter Platform <ArrowRight className="ml-2 h-5 w-5" /></Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 rounded-2xl bg-primary/5 border-2 flex items-center justify-center shrink-0"><Icon className="h-6 w-6 text-primary" /></div>
      <div className="space-y-0.5">
        <h2 className="text-xl font-black uppercase tracking-tighter leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground font-medium">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn('space-y-2', full && 'sm:col-span-2')}>
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function DocRow({ label, fileName, onPick }: { label: string; fileName?: string; onPick: (name: string) => void }) {
  return (
    <label className={cn('flex items-center justify-between gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-primary/40', fileName ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-muted/20')}>
      <div className="flex items-center gap-3 min-w-0">
        <FileText className={cn('h-5 w-5 shrink-0', fileName ? 'text-emerald-600' : 'text-muted-foreground')} />
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-tight truncate">{label}</p>
          <p className="text-[10px] text-muted-foreground font-medium truncate">{fileName || 'PDF, JPG or PNG — max 10MB'}</p>
        </div>
      </div>
      {fileName ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0">Upload</span>}
      <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f.name); }} />
    </label>
  );
}
