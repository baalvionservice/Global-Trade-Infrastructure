'use client';

/**
 * Root route error boundary. Catches render/runtime errors in the app tree and
 * presents a branded recovery surface instead of a blank crash.
 */
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the console / future error-reporting sink.
    console.error('[Baalvion] route error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="h-20 w-20 rounded-[28px] border-2 bg-destructive/5 flex items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Something went wrong</h1>
        <p className="text-sm text-muted-foreground font-medium">
          An unexpected error interrupted this view. Your data is safe — you can retry or return to the dashboard.
        </p>
        {error?.digest && (
          <p className="text-[10px] font-mono text-muted-foreground/50 pt-2">REF: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="h-12 px-8 font-black uppercase text-[10px] tracking-widest rounded-xl">
          <RotateCw className="mr-2 h-4 w-4" /> Try again
        </Button>
        <Button variant="outline" onClick={() => { window.location.href = '/dashboard'; }} className="h-12 px-8 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl">
          <Home className="mr-2 h-4 w-4" /> Dashboard
        </Button>
      </div>
    </main>
  );
}
