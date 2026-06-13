'use client';

/**
 * @file reset-password/page.tsx
 * @description Public new-password set from a reset token. Reads `token` from the query (Suspense
 * boundary required for useSearchParams in Next 15), validates min length + confirmation locally,
 * then calls publicAuthApi.resetPassword (which throws on invalid/expired token).
 */

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { publicAuthApi } from '@/lib/admin-api';
import { AuthShell } from '../accept-invite/_components/auth-shell';
import { AuthField, AuthError } from '../accept-invite/_components/auth-fields';

const MIN_PASSWORD_LENGTH = 8;

function describeResetError(code: string | undefined, message: string): string {
  switch (code) {
    case 'TOKEN_EXPIRED':
      return 'This reset link has expired. Request a new one from the sign-in page.';
    case 'INVALID_TOKEN':
    case 'NOT_FOUND':
    case 'TOKEN_REVOKED':
      return 'This reset link is invalid or has already been used. Request a new one.';
    default:
      return message || 'We could not reset your password. Please try again.';
  }
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing its token. Request a new link from the sign-in page.');
      return;
    }

    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value ?? '';
    const confirm = (form.elements.namedItem('confirmPassword') as HTMLInputElement)?.value ?? '';

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await publicAuthApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      const e = err as Error & { code?: string };
      setError(describeResetError(e.code, e.message));
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Password Updated</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-sm font-medium text-muted-foreground max-w-sm">
            Your password has been reset. You can now sign in with your new credentials.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-muted/30 pt-8 pb-8">
          <Link href={PATHS.LOGIN} className="w-full">
            <Button className="w-full h-14 font-black uppercase tracking-widest text-sm shadow-xl">
              Proceed to Sign In
            </Button>
          </Link>
        </CardFooter>
      </>
    );
  }

  const missingToken = !token;

  return (
    <>
      <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
        <div className="space-y-1">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Set New Password</CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Secure Your Account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-10">
        {missingToken && (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-5">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-destructive" />
            <p className="text-sm font-medium text-foreground">
              This reset link is missing its token. Request a new one from the sign-in page.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} method="post" className="space-y-6">
          <AuthField
            id="password"
            name="password"
            type="password"
            label="New Password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            disabled={submitting || missingToken}
            icon={KeyRound}
          />
          <AuthField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            disabled={submitting || missingToken}
            icon={Lock}
          />
          <p className="text-[10px] text-muted-foreground ml-1">
            Use at least {MIN_PASSWORD_LENGTH} characters. Avoid reusing a password from another service.
          </p>
          <AuthError>{error}</AuthError>
          <Button
            type="submit"
            className="w-full h-16 font-black uppercase tracking-widest text-base shadow-xl"
            disabled={submitting || missingToken}
          >
            {submitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <KeyRound className="mr-2 h-6 w-6" />}
            Update Password
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t bg-muted/30 pt-8 pb-8">
        <p className="text-[10px] font-bold text-center text-muted-foreground w-full">
          Remembered it?{' '}
          <Link href={PATHS.LOGIN} className="text-primary font-black uppercase tracking-widest hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      brandHeadline={
        <>
          Set A New <br />Access <br />Credential.
        </>
      }
      brandSubcopy="Choose a strong, unique password. Your reset link is single-use and time-bound for institutional safety."
    >
      <Suspense
        fallback={
          <CardContent className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
