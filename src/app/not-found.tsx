/**
 * Global 404 surface for unmatched routes.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="h-20 w-20 rounded-[28px] border-2 bg-primary/5 flex items-center justify-center">
        <Compass className="h-10 w-10 text-primary opacity-60" />
      </div>
      <div className="space-y-2 max-w-md">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Error 404</p>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Node not found</h1>
        <p className="text-sm text-muted-foreground font-medium">
          The route you requested does not exist on this network. It may have moved or been retired.
        </p>
      </div>
      <Button asChild className="h-12 px-8 font-black uppercase text-[10px] tracking-widest rounded-xl">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </main>
  );
}
