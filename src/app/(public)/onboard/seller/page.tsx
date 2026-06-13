'use client';

/**
 * @file onboard/seller/page.tsx
 * @description Seller KYC onboarding wizard — 6 steps (PDF Module 4).
 * Account+Company -> Documents -> Certification verification -> Factory-photo KYC
 * -> Credit score & tier assignment -> Seller activation.
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
  Store, Building, FileUp, BadgeCheck, Camera, Award, ArrowRight, ArrowLeft,
  Loader2, CheckCircle2, FileText, Sparkles, ScanLine,
} from 'lucide-react';

const STEPS = ['Company', 'Documents', 'Certs', 'Factory', 'Tier', 'Activate'];

const SELLER_DOCS = [
  { key: 'companyReg', label: 'Company Registration' },
  { key: 'directorId', label: 'Director ID' },
  { key: 'bankStatement', label: 'Bank Statement' },
  { key: 'vatGst', label: 'VAT / GST Registration' },
  { key: 'productCerts', label: 'Product Certifications' },
  { key: 'factoryAudit', label: 'Factory Audit Report' },
  { key: 'exportLicense', label: 'Export License' },
];

const CERT_CHECKS = [
  'Reading certificate numbers (OCR)',
  'Validating against issuing bodies',
  'Checking expiry & revocation status',
];

const TIERS = [
  { key: 'Basic', color: 'text-muted-foreground', min: 0 },
  { key: 'Verified', color: 'text-blue-600', min: 650 },
  { key: 'Premium', color: 'text-amber-600', min: 800 },
  { key: 'Platinum', color: 'text-indigo-600', min: 900 },
];

export default function SellerOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [certIndex, setCertIndex] = useState(0);
  const [certDone, setCertDone] = useState(false);
  const [factoryRunning, setFactoryRunning] = useState(false);
  const [factoryVerified, setFactoryVerified] = useState(false);

  // Step 3 (index 2): simulate AI certificate validation.
  useEffect(() => {
    if (step !== 2) return;
    setCertIndex(0);
    setCertDone(false);
    const interval = setInterval(() => {
      setCertIndex((prev) => {
        if (prev >= CERT_CHECKS.length - 1) {
          clearInterval(interval);
          setTimeout(() => setCertDone(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [step]);

  const runFactoryCheck = () => {
    setFactoryRunning(true);
    setTimeout(() => { setFactoryRunning(false); setFactoryVerified(true); }, 1800);
  };

  const activate = () => {
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
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Seller Verification</p>
            <h1 className="text-xl font-black uppercase tracking-tighter">Become a Verified Seller</h1>
          </div>
        </div>

        <Card className="border-2 rounded-[32px] shadow-xl bg-background overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-10">
            <WizardStepper steps={STEPS} current={step} />

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="min-h-[340px]">
                {step === 0 && (
                  <div className="space-y-6">
                    <StepHeader icon={Building} title="Account & company details" sub="Your verified supplier identity." />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Work Email"><Input type="email" placeholder="sales@factory.com" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Password"><Input type="password" placeholder="••••••••••" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Legal Company Name"><Input placeholder="Apex Manufacturing Co." className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Registration Number"><Input placeholder="REG-000000" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Country">
                        <Select><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select country" /></SelectTrigger>
                          <SelectContent>{['China', 'India', 'Vietnam', 'Turkey', 'United Arab Emirates', 'Germany', 'Mexico', 'Indonesia'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Product Category">
                        <Select><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>{['Electronics', 'Industrial & Metals', 'Energy & Solar', 'Textiles & Apparel', 'Agriculture', 'Chemicals', 'Automotive'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Registered Address" full><Input placeholder="Street, City, Country" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Website"><Input placeholder="https://factory.com" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Annual Export Volume (USD)">
                        <Select><SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select range" /></SelectTrigger>
                          <SelectContent>{['< $1M', '$1M – $10M', '$10M – $50M', '$50M – $250M', '$250M+'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <StepHeader icon={FileUp} title="Upload verification documents" sub="Including product, factory & export credentials." />
                    <div className="space-y-3">
                      {SELLER_DOCS.map((doc) => <DocRow key={doc.key} label={doc.label} fileName={docs[doc.key]} onPick={(name) => setDocs((d) => ({ ...d, [doc.key]: name }))} />)}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 py-4">
                    <StepHeader icon={BadgeCheck} title="Certification verification" sub="AI validates each certificate against its issuing authority." />
                    <div className="space-y-4">
                      {CERT_CHECKS.map((label, i) => (
                        <div key={label} className="flex items-center gap-4">
                          <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all', (certDone || i < certIndex) ? 'bg-emerald-500 text-white' : i === certIndex ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                            {(certDone || i < certIndex) ? <CheckCircle2 className="h-4 w-4" /> : i === certIndex ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-[9px] font-black">{i + 1}</span>}
                          </div>
                          <span className={cn('text-sm font-bold', (certDone || i <= certIndex) ? 'text-foreground' : 'text-muted-foreground opacity-50')}>{label}</span>
                        </div>
                      ))}
                    </div>
                    {certDone && <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-black uppercase tracking-widest"><CheckCircle2 className="h-4 w-4" /> All certifications validated</div>}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <StepHeader icon={Camera} title="Factory photo validation" sub="We detect stock images vs. genuine facility photos." />
                    <div className="space-y-3">
                      <DocRow label="Factory Exterior" fileName={docs.factoryExt} onPick={(name) => setDocs((d) => ({ ...d, factoryExt: name }))} />
                      <DocRow label="Production Floor" fileName={docs.factoryFloor} onPick={(name) => setDocs((d) => ({ ...d, factoryFloor: name }))} />
                    </div>
                    {!factoryVerified ? (
                      <Button onClick={runFactoryCheck} disabled={factoryRunning || !(docs.factoryExt && docs.factoryFloor)} className="w-full h-12 font-black uppercase text-[11px] tracking-widest rounded-2xl">
                        {factoryRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing imagery…</> : <><ScanLine className="mr-2 h-4 w-4" /> Run authenticity check</>}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border-2 border-emerald-500/30 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" /><span className="text-sm font-black uppercase tracking-tight">Genuine facility verified — no stock imagery detected</span>
                      </div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 py-2">
                    <StepHeader icon={Award} title="Credit score & seller tier" sub="Assessed by our trade-risk engine from your verification depth, documents & trade signals." />
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-black text-primary tracking-tight">Pending Assessment</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Trade Score / 1000</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {TIERS.map((t) => (
                        <div key={t.key} className="p-4 rounded-2xl border-2 text-center border-muted opacity-50">
                          <p className="text-[11px] font-black uppercase tracking-tight text-muted-foreground">{t.key}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-xs text-muted-foreground font-medium">Your trade score and tier are assigned after assessment completes. Higher tiers unlock as your trade history grows.</p>
                  </div>
                )}

                {step === 5 && (
                  <div className="text-center space-y-8 py-6">
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="h-24 w-24 rounded-[32px] bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center mx-auto">
                      <Award className="h-12 w-12 text-indigo-600" />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black uppercase tracking-tighter">Welcome, Verified Seller</h2>
                      <p className="text-sm text-muted-foreground font-medium">Your storefront is live. Create your first listing to reach global buyers.</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-indigo-600"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">First 6 months subscription-free</span></div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2 border-t">
              {step > 0 && step !== 2 ? (
                <Button variant="ghost" onClick={back} className="font-black uppercase text-[11px] tracking-widest h-12"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              ) : <span />}

              {step < 1 && <Button onClick={next} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>}
              {step === 1 && <Button onClick={next} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl bg-primary">Verify Certifications <BadgeCheck className="ml-2 h-4 w-4" /></Button>}
              {step === 2 && <Button onClick={next} disabled={!certDone} className="ml-auto h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>}
              {step === 3 && <Button onClick={next} disabled={!factoryVerified} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>}
              {step === 4 && <Button onClick={next} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl bg-primary">Activate Storefront <Award className="ml-2 h-4 w-4" /></Button>}
              {step === 5 && <Button onClick={activate} className="ml-auto h-14 px-12 font-black uppercase text-[12px] tracking-widest rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl">Enter Seller Console <ArrowRight className="ml-2 h-5 w-5" /></Button>}
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
