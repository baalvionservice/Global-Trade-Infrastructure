'use client';

/**
 * Mounts the realtime WebSocket connection for the authenticated dashboard,
 * surfaces a connection indicator, and raises toasts on inbound notifications.
 */
import { useEffect, useState } from 'react';
import { realtime } from '@/lib/realtime';
import { getAccessToken } from '@/lib/api-client';
import { useRealtimeStatus, useRoom } from '@/hooks/use-realtime';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

function readOrgCode(): string | null {
  try {
    const t = getAccessToken(); // in-memory access token (P0: never localStorage)
    return t ? (JSON.parse(atob(t.split('.')[1])).orgCode || null) : null;
  } catch { return null; }
}

export function RealtimeProvider() {
  const { toast } = useToast();
  const status = useRealtimeStatus();
  const [org, setOrg] = useState<string | null>(null);

  useEffect(() => { realtime.connect(); setOrg(readOrgCode()); }, []);

  // Toast on inbound org notifications (skip replayed history on reconnect).
  useRoom(org ? `org:${org}` : null, (evt) => {
    if (evt.event === 'notification' && !evt.replayed) {
      const d = evt.data || {};
      toast({ title: d.title || 'Notification', description: d.message });
    }
  });

  const cfg = status === 'open'
    ? { Icon: Wifi, label: 'Live', cls: 'text-emerald-600 border-emerald-200 bg-emerald-50' }
    : status === 'connecting'
      ? { Icon: Loader2, label: 'Reconnecting', cls: 'text-amber-600 border-amber-200 bg-amber-50' }
      : { Icon: WifiOff, label: 'Offline', cls: 'text-muted-foreground border-border bg-background' };

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
      <div className={cn('flex items-center gap-2 px-3 h-7 rounded-full border-2 shadow-sm text-[9px] font-black uppercase tracking-widest', cfg.cls)}>
        <cfg.Icon className={cn('h-3 w-3', status === 'connecting' && 'animate-spin')} />
        {cfg.label}
      </div>
    </div>
  );
}
