'use client';

/**
 * @file governance/onboarding/page.tsx
 * @description Onboarding Review Queue — the admin counterpart to the public
 * department wizards. Institutions that complete a wizard land here as `pending`
 * organizations; approvers activate or reject them. Reads the live queue from the
 * authenticated platform surface and degrades gracefully when unavailable.
 */

import { useCallback, useEffect, useState } from 'react';
import { onboardingService, type OnboardingStatus } from '@/services/onboarding-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Landmark, Globe, Truck, Boxes, ShieldCheck, RefreshCw, Loader2, Check, X,
  AlertTriangle, Inbox, Clock, type LucideIcon,
} from 'lucide-react';

const TYPE_META: Record<string, { icon: LucideIcon; label: string; tone: string }> = {
  bank: { icon: Landmark, label: 'Banking', tone: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  government: { icon: Globe, label: 'Customs / Gov', tone: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  logistics: { icon: Truck, label: 'Logistics', tone: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  enterprise: { icon: Boxes, label: 'Enterprise', tone: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
};

function typeMeta(t: string) {
  return TYPE_META[t] ?? { icon: Boxes, label: t || 'Other', tone: 'text-muted-foreground bg-muted border-border' };
}

export default function OnboardingReviewQueuePage() {
  const [queue, setQueue] = useState<OnboardingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueue(await onboardingService.getOnboardingQueue());
    } catch {
      setError('Could not reach the onboarding service. The review queue is unavailable right now.');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      if (action === 'approve') await onboardingService.approve(id);
      else await onboardingService.reject(id);
      setQueue((q) => q.filter((item) => item.companyId !== id));
    } catch {
      setError(`Failed to ${action} the application. Please retry.`);
    } finally {
      setBusyId(null);
    }
  };

  const counts = queue.reduce<Record<string, number>>((acc, item) => {
    acc[item.tenantType] = (acc[item.tenantType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto bg-muted/10 min-h-screen">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Governance · Onboarding
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Onboarding Review Queue</h1>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl">
            Institutions that completed a department wizard land here for review. Approving activates the organization; rejecting never grants access.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading} className="h-11 font-black uppercase text-[11px] tracking-widest rounded-2xl">
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Inbox} label="Pending" value={queue.length} accent="text-primary" />
        {(['bank', 'government', 'logistics'] as const).map((t) => {
          const m = typeMeta(t);
          return <StatTile key={t} icon={m.icon} label={m.label} value={counts[t] ?? 0} accent={m.tone.split(' ')[0]} />;
        })}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-32 rounded-[28px] border-2 bg-muted/20 animate-pulse" />)}</div>
      ) : queue.length === 0 && !error ? (
        <Card className="border-2 border-dashed rounded-[32px]">
          <CardContent className="py-20 text-center space-y-3">
            <Inbox className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-lg font-black uppercase tracking-tight">Queue is clear</h3>
            <p className="text-sm text-muted-foreground font-medium">No institutions are awaiting review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => {
            const m = typeMeta(item.tenantType);
            const busy = busyId === item.companyId;
            return (
              <Card key={item.companyId} className="border-2 rounded-[28px] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn('h-12 w-12 rounded-2xl border-2 flex items-center justify-center shrink-0', m.tone)}>
                      <m.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg font-black uppercase tracking-tight truncate">{item.institutionName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn('text-[9px] font-black uppercase tracking-widest border', m.tone)}>{m.label}</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.phase.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void act(item.companyId, 'reject')}
                      className="h-10 font-black uppercase text-[10px] tracking-widest rounded-xl border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="mr-1.5 h-4 w-4" /> Reject</>}
                    </Button>
                    <Button size="sm" disabled={busy} onClick={() => void act(item.companyId, 'approve')}
                      className="h-10 font-black uppercase text-[10px] tracking-widest rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1.5 h-4 w-4" /> Approve</>}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Verification Progress</span><span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5 rounded-full" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ChecklistBlock title="Requirements met" items={item.requirementsMet} tone="emerald" />
                    <ChecklistBlock title="Pending actions" items={item.pendingActions} tone="amber" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: number; accent: string }) {
  return (
    <Card className="border-2 rounded-[24px]">
      <CardContent className="p-5 flex items-center gap-4">
        <Icon className={cn('h-7 w-7', accent)} />
        <div>
          <p className="text-2xl font-black tabular-nums">{value}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistBlock({ title, items, tone }: { title: string; items: string[]; tone: 'emerald' | 'amber' }) {
  const dot = tone === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500';
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.length === 0 ? (
          <li className="text-xs text-muted-foreground font-medium opacity-60">—</li>
        ) : items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} /> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
