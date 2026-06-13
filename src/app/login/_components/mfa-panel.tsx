'use client';

/**
 * @file mfa-panel.tsx
 * @description Second-step MFA panels rendered by the login page after `/auth/login` returns an
 * MFA continuation. Two modes:
 *   - `challenge`  → the user is already enrolled; collect a 6-digit code and verify.
 *   - `enrollment` → force-MFA; show the provisioning material (QR / secret / recovery codes),
 *                    then collect a 6-digit code to activate MFA and auto-log-in.
 *
 * Both modes establish the session cookies on success; the caller hard-navigates afterwards so the
 * AppProvider rehydrates identity from the cookies. Styling matches the Institutional Gateway card.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, AlertCircle, KeyRound, QrCode, ArrowLeft } from 'lucide-react';
import { publicAuthApi } from '@/lib/admin-api';
import type { MfaKind } from './mfa-login';

interface EnrollmentMaterial {
  qrCodeUrl: string;
  secret: string;
  recoveryCodes: string[];
}

interface MfaPanelProps {
  kind: MfaKind;
  challengeToken: string;
  /** Called once cookies are established (the caller hard-navigates to the dashboard). */
  onComplete: () => void;
  /** Return to the credential form. */
  onCancel: () => void;
}

function friendlyError(err: unknown): string {
  const code = (err as Error & { code?: string }).code;
  const message = (err as Error).message;
  if (code === 'INVALID_MFA_CODE') return 'That code is incorrect. Check your authenticator app and try again.';
  if (code === 'MFA_CHALLENGE_EXPIRED') return 'This verification window has expired. Please sign in again.';
  if (code === 'VALIDATION_ERROR') return 'Enter the full 6-digit code from your authenticator app.';
  return message || 'Verification failed. Please try again.';
}

export function MfaPanel({ kind, challengeToken, onComplete, onCancel }: MfaPanelProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enrolment-only: provisioning material fetched lazily on first render of the enrol panel.
  const [material, setMaterial] = useState<EnrollmentMaterial | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [loadingMaterial, setLoadingMaterial] = useState(kind === 'enrollment');

  // Fetch the QR + secret + recovery codes once when the enrolment panel mounts.
  if (kind === 'enrollment' && material === null && materialError === null && loadingMaterial) {
    // Kick off exactly once; subsequent renders short-circuit via the loadingMaterial guard.
    setLoadingMaterial(false);
    void (async () => {
      try {
        const m = await publicAuthApi.mfaEnrollStart(challengeToken);
        setMaterial(m);
      } catch (err) {
        setMaterialError(friendlyError(err));
      }
    })();
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (kind === 'enrollment') {
        await publicAuthApi.mfaEnrollComplete(challengeToken, code);
      } else {
        await publicAuthApi.mfaChallenge(challengeToken, code);
      }
      onComplete();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const title = kind === 'enrollment' ? 'Enrol Multi-Factor' : 'Verify Identity';
  const blurb =
    kind === 'enrollment'
      ? 'Your organization requires multi-factor authentication. Scan the code with your authenticator app, then confirm the 6-digit code.'
      : 'Enter the 6-digit code from your authenticator app to complete sign-in.';

  return (
    <div className="space-y-8 pt-2">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">{title}</h2>
        <p className="text-sm font-medium text-muted-foreground">{blurb}</p>
      </div>

      {kind === 'enrollment' && (
        <div className="space-y-4">
          {loadingMaterial && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating your secure key…
            </div>
          )}
          {materialError && (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{materialError}</span>
            </div>
          )}
          {material && (
            <div className="space-y-4">
              {material.qrCodeUrl?.startsWith('data:') ? (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={material.qrCodeUrl}
                    alt="MFA enrolment QR code"
                    width={180}
                    height={180}
                    className="rounded-xl border-2 bg-white p-2"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm">
                  <QrCode className="h-5 w-5" /> Add this key to your authenticator app:
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secret Key</Label>
                <code className="block w-full break-all rounded-lg border-2 bg-muted/20 px-4 py-3 text-center text-sm font-bold tracking-wider">
                  {material.secret}
                </code>
              </div>
              {material.recoveryCodes?.length > 0 && (
                <div className="space-y-2 rounded-lg border-2 border-amber-300/60 bg-amber-50/60 p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                    Save these recovery codes
                  </p>
                  <p className="text-[11px] text-amber-700/80">
                    Store them somewhere safe. Each can be used once if you lose your device.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {material.recoveryCodes.map((rc) => (
                      <code key={rc} className="rounded bg-white/70 px-2 py-1 text-center text-xs font-bold tracking-wider">
                        {rc}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} method="post" className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="mfaCode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Authenticator Code
          </Label>
          <div className="relative group">
            <Input
              id="mfaCode"
              name="mfaCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              autoFocus
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-14 pl-12 border-2 font-bold tracking-[0.3em] focus-visible:ring-primary/20 transition-all bg-muted/5 group-hover:bg-background"
            />
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm font-medium">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-16 font-black uppercase tracking-widest text-base shadow-xl"
          disabled={isLoading || code.length !== 6 || (kind === 'enrollment' && !material)}
        >
          {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
          {kind === 'enrollment' ? 'Activate & Authorize' : 'Verify & Authorize'}
        </Button>
      </form>

      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign-in
      </button>
    </div>
  );
}
