'use client';

/**
 * @file settings/mfa/page.tsx
 * @description In-dashboard TOTP MFA enrolment. Reads current MFA status from orgAdminApi.me()
 * (mfaEnabled / mfaRequired), then walks the enrol flow: mfaEnable() → show QR + secret + recovery
 * codes → mfaVerify(code) → enabled. orgAdminApi.* returns ApiResponse<T> ({ success, data, error }),
 * so every call is checked via `.success`. Matches the security page's card layout.
 */

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { orgAdminApi } from '@/lib/admin-api';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { MfaQr } from './_components/mfa-qr';

const CODE_LENGTH = 6;

interface EnrolSession {
  qrCodeUrl: string;
  secret: string;
  recoveryCodes: string[];
}

type Phase = 'idle' | 'enrolling' | 'verifying';

export default function MfaSetupPage() {
  const { toast } = useToast();
  const { userId } = useAppState();

  const [statusLoading, setStatusLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [enrol, setEnrol] = useState<EnrolSession | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await orgAdminApi.me();
      if (res.success && res.data) {
        setMfaEnabled(res.data.mfaEnabled);
        setMfaRequired(res.data.mfaRequired);
        setAccountEmail(res.data.email);
      } else {
        setError(res.error?.message || 'Could not load your security status.');
      }
    } catch {
      setError('Could not reach the identity service. Try again shortly.');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleBeginEnrolment = async () => {
    setError(null);
    setPhase('enrolling');
    try {
      const res = await orgAdminApi.mfaEnable();
      if (res.success && res.data) {
        setEnrol({
          qrCodeUrl: res.data.qrCodeUrl,
          secret: res.data.secret,
          recoveryCodes: res.data.recoveryCodes ?? [],
        });
      } else {
        setError(res.error?.message || 'Could not start MFA enrolment.');
        setPhase('idle');
      }
    } catch {
      setError('Could not reach the identity service. Try again shortly.');
      setPhase('idle');
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (trimmed.length < CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code from your authenticator app.`);
      return;
    }
    setPhase('verifying');
    try {
      const res = await orgAdminApi.mfaVerify(trimmed);
      if (res.success) {
        toast({ title: 'MFA Enabled', description: 'Multi-factor authentication is now protecting your account.' });
        setEnrol(null);
        setCode('');
        setPhase('idle');
        await loadStatus();
      } else {
        setError(res.error?.message || 'That code was not accepted. Check your authenticator and try again.');
        setPhase('enrolling');
      }
    } catch {
      setError('Could not reach the identity service. Try again shortly.');
      setPhase('enrolling');
    }
  };

  const copyRecoveryCodes = async () => {
    if (!enrol) return;
    try {
      await navigator.clipboard.writeText(enrol.recoveryCodes.join('\n'));
      toast({ title: 'Recovery codes copied', description: 'Store them somewhere safe and offline.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Select and copy the codes manually.' });
    }
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Protection</p>
        <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Multi-Factor Authentication</h2>
        <p className="text-muted-foreground font-medium italic">
          Add a time-based one-time passcode (TOTP) from an authenticator app as a second factor for your session.
        </p>
      </div>

      {mfaRequired && !mfaEnabled && !statusLoading && (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-warning/30 bg-warning/10 p-6">
          <ShieldAlert className="h-7 w-7 flex-shrink-0 text-warning" />
          <div className="space-y-1">
            <p className="font-black uppercase tracking-tight text-sm">Enrolment Required</p>
            <p className="text-sm font-medium text-foreground/80">
              Your organization mandates multi-factor authentication. Complete enrolment now to retain access.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl border-2 rounded-2xl">
            <CardHeader className="bg-muted/10 border-b p-6">
              <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                <Fingerprint className="h-7 w-7 text-primary" /> Authenticator App (TOTP)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {statusLoading ? (
                <div className="flex items-center justify-center gap-3 py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Loading your security status…</span>
                </div>
              ) : mfaEnabled ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-tight">MFA Is Active</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Your account is protected by a time-based one-time passcode. You will be asked for a code at sign-in.
                    </p>
                  </div>
                </div>
              ) : !enrol ? (
                <div className="space-y-6">
                  <p className="text-sm font-medium leading-relaxed text-foreground/80">
                    Use an authenticator app such as Google Authenticator, 1Password, or Authy. When you begin
                    enrolment we will generate a QR code, a manual secret, and one-time recovery codes.
                  </p>
                  {error && (
                    <div className="flex items-start gap-2 text-destructive text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleBeginEnrolment}
                    disabled={phase === 'enrolling'}
                    className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-lg"
                  >
                    {phase === 'enrolling' ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-5 w-5" />
                    )}
                    Enable MFA
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <p className="text-sm font-bold">1. Scan or enter the key in your authenticator app</p>
                    <MfaQr qrCodeUrl={enrol.qrCodeUrl} secret={enrol.secret} />
                  </div>

                  {enrol.recoveryCodes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 rounded-2xl border-2 border-warning/30 bg-warning/10 p-4">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning mt-0.5" />
                        <p className="text-xs font-medium text-foreground/80">
                          <span className="font-black uppercase">Save these recovery codes now.</span> Each can be used
                          once if you lose your authenticator. They will not be shown again.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 bg-slate-950 p-5">
                        {enrol.recoveryCodes.map((rc) => (
                          <span key={rc} className="select-all font-mono text-[12px] text-emerald-400 tracking-wider">
                            {rc}
                          </span>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={copyRecoveryCodes}
                        className="h-11 px-5 font-black uppercase tracking-widest text-[10px]"
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy Recovery Codes
                      </Button>
                    </div>
                  )}

                  <form onSubmit={handleVerify} className="space-y-4">
                    <p className="text-sm font-bold">2. Enter the 6-digit code to confirm</p>
                    <div className="space-y-3">
                      <Label
                        htmlFor="mfaCode"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                      >
                        Authenticator Code
                      </Label>
                      <div className="relative group max-w-xs">
                        <Input
                          id="mfaCode"
                          name="mfaCode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="123456"
                          maxLength={CODE_LENGTH}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                          disabled={phase === 'verifying'}
                          className="h-14 pl-12 border-2 font-bold tracking-[0.3em] focus-visible:ring-primary/20 transition-all bg-muted/5 group-hover:bg-background"
                        />
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    {error && (
                      <div className="flex items-start gap-2 text-destructive text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={phase === 'verifying'}
                      className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-lg"
                    >
                      {phase === 'verifying' ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-2 h-5 w-5" />
                      )}
                      Verify &amp; Enable
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status rail */}
        <div className="space-y-8">
          <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125">
              <ShieldCheck className="h-48 w-48 brightness-0 invert" />
            </div>
            <CardHeader className="pb-4 relative border-b border-white/10 px-8 py-8">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-white" />
                MFA Posture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative space-y-6">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase opacity-60">Status</span>
                {statusLoading ? (
                  <Loader2 className="h-7 w-7 animate-spin text-white/80" />
                ) : (
                  <p
                    className={`text-3xl font-black tracking-tighter ${
                      mfaEnabled ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                  >
                    {mfaEnabled ? 'PROTECTED' : 'NOT ENROLLED'}
                  </p>
                )}
              </div>
              {accountEmail && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase opacity-60">Account</span>
                  <p className="text-sm font-bold truncate">{accountEmail}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant={mfaRequired ? 'warning' : 'secondary'}>
                  {mfaRequired ? 'Required by org' : 'Optional'}
                </Badge>
                {mfaEnabled && <Badge variant="success">Enabled</Badge>}
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                {mfaEnabled
                  ? 'A second factor is required at every sign-in for this account.'
                  : 'Enrol a TOTP authenticator to add a second layer of protection to your session.'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 rounded-2xl">
            <CardHeader className="bg-muted/10 border-b p-6">
              <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-primary" /> User
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Identity</p>
              <p className="font-mono text-xs break-all">{userId}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
