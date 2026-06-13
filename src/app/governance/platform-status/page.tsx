'use client';

/**
 * @file governance/platform-status/page.tsx
 * @description Platform Build Status — the single source of truth for what's done
 * across every navigation category and subcategory. It reads the REAL route
 * registry (src/core/routes.ts) so it can never drift from the actual nav, and
 * overlays a curated build status per route. Update STATUS_OVERRIDES as routes
 * are wired to live backends; everything else defaults to "UI built".
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ROUTE_REGISTRY, CATEGORY_ORDER, type RouteCategory } from '@/core/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap, LayoutGrid, CircleDashed, ExternalLink, Activity } from 'lucide-react';

type Status = 'live' | 'beta' | 'ui' | 'planned';

const STATUS_META: Record<Status, { label: string; desc: string; tone: string; dot: string }> = {
  live: { label: 'Live', desc: 'Built and verified — UI wired to a live backend and exercised end to end.', tone: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  beta: { label: 'Wired · Beta', desc: 'Connected to a live backend and in validation.', tone: 'text-sky-600 bg-sky-500/10 border-sky-500/20', dot: 'bg-sky-500' },
  ui: { label: 'UI Built', desc: 'Interface built; live-data wiring not yet verified.', tone: 'text-amber-600 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500' },
  planned: { label: 'Planned', desc: 'Route reserved; not built yet.', tone: 'text-muted-foreground bg-muted border-border', dot: 'bg-muted-foreground/40' },
};

const ORDER: Status[] = ['live', 'beta', 'ui', 'planned'];

// Curated build status. Anything not listed defaults to 'ui' (interface exists,
// backend wiring unverified). Keep this honest and refine it per audit.
const STATUS_OVERRIDES: Record<string, Status> = {
  // Verified / wired this track
  '/governance/onboarding': 'live',
  // Wired to live trade backend (validated in prior work)
  '/orders': 'beta',
  '/trade-management': 'beta',
  '/trade-ops': 'beta',
  '/dashboard': 'beta',
  '/governance/platform-admin': 'beta',
  '/governance/organizations': 'beta',
  '/governance/bank-admin': 'beta',
  // Finance & Treasury sprint (2026-06-11): wired to the financial-services-java system of record
  // via /finance-bff (ledger :13014, payment :13015, wallet :13039, settlement :13018). Verified
  // end to end through the gateway with a live session — payment->ledger double-entry POSTED, and
  // multi-currency wallet balances + ledger stream render from real tenant-scoped data.
  '/payments': 'live',                 // Module 5 — Payment Tracking
  '/payments/transactions': 'live',    // Module 4 — Multi-Currency Ledger
  '/financials/treasury': 'live',      // Module 6 — Treasury Dashboard
  '/finance-settlement': 'live',       // Treasury settlement view (same live services)
  // Module 1 Invoice Management + Module 2 Accounts Receivable + Module 3 Accounts Payable — all
  // delivered on the existing Invoice Center route (AR/AP are tabs), wired to the new invoice-service
  // (:13021) via /finance-bff. Verified E2E: create->issue->partial payment, real metrics + aging.
  '/financials/invoices': 'live',
  // Adjacent finance surfaces brought online in the same sprint: their financial-services-java
  // backends (trade-finance :13036, credit :13037) are now running and reachable via /finance-bff
  // (endpoints return 200). Marked beta = wired to a live backend, pending data-exercised validation.
  '/financials/trade-finance': 'beta',
  '/financials/credit-lines': 'beta',
};

const statusOf = (path: string): Status => STATUS_OVERRIDES[path] ?? 'ui';

export default function PlatformStatusPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const byCategory = useMemo(() => {
    const map = new Map<RouteCategory, typeof ROUTE_REGISTRY>();
    for (const r of ROUTE_REGISTRY) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return map;
  }, []);

  const totals = useMemo(() => {
    const t: Record<Status, number> = { live: 0, beta: 0, ui: 0, planned: 0 };
    for (const r of ROUTE_REGISTRY) t[statusOf(r.path)] += 1;
    return t;
  }, []);

  const total = ROUTE_REGISTRY.length;
  const donePct = Math.round(((totals.live + totals.beta) / Math.max(total, 1)) * 100);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto bg-muted/10 min-h-screen">
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
          <Activity className="h-4 w-4" /> Governance · Platform Status
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Build Status — Every Category</h1>
        <p className="text-sm text-muted-foreground font-medium max-w-3xl">
          Generated live from the navigation registry — {total} operational routes across {CATEGORY_ORDER.length} categories.
          Status is a curated assessment of what is wired to a live backend versus interface-only; refine it as work lands.
        </p>
      </div>

      {/* Overall rollup */}
      <Card className="border-2 rounded-[28px]">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live or wired</span>
            <span className="text-2xl font-black tabular-nums">{donePct}%</span>
          </div>
          <Progress value={donePct} className="h-2 rounded-full" />
          <div className="flex flex-wrap gap-3 pt-1">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`All ${total}`} dot="bg-foreground/40" />
            {ORDER.map((s) => (
              <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} label={`${STATUS_META[s].label} ${totals[s]}`} dot={STATUS_META[s].dot} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ORDER.map((s) => (
          <div key={s} className={cn('p-4 rounded-2xl border', STATUS_META[s].tone)}>
            <div className="flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />
              <span className="text-[11px] font-black uppercase tracking-widest">{STATUS_META[s].label}</span>
            </div>
            <p className="text-[11px] font-medium mt-1.5 opacity-80 leading-snug">{STATUS_META[s].desc}</p>
          </div>
        ))}
      </div>

      {/* Per-category breakdown */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map(({ key, label }) => {
          const routes = (byCategory.get(key) ?? []).filter((r) => filter === 'all' || statusOf(r.path) === filter);
          if (routes.length === 0) return null;
          const catTotal = (byCategory.get(key) ?? []).length;
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-tight">{label}</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{routes.length} of {catTotal}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {routes.map((r) => {
                  const s = statusOf(r.path);
                  const Icon = (typeof r.icon === 'function' ? r.icon : LayoutGrid) as React.ElementType;
                  return (
                    <Link key={r.path} href={r.path} className="group">
                      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border-2 bg-background hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn('h-9 w-9 rounded-xl border flex items-center justify-center shrink-0', STATUS_META[s].tone)}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight truncate">{r.label}</p>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">{r.path}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={cn('text-[8px] font-black uppercase tracking-widest border', STATUS_META[s].tone)}>{STATUS_META[s].label}</Badge>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, dot }: { active: boolean; onClick: () => void; label: string; dot: string }) {
  return (
    <Button variant={active ? 'default' : 'outline'} onClick={onClick} className="h-9 px-4 font-black uppercase text-[10px] tracking-widest rounded-full">
      <span className={cn('h-2 w-2 rounded-full mr-2', dot)} /> {label}
    </Button>
  );
}
