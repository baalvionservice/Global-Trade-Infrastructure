
'use client';

/**
 * @file login/page.tsx
 * @description Hardened Institutional Gateway.
 * Finalized: Integrated with global AppProvider to synchronize authority state before navigation.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { BaalvionLogo } from '@/components/icons';
import { ShieldCheck, Lock, Loader2, Globe, AlertCircle } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { safeInternalPath } from '@/lib/safe-redirect';
import { isMfaRequiredError, type MfaKind } from './_components/mfa-login';
import { MfaPanel } from './_components/mfa-panel';
import { motion } from 'framer-motion';

interface MfaFlow {
  kind: MfaKind;
  challengeToken: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mfaFlow, setMfaFlow] = useState<MfaFlow | null>(null);
  const router = useRouter();
  const { login } = useAppState();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
    try {
      // login() resolves the caller's ORGANIZATION-TYPE dashboard (or persona home for legacy
      // accounts). An explicit ?redirect= wins (deep-link gate); otherwise the user lands on their
      // own org dashboard — never a generic shared one. The raw param is validated same-origin
      // (open-redirect / CWE-601 defense) before we ever navigate to it.
      const dashboardHome = await login(email, password);
      const rawRedirect = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
      router.push(rawRedirect ? safeInternalPath(rawRedirect, dashboardHome) : dashboardHome);
    } catch (err) {
      // MFA continuation: the credentials were accepted but a second factor is required (verify an
      // existing enrolment, or enrol now under a force-MFA policy). Hand off to the MFA panel.
      if (isMfaRequiredError(err)) {
        setMfaFlow({ kind: err.kind, challengeToken: err.challengeToken });
        setLoginError(null);
        setIsLoading(false);
        return;
      }
      const code = (err as Error & { code?: string }).code;
      const message = (err as Error).message;
      if (code === 'ACCOUNT_LOCKED') {
        setLoginError(message || 'Account temporarily locked after repeated failed attempts. Try again later.');
      } else if (code === 'UNAUTHORIZED' || code === 'HTTP_401' || code === 'FORBIDDEN' || code === 'BAD_REQUEST') {
        setLoginError(message || 'Invalid credentials.');
      } else {
        // No demo fallback: a failed or unreachable login surfaces a real error — never silent access.
        setLoginError(message || 'Unable to reach the identity service. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // On MFA completion the session cookies are set by the gateway. Hard-navigate so the AppProvider
  // rehydrates identity from the cookies (no stale in-memory session). An explicit ?redirect= wins.
  const handleMfaComplete = () => {
    const rawRedirect = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect')
      : null;
    const dest = rawRedirect ? safeInternalPath(rawRedirect, PATHS.DASHBOARD) : PATHS.DASHBOARD;
    window.location.assign(dest);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary selection:text-white">
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-primary text-primary-foreground relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" 
        />
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10"
        >
          <Link href={PATHS.HOME} className="flex items-center gap-4 group">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform">
               <BaalvionLogo className="h-10 w-10 brightness-0 invert" />
            </div>
            <span className="text-3xl font-black uppercase tracking-tighter">Baalvion</span>
          </Link>
        </motion.div>

        <div className="relative z-10 space-y-8 max-w-xl">
          <motion.h1 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black leading-[0.9] tracking-tighter uppercase"
          >
            The Operating <br />System for <br />Global Trade.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-medium leading-relaxed italic"
          >
            Connect trade execution, finance, compliance, and logistics within a single governed infrastructure.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">
           <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-400" /> Baalvion Sentinel Active</span>
           <span>v4.2.0-stable</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-muted/20 relative">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[460px] relative z-10"
        >
          <Card className="shadow-2xl border-2 ring-1 ring-black/5 overflow-hidden">
            <CardHeader className="space-y-4 pb-10 pt-10 text-center border-b bg-muted/10">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter">Institutional Gateway</CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  Secure Identity Authorization
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-10">
              {mfaFlow ? (
                <MfaPanel
                  kind={mfaFlow.kind}
                  challengeToken={mfaFlow.challengeToken}
                  onComplete={handleMfaComplete}
                  onCancel={() => { setMfaFlow(null); setLoginError(null); }}
                />
              ) : (
                /* method="post" is a safety net: if a submit fires before React hydrates (slow/failed JS),
                   the browser's native fallback sends credentials in the POST body instead of leaking them
                   into the URL/history via the default GET. Once hydrated, handleLogin's preventDefault wins. */
                <form onSubmit={handleLogin} method="post" className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Corporate Identifier</Label>
                    <div className="relative group">
                       <Input
                         id="email"
                         name="email"
                         type="email"
                         placeholder="institution@email.gov"
                         required
                         className="h-14 pl-12 border-2 font-bold focus-visible:ring-primary/20 transition-all bg-muted/5 group-hover:bg-background"
                       />
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Token</Label>
                    <div className="relative group">
                       <Input
                         id="password"
                         name="password"
                         type="password"
                         placeholder="••••••••"
                         required
                         className="h-14 pl-12 border-2 font-bold focus-visible:ring-primary/20 transition-all bg-muted/5 group-hover:bg-background"
                       />
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  <Button type="submit" className="w-full h-16 font-black uppercase tracking-widest text-base shadow-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
                    Authorize Session
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col border-t bg-muted/30 pt-8 pb-8 space-y-4">
              <p className="text-[10px] font-bold text-center text-muted-foreground w-full">
                New to Baalvion? <Link href={PATHS.ONBOARD} className="text-primary font-black uppercase tracking-widest hover:underline">Get Verified</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
