'use client';

/**
 * @file accept-invite/page.tsx
 * @description Public self-service invitation acceptance. Validates the invite token, shows the
 * org / role / invited email (read-only), captures full name + password, then accepts the invite —
 * which sets the session cookies (auto-login) at the gateway. On success we navigate to the
 * dashboard with a hard refresh so the edge middleware observes the freshly-set session cookie.
 *
 * publicAuthApi.* THROWS on error (Error & { code }); every call is wrapped in try/catch and the
 * `code` is mapped to a user-facing message. useSearchParams() forces a Suspense boundary (Next 15).
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ShieldCheck,
  Loader2,
  Lock,
  User,
  Mail,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { publicAuthApi, type InvitePreview } from '@/lib/admin-api';
import { AuthShell } from './_components/auth-shell';
import { AuthField, AuthError } from './_components/auth-fields';

const MIN_PASSWORD_LENGTH = 8;

interface InvitePreviewExt extends InvitePreview {
  fullName?: string | null;
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready'; invite: InvitePreviewExt }
  | { phase: 'error'; message: string; code?: string };

function describeInviteError(code: string | undefined, message: string): string {
  switch (code) {
    case 'TOKEN_EXPIRED':
      return 'This invitation has expired. Ask your organization administrator to send a new one.';
    case 'INVALID_TOKEN':
    case 'NOT_FOUND':
      return 'This invitation link is invalid or has already been used.';
    case 'TOKEN_REVOKED':
    case 'REVOKED':
      return 'This invitation has been revoked. Contact your organization administrator.';
    default:
      return message || 'We could not validate this invitation.';
  }
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('inviteToken') ?? searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';

  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setState({ phase: 'error', message: 'No invitation token was provided in the link.' });
      return;
    }
    (async () => {
      try {
        const invite = (await publicAuthApi.validateInvite(token)) as InvitePreviewExt;
        if (!cancelled) setState({ phase: 'ready', invite });
      } catch (err) {
        const e = err as Error & { code?: string };
        if (!cancelled) {
          setState({ phase: 'error', code: e.code, message: describeInviteError(e.code, e.message) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.phase !== 'ready') return;
    setSubmitError(null);

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement)?.value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value ?? '';
    const confirm = (form.elements.namedItem('confirmPassword') as HTMLInputElement)?.value ?? '';

    if (!fullName) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setSubmitError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setSubmitError('The two passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await publicAuthApi.acceptInvite({
        token,
        email: state.invite.email,
        password,
        fullName,
      });
      // Cookies are now set by the gateway. Show success, then hard-navigate so middleware sees
      // the session cookie and routes the freshly-authenticated user into their dashboard.
      setDone(true);
      setTimeout(() => {
        window.location.assign(PATHS.DASHBOARD);
      }, 900);
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'EMAIL_MISMATCH') {
        setSubmitError('This invitation was issued to a different email address.');
      } else if (e.code === 'TOKEN_EXPIRED') {
        setSubmitError('This invitation expired before it could be accepted. Request a new one.');
      } else if (e.code === 'INVALID_TOKEN' || e.code === 'TOKEN_REVOKED') {
        setSubmitError('This invitation is no longer valid. Request a new one.');
      } else {
        setSubmitError(e.message || 'We could not complete your enrolment. Please try again.');
      }
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <>
        <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Verifying Invitation</CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Authenticating Token
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Validating your invitation…</p>
        </CardContent>
      </>
    );
  }

  // ── Invalid / expired / revoked / missing token ──────────────────────────────
  if (state.phase === 'error') {
    return (
      <>
        <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Invitation Unavailable</CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Token Rejected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-10">
          <div className="flex items-start gap-3 rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-5">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-destructive" />
            <p className="text-sm font-medium text-foreground">{state.message}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-muted/30 pt-8 pb-8 space-y-4">
          <p className="text-[10px] font-bold text-center text-muted-foreground w-full">
            Already have access?{' '}
            <Link href={PATHS.LOGIN} className="text-primary font-black uppercase tracking-widest hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <>
        <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Welcome to Baalvion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-sm font-medium text-muted-foreground text-center">
            Your account is active. Taking you to your dashboard…
          </p>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </>
    );
  }

  // ── Ready: enrolment form ─────────────────────────────────────────────────────
  const { invite } = state;
  return (
    <>
      <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
        <div className="space-y-1">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Accept Invitation</CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Complete Your Enrolment
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-10">
        {/* Read-only invite preview */}
        <div className="rounded-2xl border-2 bg-muted/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Organization</p>
              <p className="font-black truncate">{invite.orgName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Assigned Role</p>
              <p className="font-bold capitalize truncate">{invite.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Invited Email</p>
              <p className="font-bold truncate">{invite.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} method="post" className="space-y-6">
          <AuthField
            id="fullName"
            name="fullName"
            label="Full Name"
            placeholder="Jordan Castellano"
            required
            autoComplete="name"
            defaultValue={invite.fullName ?? ''}
            disabled={submitting}
            icon={User}
          />
          <AuthField
            id="password"
            name="password"
            type="password"
            label="Create Password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            disabled={submitting}
            icon={Lock}
          />
          <AuthField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            disabled={submitting}
            icon={Lock}
          />
          <p className="text-[10px] text-muted-foreground ml-1">
            Use at least {MIN_PASSWORD_LENGTH} characters. Avoid reusing a password from another service.
          </p>

          <AuthError>{submitError}</AuthError>

          <Button
            type="submit"
            className="w-full h-16 font-black uppercase tracking-widest text-base shadow-xl"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
            Activate Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t bg-muted/30 pt-8 pb-8 space-y-4">
        <p className="text-[10px] font-bold text-center text-muted-foreground w-full">
          Already enrolled?{' '}
          <Link href={PATHS.LOGIN} className="text-primary font-black uppercase tracking-widest hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <AuthShell
      brandHeadline={
        <>
          One Identity. <br />Total Trade <br />Command.
        </>
      }
      brandSubcopy="Activate your seat and step into your organization's governed trade infrastructure."
    >
      <Suspense
        fallback={
          <CardContent className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        }
      >
        <AcceptInviteForm />
      </Suspense>
    </AuthShell>
  );
}
