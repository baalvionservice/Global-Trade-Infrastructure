'use client';

/**
 * @file active-sessions.tsx
 * @description Live device/session management backed by trade-service
 * /v1/auth/sessions. Lists the caller's active refresh-token sessions (device,
 * IP, last used) and allows revoking one device or every session.
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor, ShieldOff, RefreshCw } from 'lucide-react';
import { authApi, type DeviceSession } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

function deviceLabel(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const os = /Windows/i.test(ua) ? 'Windows'
    : /Mac OS X|Macintosh/i.test(ua) ? 'macOS'
    : /Android/i.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
    : /Linux/i.test(ua) ? 'Linux'
    : 'Unknown OS';
  const browser = /Edg\//i.test(ua) ? 'Edge'
    : /OPR\/|Opera/i.test(ua) ? 'Opera'
    : /Chrome\//i.test(ua) ? 'Chrome'
    : /Firefox\//i.test(ua) ? 'Firefox'
    : /Safari\//i.test(ua) ? 'Safari'
    : 'API Client';
  return `${os} / ${browser}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ActiveSessionsCard() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setSessions(await authApi.listSessions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const revokeOne = async (id: string) => {
    setBusy(id);
    try {
      const ok = await authApi.revokeSession(id);
      if (ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast({ title: 'Session Revoked', description: 'That device can no longer refresh its session.' });
      } else {
        toast({ variant: 'destructive', title: 'Revoke Failed', description: 'Could not revoke that session.' });
      }
    } finally {
      setBusy(null);
    }
  };

  const revokeAll = async () => {
    setBusy('all');
    try {
      const ok = await authApi.revokeAllSessions();
      if (ok) {
        toast({ title: 'All Sessions Revoked', description: 'Every device must sign in again.' });
        await load();
      } else {
        toast({ variant: 'destructive', title: 'Revoke Failed' });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Sessions</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={load}
          disabled={loading || busy !== null}
          aria-label="Refresh sessions"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions…
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
          No active sessions detected for this identity.
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="flex justify-between items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-3 min-w-0">
                <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="uppercase truncate">{deviceLabel(s.userAgent)}</p>
                  <p className="text-muted-foreground opacity-60 truncate">
                    {s.ip || 'unknown ip'} · {relativeTime(s.lastUsedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.current && (
                  <Badge variant="outline" className="h-5 px-2 text-[8px] font-black uppercase border-emerald-300 text-emerald-600">
                    This Device
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[8px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                  onClick={() => revokeOne(s.id)}
                  disabled={busy !== null}
                >
                  {busy === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Revoke'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        className="w-full h-11 border-2 font-black uppercase text-[9px] tracking-widest text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={revokeAll}
        disabled={busy !== null || loading || sessions.length === 0}
      >
        {busy === 'all' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="mr-2 h-3.5 w-3.5" />}
        Revoke All Sessions
      </Button>
    </Card>
  );
}
