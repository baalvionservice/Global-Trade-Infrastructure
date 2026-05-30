'use client';

import { useState, useEffect } from 'react';
import { getKYCStatus, submitKYC, KYCStatus } from '@/services/compliance-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, User, Building, FileUp, CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function KYCPage() {
  const [status, setStatus] = useState<KYCStatus>('not_started');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getKYCStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitKYC({});
      setStatus('pending');
      toast({ title: "KYC Submitted", description: "Your verification is now being reviewed by compliance." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-muted/20">
        <Card className="max-w-lg w-full text-center p-8 shadow-sm">
          <CardContent className="space-y-6 pt-6">
            <div className="h-14 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Verification Pending</h2>
              <p className="text-muted-foreground">
                Our institutional compliance team is currently reviewing your documentation. This typically takes 24–48 hours.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>Refresh Status</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-muted/20">
        <Card className="max-w-lg w-full text-center p-8 shadow-sm border-green-200 bg-green-50/10">
          <CardContent className="space-y-6 pt-6">
            <div className="h-14 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Account Verified</h2>
              <p className="text-muted-foreground">
                Your institution has been successfully verified. You now have full access to platform liquidity and trade settlements.
              </p>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
              <a href="/dashboard">Return to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Institutional Verification (KYC)</h2>
          <p className="text-muted-foreground">Ensure platform integrity and regulatory alignment by completing your institutional profile.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between px-2 max-w-2xl">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors",
                step >= s ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
              )}>
                {s}
              </div>
              {s < 3 && <div className={cn("h-0.5 w-12 sm:w-24 bg-muted", step > s && "bg-primary")} />}
            </div>
          ))}
        </div>

        <Card className="shadow-sm border">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Representative Details
                </CardTitle>
                <CardDescription>Personal information of the authorized platform representative.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Legal Name</Label>
                    <Input placeholder="As per government ID" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Input placeholder="e.g. Singaporean" />
                  </div>
                  <div className="space-y-2">
                    <Label>Official Email</Label>
                    <Input type="email" placeholder="institution@email.com" />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" /> Company Credentials
                </CardTitle>
                <CardDescription>Official business registration and jurisdictional details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Registration Number (UEN)</Label>
                    <Input placeholder="e.g. 201201234K" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Incorporation</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>HQ Address</Label>
                    <Input placeholder="Street, City, Postcode" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Residency</Label>
                    <Input placeholder="Primary Jurisdiction" />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-primary" /> Document Upload
                </CardTitle>
                <CardDescription>Provide high-resolution scans of your institutional documentation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2 hover:bg-accent/5 transition-colors">
                     <p className="text-sm font-semibold">Government Issued ID (Representative)</p>
                     <p className="text-xs text-muted-foreground">Passport or National ID card. Max 5MB PDF/JPG.</p>
                     <Button variant="outline" size="sm">Select File</Button>
                  </div>
                  <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2 hover:bg-accent/5 transition-colors">
                     <p className="text-sm font-semibold">Business License / Certificate of Inc.</p>
                     <p className="text-xs text-muted-foreground">Certified copy of registration. Max 5MB PDF.</p>
                     <Button variant="outline" size="sm">Select File</Button>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3 text-orange-700">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Ensure all documents are clearly legible and currently valid. Expired or blurred documents will result in application rejection.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="bg-muted/30 border-t justify-between p-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || submitting}>Back</Button>
            {step < 3 ? (
              <Button onClick={handleNext}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Submit for Verification
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
