'use client';

import { ReactNode } from 'react';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Loader2 } from 'lucide-react';

type Props = {
  children: ReactNode;
};

/**
 * Client-side UX gate for the platform-owner console. auth-service is the authoritative
 * gate (every /platform/* call is enforced server-side); this only avoids rendering a
 * console a non-platform user could never load data into.
 */
export function PlatformGate({ children }: Props) {
  const { isPlatformAdmin, authResolved } = useAppState();

  if (!authResolved) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Resolving authority…
        </p>
      </div>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 bg-muted/20 min-h-screen">
        <Card className="max-w-md border-2 rounded-2xl shadow-xl">
          <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-red-500/20 bg-red-500/10">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Platform authority required</h2>
              <p className="text-sm text-muted-foreground font-medium">
                This console manages every tenant on the platform and is restricted to platform-owner
                authorities. Contact a platform administrator if you believe you should have access.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
