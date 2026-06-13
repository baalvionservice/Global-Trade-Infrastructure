'use client';

/**
 * @file department-wizard.tsx
 * @description Config-driven onboarding wizard shared by every department persona
 * (banking, customs, logistics, enterprise). Reads a DepartmentConfig and renders
 * its form/docs steps, a compliance-screening animation, and a "submitted for
 * review" terminal state. No client-side access is ever granted — verification
 * routes to the governance review queue; real access comes from a backend session.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { WizardStepper } from './wizard-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Globe, FileText, ScanFace, Clock, AlertTriangle } from 'lucide-react';
import { getDepartmentConfig, type WizardField, type WizardStep } from '../_lib/department-configs';
import { onboardingService } from '@/services/onboarding-service';

type Values = Record<string, string>;

export function DepartmentWizard({ department }: { department: string }) {
  const router = useRouter();
  const config = getDepartmentConfig(department);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [docs, setDocs] = useState<Values>({});
  const [checkIndex, setCheckIndex] = useState(0);
  const [submitRef, setSubmitRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inputSteps = config?.steps ?? [];
  const screeningStep = inputSteps.length;
  const doneStep = screeningStep + 1;
  const checks = config?.screening.checks ?? [];

  // Screening phase: walk the compliance checklist, then advance to "submitted".
  useEffect(() => {
    if (step !== screeningStep || !config) return;
    setCheckIndex(0);
    const interval = setInterval(() => {
      setCheckIndex((prev) => {
        if (prev >= checks.length - 1) {
          clearInterval(interval);
          setTimeout(() => setStep(doneStep), 700);
          return prev;
        }
        return prev + 1;
      });
    }, 850);
    return () => clearInterval(interval);
  }, [step, screeningStep, doneStep, checks.length, config]);

  const stepperLabels = useMemo(
    () => [...inputSteps.map((s) => s.nav), 'Screening', 'Done'],
    [inputSteps]
  );

  if (!config) {
    return (
      <div className="container max-w-3xl py-24 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Unknown onboarding path</h1>
        <Button asChild><Link href={PATHS.ONBOARD}>Back to onboarding</Link></Button>
      </div>
    );
  }

  const current = inputSteps[step] as WizardStep | undefined;
  const isLastInput = step === inputSteps.length - 1;

  const stepComplete = (s: WizardStep | undefined): boolean => {
    if (!s) return true;
    if (s.kind === 'form') return s.fields.every((f) => f.optional || (values[f.key]?.trim()?.length ?? 0) > 0);
    return s.docs.every((d) => Boolean(docs[d.key]));
  };
  const canAdvance = stepComplete(current);

  const setValue = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));
  const next = () => setStep((s) => Math.min(s + 1, doneStep));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Submit the application to the backend (creates a pending org for review), then
  // run the screening animation. Optimistic: the animation proceeds in parallel.
  const handleSubmit = async () => {
    setStep(screeningStep);
    setSubmitError(null);
    try {
      const result = await onboardingService.submitApplication({
        department: config!.slug,
        organizationName: values.legalName || values.fullName || config!.title,
        legalName: values.legalName,
        contactEmail: values.email,
        contactName: values.fullName,
        contactPhone: values.phone,
        jurisdiction: values.jurisdiction,
      });
      setSubmitRef(result.reference);
      try { sessionStorage.setItem('onboarding_application', JSON.stringify({ reference: result.reference, department: config!.slug })); } catch { /* ignore */ }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission could not be recorded');
    }
  };

  const HeaderIcon = config.icon;

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container max-w-3xl py-12 md:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-primary/5 border-2 flex items-center justify-center">
            <HeaderIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">{config.eyebrow}</p>
            <h1 className="text-xl font-black uppercase tracking-tighter">{config.title}</h1>
          </div>
        </div>

        <Card className="border-2 rounded-[32px] shadow-xl bg-background overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-10">
            <WizardStepper steps={stepperLabels} current={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="min-h-[320px]"
              >
                {current?.kind === 'form' && (
                  <div className="space-y-6">
                    <StepHeader icon={current.icon} title={current.title} sub={current.sub} />
                    <div className="grid sm:grid-cols-2 gap-5">
                      {current.fields.map((field) => (
                        <FieldControl key={field.key} field={field} value={values[field.key] ?? ''} onChange={(v) => setValue(field.key, v)} />
                      ))}
                    </div>
                  </div>
                )}

                {current?.kind === 'docs' && (
                  <div className="space-y-6">
                    <StepHeader icon={current.icon} title={current.title} sub={current.sub} />
                    <div className="space-y-3">
                      {current.docs.map((doc) => (
                        <DocRow key={doc.key} label={doc.label} hint={doc.hint} fileName={docs[doc.key]} onPick={(name) => setDocs((d) => ({ ...d, [doc.key]: name }))} />
                      ))}
                    </div>
                  </div>
                )}

                {step === screeningStep && (
                  <div className="space-y-8 py-4">
                    <StepHeader icon={ScanFace} title={config.screening.title} sub={config.screening.sub} />
                    <div className="space-y-4">
                      {checks.map((label, i) => (
                        <div key={label} className="flex items-center gap-4">
                          <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all',
                            i < checkIndex ? 'bg-emerald-500 text-white' : i === checkIndex ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                            {i < checkIndex ? <CheckCircle2 className="h-4 w-4" /> : i === checkIndex ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-[9px] font-black">{i + 1}</span>}
                          </div>
                          <span className={cn('text-sm font-bold', i <= checkIndex ? 'text-foreground' : 'text-muted-foreground opacity-50')}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <Progress value={((checkIndex + 1) / checks.length) * 100} className="h-1.5 bg-muted rounded-full" />
                  </div>
                )}

                {step === doneStep && (
                  <div className="text-center space-y-8 py-6">
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      className="h-24 w-24 rounded-[32px] bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                      <Clock className="h-12 w-12 text-primary" />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{config.success.title}</h2>
                      <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">{config.success.blurb}</p>
                    </div>
                    {submitRef && (
                      <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 max-w-lg mx-auto">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Your application reference</p>
                        <p className="text-lg font-black tracking-tight text-primary tabular-nums">{submitRef}</p>
                      </div>
                    )}
                    {submitError && (
                      <div className="flex items-center gap-2 p-4 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 max-w-lg mx-auto text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-bold text-left">We recorded your details for review, but could not confirm a reference. Our team will still follow up.</p>
                      </div>
                    )}
                    <div className="p-5 rounded-3xl border-2 bg-muted/20 max-w-lg mx-auto">
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed">{config.success.reviewNote}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2 border-t">
              {step > 0 && step < inputSteps.length ? (
                <Button variant="ghost" onClick={back} className="font-black uppercase text-[11px] tracking-widest h-12"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              ) : <span />}

              {step < inputSteps.length - 1 && (
                <Button onClick={next} disabled={!canAdvance} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {isLastInput && (
                <Button onClick={() => void handleSubmit()} disabled={!canAdvance} className="h-12 px-10 font-black uppercase text-[11px] tracking-widest rounded-2xl bg-primary">
                  Submit for Verification <ScanFace className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === screeningStep && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Globe className="h-4 w-4 animate-pulse" /> Screening in progress…</span>
              )}
              {step === doneStep && (
                <div className="ml-auto flex gap-3">
                  <Button variant="outline" onClick={() => router.push(PATHS.LOGIN)} className="h-12 px-6 font-black uppercase text-[11px] tracking-widest rounded-2xl">Sign In</Button>
                  <Button onClick={() => router.push(PATHS.ACCESS_PENDING)} className="h-12 px-8 font-black uppercase text-[11px] tracking-widest rounded-2xl">
                    Track Application <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
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

function FieldControl({ field, value, onChange }: { field: WizardField; value: string; onChange: (v: string) => void }) {
  return (
    <div className={cn('space-y-2', field.full && 'sm:col-span-2')}>
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {field.label}{!field.optional && <span className="text-primary ml-1">*</span>}
      </Label>
      {field.type === 'select' ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : field.type === 'textarea' ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className="border-2 rounded-xl min-h-[88px]" />
      ) : (
        <Input type={field.type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className="h-12 border-2 rounded-xl" />
      )}
    </div>
  );
}

function DocRow({ label, hint, fileName, onPick }: { label: string; hint?: string; fileName?: string; onPick: (name: string) => void }) {
  return (
    <label className={cn('flex items-center justify-between gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-primary/40', fileName ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-muted/20')}>
      <div className="flex items-center gap-3 min-w-0">
        <FileText className={cn('h-5 w-5 shrink-0', fileName ? 'text-emerald-600' : 'text-muted-foreground')} />
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-tight truncate">{label}</p>
          <p className="text-[10px] text-muted-foreground font-medium truncate">{fileName || hint || 'PDF, JPG or PNG — max 10MB'}</p>
        </div>
      </div>
      {fileName ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0">Upload</span>}
      <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f.name); }} />
    </label>
  );
}
