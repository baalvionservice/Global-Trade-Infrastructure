'use client';

/**
 * @file seller/listings/new/page.tsx
 * @description 5-step listing creation wizard (PDF Module 1).
 * Product -> Pricing & MOQ -> Terms -> Compliance & media -> Review & publish.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceService } from '@/services/marketplace-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Tags, Globe, FileCheck, ClipboardCheck, ArrowRight, ArrowLeft,
  Loader2, Sparkles, CheckCircle2, Plus, X,
} from 'lucide-react';

const STEPS = ['Product', 'Pricing', 'Terms', 'Compliance', 'Review'];
const CATEGORIES = ['Electronics', 'Industrial & Metals', 'Energy & Solar', 'Energy Storage', 'Textiles & Apparel', 'Agriculture', 'Chemicals', 'Automotive'];
const INCOTERMS = ['EXW', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP'];
const PAYMENT = ['L/C at sight', '30% advance / 70% B/L', 'Escrow (Baalvion)', 'Open account 60d', 'Trade BNPL'];

export default function NewListingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    title: '', category: '', hsCode: '', description: '',
    basePrice: '', currency: 'USD', unit: 'unit', moq: '', leadTime: '',
    originCountry: '', incoterms: [] as string[], paymentTerms: [] as string[],
    certifications: [] as string[],
  });
  const [certInput, setCertInput] = useState('');
  // Client-only wizard (Radix Select + framer-motion) — render after mount to avoid any
  // SSR/CSR hydration mismatch (React #418) in the production build.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x: string) => x !== v) : [...f[k], v] }));

  const publish = async () => {
    setPublishing(true);
    try {
      await marketplaceService.createListing({
        title: form.title, category: form.category, description: form.description,
        type: 'offer', hsCode: form.hsCode, originCountry: form.originCountry,
        basePrice: Number(form.basePrice) || 0, currency: form.currency, unit: form.unit,
        moq: Number(form.moq) || 0, leadTime: form.leadTime,
        incoterms: form.incoterms, paymentTerms: form.paymentTerms, certifications: form.certifications,
      });
      toast({ title: 'Listing published', description: 'Your offer is now live in the global marketplace.' });
      router.push('/seller/dashboard');
    } catch {
      toast({ variant: 'destructive', title: 'Publish failed' });
    } finally {
      setPublishing(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  if (!mounted) {
    return <main className="flex-1 p-4 md:p-6 bg-muted/20 min-h-screen"><div className="max-w-3xl mx-auto h-[480px] rounded-2xl border bg-background animate-pulse" /></main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary">Seller Console</p>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Create a Listing</h1>
        </div>

        <Card className="border-2 rounded-2xl shadow-xl bg-background overflow-hidden">
          <CardContent className="p-8 md:p-6 space-y-6">
            {/* Stepper */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((label, i) => (
                <div key={label} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', i <= step ? 'bg-primary' : 'bg-muted')} />
              ))}
            </div>
            <p className="text-[9px] font-black uppercase tracking-wide text-muted-foreground">Step {step + 1} / {STEPS.length} — {STEPS[step]}</p>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="min-h-[300px]">
                {step === 0 && (
                  <div className="space-y-6">
                    <Head icon={Package} title="Product basics" sub="What are you offering to the global market?" />
                    <Field label="Listing Title"><Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Monocrystalline Solar PV Modules (550W)" className="h-12 border-2 rounded-xl" /></Field>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Category">
                        <Select value={form.category} onValueChange={(v) => set('category', v)}>
                          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="HS Code">
                        <Input value={form.hsCode} onChange={(e) => set('hsCode', e.target.value)} placeholder="8541.43" className="h-12 border-2 rounded-xl" />
                        <p className="text-[9px] font-bold text-primary flex items-center gap-1 mt-1"><Sparkles className="h-3 w-3" /> AI suggests 8541.43 from your title</p>
                      </Field>
                    </div>
                    <Field label="Description"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Specifications, warranty, packaging…" className="border-2 rounded-xl" /></Field>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <Head icon={Tags} title="Pricing & minimum order" sub="Set your commercial baseline." />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Base Price"><Input type="number" value={form.basePrice} onChange={(e) => set('basePrice', e.target.value)} placeholder="175" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Currency">
                        <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
                          <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>{['USD', 'EUR', 'AED', 'INR', 'CNY', 'SGD'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Unit"><Input value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="unit / MT / container" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Minimum Order Quantity"><Input type="number" value={form.moq} onChange={(e) => set('moq', e.target.value)} placeholder="500" className="h-12 border-2 rounded-xl" /></Field>
                      <Field label="Lead Time" full><Input value={form.leadTime} onChange={(e) => set('leadTime', e.target.value)} placeholder="21–28 days" className="h-12 border-2 rounded-xl" /></Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <Head icon={Globe} title="Trade terms" sub="How will you ship and get paid?" />
                    <Field label="Origin Country">
                      <Select value={form.originCountry} onValueChange={(v) => set('originCountry', v)}>
                        <SelectTrigger className="h-12 border-2 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{['China', 'India', 'Vietnam', 'Turkey', 'United Arab Emirates', 'Germany'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <ChipGroup label="Incoterms Accepted" options={INCOTERMS} selected={form.incoterms} onToggle={(v) => toggle('incoterms', v)} />
                    <ChipGroup label="Payment Terms Accepted" options={PAYMENT} selected={form.paymentTerms} onToggle={(v) => toggle('paymentTerms', v)} />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <Head icon={FileCheck} title="Compliance & media" sub="Verified certifications boost discovery rank." />
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certifications</Label>
                      <div className="flex gap-2">
                        <Input value={certInput} onChange={(e) => setCertInput(e.target.value)} placeholder="e.g. IEC 61215" className="h-12 border-2 rounded-xl"
                          onKeyDown={(e) => { if (e.key === 'Enter' && certInput.trim()) { e.preventDefault(); set('certifications', [...form.certifications, certInput.trim()]); setCertInput(''); } }} />
                        <Button type="button" variant="outline" className="h-12 px-5 border-2 rounded-xl" onClick={() => { if (certInput.trim()) { set('certifications', [...form.certifications, certInput.trim()]); setCertInput(''); } }}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.certifications.map((c: string) => (
                          <Badge key={c} variant="outline" className="text-[10px] font-black border-2 gap-1 pr-1">{c}
                            <button onClick={() => set('certifications', form.certifications.filter((x: string) => x !== c))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer hover:border-primary/40 bg-muted/20">
                      <Package className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm font-black uppercase tracking-tight text-muted-foreground">Upload product & factory images</span>
                      <input type="file" multiple className="hidden" onChange={() => toast({ title: 'Images attached' })} />
                    </label>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <Head icon={ClipboardCheck} title="Review & publish" sub="Confirm before going live to 198 countries." />
                    <Card className="border-2 rounded-2xl bg-muted/20"><CardContent className="p-6 space-y-3 text-sm">
                      <Row k="Title" v={form.title || '—'} />
                      <Row k="Category" v={form.category || '—'} />
                      <Row k="Price" v={form.basePrice ? `${form.currency} ${form.basePrice} / ${form.unit}` : '—'} />
                      <Row k="MOQ" v={form.moq ? `${form.moq} ${form.unit}` : '—'} />
                      <Row k="Origin" v={form.originCountry || '—'} />
                      <Row k="Incoterms" v={form.incoterms.join(', ') || '—'} />
                      <Row k="Certifications" v={form.certifications.join(', ') || '—'} />
                    </CardContent></Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2 border-t">
              {step > 0 ? <Button variant="ghost" onClick={back} className="font-black uppercase text-[11px] tracking-widest h-12"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button> : <span />}
              {step < STEPS.length - 1
                ? <Button onClick={next} className="h-12 px-6 font-black uppercase text-[11px] tracking-widest rounded-2xl">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                : <Button onClick={publish} disabled={publishing} className="h-14 px-6 font-black uppercase text-[12px] tracking-widest rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl">{publishing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />} Publish Listing</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Head({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 rounded-2xl bg-primary/5 border-2 flex items-center justify-center shrink-0"><Icon className="h-6 w-6 text-primary" /></div>
      <div className="space-y-0.5"><h2 className="text-xl font-black uppercase tracking-tighter leading-tight">{title}</h2><p className="text-xs text-muted-foreground font-medium">{sub}</p></div>
    </div>
  );
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={cn('space-y-2', full && 'sm:col-span-2')}><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>{children}</div>;
}
function ChipGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onToggle(o)} className={cn('px-4 h-10 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all', selected.includes(o) ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground hover:border-primary/40')}>{o}</button>
        ))}
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k}</span><span className="font-bold text-right">{v}</span></div>;
}
