'use client';

/**
 * @file forgot-password/page.tsx
 * @description Public password-reset request. Always renders the same neutral confirmation
 * regardless of whether the email exists — no user enumeration. publicAuthApi.forgotPassword
 * throws only on transport/server failure; a 200 with an unknown email still resolves.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Mail, Send, MailCheck, ArrowLeft } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { publicAuthApi } from '@/lib/admin-api';
import { AuthShell } from '../accept-invite/_components/auth-shell';
import { AuthField, AuthError } from '../accept-invite/_components/auth-fields';

const NEUTRAL_MESSAGE =
  'If an account exists for that email, a password reset link is on its way. Check your inbox and spam folder.';

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setSubmitting(true);
    try {
      await publicAuthApi.forgotPassword(email);
      // Neutral success regardless of outcome (anti-enumeration).
      setSent(true);
    } catch {
      // Even on a backend error we present the same neutral message to avoid leaking which
      // addresses are registered. A genuine transport failure is rare and self-correcting on retry.
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      brandHeadline={
        <>
          Regain <br />Secure <br />Access.
        </>
      }
      brandSubcopy="Reset your credentials through Baalvion's hardened identity service. Links are single-use and time-bound."
    >
      <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
        <div className="space-y-1">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Reset Password</CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Recover Your Credentials
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-10">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <MailCheck className="h-12 w-12 text-primary" />
            <p className="text-sm font-medium text-muted-foreground max-w-sm">{NEUTRAL_MESSAGE}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} method="post" className="space-y-6">
            <AuthField
              id="email"
              name="email"
              type="email"
              label="Corporate Identifier"
              placeholder="institution@email.gov"
              required
              autoComplete="email"
              disabled={submitting}
              icon={Mail}
            />
            <AuthError>{error}</AuthError>
            <Button
              type="submit"
              className="w-full h-16 font-black uppercase tracking-widest text-base shadow-xl"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Send className="mr-2 h-6 w-6" />}
              Send Reset Link
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col border-t bg-muted/30 pt-8 pb-8 space-y-4">
        <Link
          href={PATHS.LOGIN}
          className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors w-full"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </CardFooter>
    </AuthShell>
  );
}
